#Mock API for a medical ML dashboard with SHAP, certainty, and calibration

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from contextlib import asynccontextmanager
from pydantic import BaseModel
import shap
import joblib
import numpy as np
import pandas as pd
from typing import List
from scipy.special import expit 
from xgboost import XGBClassifier
import xgboost as xgb
import graphviz
from io import BytesIO
import fitz  # PyMuPDF
import re
import math
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from utils.config_features import EXPECTED_FEATURES#, EXPECTED_UNITS, RANGES, SYNONYMS
# from utils.parser import (
#     extract_text_native, extract_with_ocr, normalize_units,
#     clamp_and_flag, canonize, ureg
# )
from utils.parser import extract_text_native

# I expect 59 futures in general

class ManualInput(BaseModel):
    model_type: str            # this has to match a key in model_config
    features: Dict[str, Any] 


model_config = {
    #MAG7
    "Central Nervous System Parenchymal Malignancy": {
        "pipeline": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/MAG_7_XGBClassifier_Feature2_Fold1.pkl",
        "scaler": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/MAG_7_scaler_Feature2_Fold1.pkl",
    },
    #MAG6
    "Central Nervous System Leptomeningeal Malignancy": {
        "pipeline": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/MAG_6_XGBClassifier_Feature2_Fold2.pkl",
        "scaler": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/MAG_6_scaler_Feature2_Fold2.pkl",
    },
    #INF1
    "Central Nervous System Autoimmune Inflammatory Disease": {
        "pipeline": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/INF_1_XGBClassifier_Feature1_Fold1.pkl",
        "scaler": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/INF_1_scaler_Feature1_Fold1.pkl",
    },
    #INF3
    "Central Nervous System Infectious Disease": {
        "pipeline": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/INF_3_XGBClassifier_Feature1_Fold1.pkl",
        "scaler": "/Users/ceylanm/Documents/CSF/fake_mockup/models_scalers/INF_3_scaler_Feature1_Fold1.pkl",
    }
}

model = None
classifier = None
scaler = None
explainer = None


@asynccontextmanager
async def lifespan(app: FastAPI):

    yield 

    print("Cleanup logic can go here if needed")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ocr_tesseract_from_pix(pix):
    # minimal OCR stub to keep everything on-prem (fill if you need OCR)
    # return pytesseract.image_to_string(Image.open(io.BytesIO(pix.tobytes())))
    return ""

def is_text_native(pdf_bytes: bytes) -> bool:
    try:
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for p in doc:
            if p.get_text("text").strip(): return True
        return False
    except:
        return False
    
def to_json_safe_scalar(v):
    # convert numpy scalars to Python types
    if isinstance(v, (np.floating, np.integer)):
        v = v.item()
    # turn NaN/Inf into None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v

