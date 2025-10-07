from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import shap
import joblib
import numpy as np
import pandas as pd
from typing import List
from xgboost import XGBClassifier
from sklearn.datasets import load_iris

model = XGBClassifier()
model.load_model('best_model_iris.ubj')
explainer = shap.TreeExplainer(model)


# # Load the Iris dataset
# iris = load_iris()
# X, y = iris.data, iris.target


# X_input = pd.DataFrame(X)

X_input = [[0,10,20,30]]
# Prediction
proba = model.predict_proba(X_input)[0]
pred_class = int(np.argmax(proba))
certainty = float(np.max(proba))


# SHAP values
shap_vals = explainer.shap_values(pd.DataFrame(X_input))
shap_values = shap_vals[0][:, pred_class]

print(shap_vals[0][:, pred_class])
# print(shap_vals.shape)
# print(np.squeeze(shap_vals))

if isinstance(shap_vals[0], (list, np.ndarray)):
    shap_values = shap_vals[0][:, pred_class]

print(shap_values)
# Pair with feature names
feature_names = [
    "Sepal Length",
    "Sepal Width",
    "Petal Length",
    "Petal Width"
  ]
shap_values = list(shap_values)
feature_contributions = list(zip(feature_names, shap_values))
print(feature_contributions)

# Sort by absolute contribution
top_contributions = sorted(feature_contributions, key=lambda x: x[1], reverse=True)[:10]

print(top_contributions)