#TODO: Here is reading the original PDF
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), model_type: str = Form(...)):

    global selected_model_key
    selected_model_key = model_type  # store selected use case
    try:


        # Read and parse PDF
        pdf_bytes = await file.read()

        # Extract
        try:
            if is_text_native(pdf_bytes):
                print("----TEXT NATIVE-----")
                fields = extract_text_native(pdf_bytes)
                print("Fields", fields)
            else:
                print("----OCR-----")
                #fields = extract_with_ocr(pdf_bytes, ocr_fn=ocr_tesseract_from_pix)
                print("Fields", fields)
        except Exception as e:
            raise HTTPException(500, detail=f"Extraction failed: {e}")

        df = pd.DataFrame([fields])

        print("DATAFRAME:", df)
        print("Length of DF", len(df.columns))
        global uploaded_df
        uploaded_df = df

        # a) JSON-safe row values
        values_json = [to_json_safe_scalar(v) for v in df.iloc[0].tolist()]

        # b) JSON-safe preview (dicts)
        df_json = (
            df.replace([np.inf, -np.inf], np.nan)   # Inf -> NaN first
            .astype(object)                       # allow None in numeric cols
            .where(pd.notna(df), None)            # NaN -> None
        )
        preview_json = df_json.to_dict(orient="records")

        return {
            "status": "success",
            "message": f"{file.filename} uploaded and parsed successfully.",
            "columns": uploaded_df.columns.tolist(),
            "values": values_json, #uploaded_df.iloc[0].tolist(),
            "preview": preview_json,#uploaded_df.head().to_dict(orient="records")  # JSON-serializable
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
    

@app.post("/predict")
def predict():

    global selected_model_key, uploaded_df

    if uploaded_df is None or selected_model_key is None:
        raise HTTPException(status_code=400, detail="Missing uploaded data or model type.")

    config = model_config.get(selected_model_key)
    if config is None:
        raise HTTPException(status_code=400, detail=f"Unknown model type: {selected_model_key}")

    try:
        # Load model + scaler
        pipeline = joblib.load(config["pipeline"])
        scaler = joblib.load(config["scaler"])

        classifier = pipeline.named_steps["classification"]
        selector = pipeline.named_steps["feature_selection"]
        selected_features = selector.get_support()

        features = uploaded_df.columns
        final_feature_names = [name for name, selected in zip(features, selected_features) if selected]

        X_scaled = scaler.transform(uploaded_df) #(1,59)

        print("Scaled Data", X_scaled)
        
        # Getting column indices
        feat_inds = [uploaded_df.columns.get_loc(c) for c in final_feature_names if c in uploaded_df.columns]        
        X_selected = X_scaled[:, feat_inds]

        proba = classifier.predict_proba(X_selected)[0]
        print("Probabilities:", proba)

        pred_class = int(np.argmax(proba))
        print("Prediction Class:", pred_class)

        certainty = float(np.max(proba))
        print("Certainty:", certainty)

        explainer = shap.TreeExplainer(classifier)
        print("explainer", explainer)
        # SHAP values
        shap_vals = explainer.shap_values(X_selected)
        print("Shap vals:", shap_vals.shape)
        log_odds = explainer.expected_value + shap_vals.sum()
        probability = expit(log_odds)
        print("Probabilities", probability)

        feature_contributions = list(zip(final_feature_names, [float(val) for val in shap_vals.flatten()]))
        print("Feature Contributions", feature_contributions)
        top_contributions = sorted(feature_contributions, key=lambda x: abs(x[1]), reverse=True)[:10]
        print("Top Contributions", top_contributions)


        raw_shap_values = shap_vals.flatten()
        abs_total = sum(abs(v) for v in raw_shap_values)

        # Compute percentage contributions
        percentage_contributions = [
            (name, abs(val) / abs_total * 100) for name, val in zip(final_feature_names, raw_shap_values)
        ]

        # Sort by highest contribution (absolute value) and keep top 10
        top_percentage_contributions = sorted(percentage_contributions, key=lambda x: x[1], reverse=False)[:]
        print("Percentage Contributions", top_percentage_contributions)
        
        # Build JSON-safe parsed features (NaN/Inf -> None) for the response
        df_json = (
            uploaded_df.replace([np.inf, -np.inf], np.nan)
                       .astype(object)
                       .where(pd.notna(uploaded_df), None)
        )
        preview_json = df_json.to_dict(orient="records")


        return {
            "predicted_class": pred_class,
            "certainty": certainty,
            "class_probabilities": proba.tolist(),
            "top_shap_values": top_contributions, #[(str(name), float(value)) for name, value in top_percentage_contributions]  #top_contributions
            "parsed_features": preview_json #uploaded_df.iloc[0].to_dict(),  # <- this line!
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/set-features")
def set_features(payload: ManualInput):
    """
    Minimal endpoint: save manual data exactly like /upload-pdf/ does.
    Then /predict can be called as-is.
    """
    try:
        global selected_model_key, uploaded_df
        selected_model_key = payload.model_type
        uploaded_df = pd.DataFrame([payload.features])
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Setting features failed: {str(e)}")