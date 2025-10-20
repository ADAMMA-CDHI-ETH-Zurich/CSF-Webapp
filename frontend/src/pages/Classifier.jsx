import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,Cell, ReferenceLine
} from "recharts";
import { Upload, CheckCircle2, Download, FileText, Brain, Activity, Bold } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getExpectedFeatures,
  buildManualPayload,
  getModelLabel,           
  normalizeModelKey,REQUIRED_FIELDS, diffFeatures, FEATURE_REQUIRED_INF1,
  FEATURE_REQUIRED_INF3,
  FEATURE_REQUIRED_MAG6,
  FEATURE_REQUIRED_MAG7,EXPECTED_FEATURES, TEMPLATE_FEATURES, FEATURE_UNITS, FEATURE_LABEL_EN, TITLE_LABEL_EN} from "../normalization";
import { useToast } from "../components/ToastProvider";

//connect to backend TODO: change this to actual link once hosted at eth 
const api = axios.create({
  baseURL: "http://localhost:8000", 
});

const DISEASES = [
  { id: "MAG7", label: "Central Nervous System Parenchymal Malignancy" },
  { id: "MAG6", label: "Central Nervous System Leptomeningeal Malignancy" },
  { id: "INF1", label: "Central Nervous System Autoimmune Inflammatory Disease" },
  { id: "INF3", label: "Central Nervous System Infectious Disease" },
];

// removed hard coded features, and added them to a normalization.js file
const isEmpty = (v) => v === "" || v === null || v === undefined;

//useful to match model config keys to the labels above 
// now included normalization from backend information

const COLORS = {
  primary:  "#000000", // black for text
  muted:    "#e2e8f0", 
  positive: "#233e62", // for positive values
  negative: "#950606", // negative values
  accent:   "#f0f6ff", // header ribbon on the app.js page
  annotation: "#ffffff"
};
const LABEL_INSIDE_MIN = 40;

const MODEL_NAME_MAP = {
      MAG7: "Central Nervous System Parenchymal Malignancy",
      MAG6: "Central Nervous System Leptomeningeal Malignancy",
      INF3: "Central Nervous System Infectious Disease",
      INF1: "Central Nervous System Autoimmune Inflammatory Disease",
    };

const AXIS_TICK = { fontSize: 12 };      // unify font size across plots
const Y_AXIS_WIDTH = 150;

function useStickyState(key, initialValue, storage = window.localStorage) {
    const [state, setState] = useState(() => {
        try {
        const raw = storage.getItem(key);
        return raw != null ? JSON.parse(raw) : initialValue;
        } catch {
        return initialValue;
        }
    });
    useEffect(() => {
        try { storage.setItem(key, JSON.stringify(state)); } catch {}
    }, [key, state, storage]);
    return [state, setState];
  }

export default function Classifier() {
  const [disease, setDisease] = useStickyState("cls:disease", "", window.sessionStorage);
  const [showFeaturePanel, setShowFeaturePanel] = useStickyState("cls:showPanel", false, window.sessionStorage);
  const [globalFeatures, setGlobalFeatures] = useStickyState("cls:globalFeatures", [], window.sessionStorage); // added this to maintain state even when switching usecase

  const [backendExpectedFeatures, setBackendExpectedFeatures] = useState([]); // ALL
  const [displayedExpectedFeatures, setDisplayedExpectedFeatures] = useState([]); // UI subset
  const [features, setFeatures] = useStickyState("cls:features", [], window.sessionStorage);
  const [featureGroups, setFeatureGroups] = useState([]);  // new feature groups
  const [isParsing, setIsParsing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [lang, setLang] = useStickyState("cls:lang", "en", window.sessionStorage); // if you want EN default
  // Results
  const [probability, setProbability] = useStickyState("cls:prob", null, window.sessionStorage);
  const [predClass, setPredClass] = useStickyState("cls:predclass", null, window.sessionStorage); // ← NEW
  const [shapValues, setShapValues] = useStickyState("cls:shap", [], window.sessionStorage);
  const hasResults = probability !== null;
  const templateSectionRef = useRef(null);
  const validationSectionRef = useRef(null);

  // For PDF export
  const reportRef = useRef(null);
  const printRef = useRef(null);
  const predChartRef = useRef(null);
  const shapChartRef = useRef(null);

  const flattenGroupFeatures = (groups) =>
    groups.flatMap((g) => g.features);

  useEffect(() => {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const isReload = nav && nav.type === "reload";
    if (isReload) {
      sessionStorage.removeItem("cls:disease");
      sessionStorage.removeItem("cls:features");
      sessionStorage.removeItem("cls:globalFeatures");
      sessionStorage.removeItem("cls:prob");
      sessionStorage.removeItem("cls:shap");
      sessionStorage.removeItem("cls:showPanel");
      
    }
  }, []); // run once at mount

//helper to add the units of mmt . 

const name_mapping = (name) => {
    const normalized = name.trim().toUpperCase();
    // hardcoding these two 
    if (normalized === "GESCHLECHT") return lang === "en" ? "Gender" : "Geschlecht";
    if (normalized === "ALTER_J" || normalized === "ALTER") return lang === "en" ? "Age" : "Alter";
    if (lang === "en") return FEATURE_LABEL_EN[name] ?? name;
    return name;
  };

const toast = useToast();
const title_mapping = (title) => (lang === "en" ? (TITLE_LABEL_EN[title] ?? title) : title);
const unitOf = (name) => FEATURE_UNITS?.[name] ?? "";

  // % filled based on *required* features for the current disease
  const requiredNames = useMemo(
    () => flattenGroupFeatures(featureGroups),
    [featureGroups]
  );
  const filledPct = useMemo(() => {
    const total = requiredNames.length || 0;
    if (!total) return 0;
    const byName = new Map(globalFeatures.map(f => [f.name, f.value]));
    let filled = 0;
    for (const name of requiredNames) {
      const v = byName.has(name) ? byName.get(name) : "";
      const missing =
        v == null ||
        (typeof v === "number" && Number.isNaN(v)) ||
        (typeof v !== "number" && String(v).trim() === "");
      if (!missing) filled += 1;
    }
    return Math.round((filled / total) * 100);
  }, [requiredNames, globalFeatures]);



    // About text visibility: initially under buttons; after results, moves below plots
  const AboutBlock = (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl p-6 md:p-8 space-y-4 text-sm">
    <section ref={templateSectionRef}>
      <h2 className="text-xl font-semibold text-[#1e293b]">Prediction Reliability Notice</h2>
    </section>
      <div className="w-full">
        <div className="text-sm text-slate-700 leading-6">
          <p>Please note that machine learning models can produce uncertain predictions and make mistakes. <strong>Do not use the results for clinical diagnosis or patient management.</strong></p>
          <p>
            {" "}
                <span
                    className={
                    "font-semibold " +
                    (filledPct < 50
                        ? "text-red-700"      // low completeness → red
                        : filledPct < 80
                        ? "text-amber-600"    // medium → amber
                        : "text-green-600")   // high → green
                    }
                >
                    {filledPct}%
                </span>{" "}
            of patient features are provided.
            For more precise and confident predictions, please add more measurements where possible.</p>
            {/* </div> */}
            <ResultSummaryText
            diseaseId={disease}
            probability={probability}
            shapValues={shapValues}
            lang={lang}
            mapName={name_mapping}
            predClass={predClass} //NEW
            />
        </div>
      </div>
    </section>
  );
  const nowStr = useMemo(() => new Date().toLocaleString(), []);

  // Open features panel (manual entry) without uploading
  const handlePopulateManually = () => {
    setShowFeaturePanel(true);
    afterPaint(() => scrollToRef(templateSectionRef));
  };

  // added this to get a list of the features that were filled, without printing the featuregrid itself.
  const nonEmptyFeatures = useMemo(() => {
  
    return globalFeatures
    .filter(({ value }) => !(value == null || String(value).trim() === ""))
    .map(({ name, value }) => ({
      name: name_mapping(name),
      value: String(value),
      unit: unitOf(name),
    }));
}, [globalFeatures, lang]);

const groupedMeasurements = useMemo(() => {
  const byName = new Map(globalFeatures.map((f) => [f.name, f.value]));
  const groups = featureGroups
    .map((g) => {
      const items = g.features
        .map((name) => {
          const v = byName.get(name);
          if (v == null || String(v).trim() === "") return null;
          return {
            name: name_mapping(name),         // localized measurement name
            value: String(v),
            unit: unitOf(name),
          };
        })
        .filter(Boolean);
      // group title localization if provided
      const title = g.title 

      return { title, items };
    })
    .filter((g) => g.items.length > 0); // drop empty groups
  return groups;
}, [globalFeatures, featureGroups, lang]);

  // Load template data quickly
  const handleTryTemplate = () => {
  
    const templ = TEMPLATE_FEATURES;
    setFeatures(templ);
    setGlobalFeatures((prev) => {
      const next = [...prev];
      templ.forEach(({ name, value }) => {
        const i = next.findIndex((f) => f.name === name);
        if (i >= 0) next[i] = { ...next[i], value };
        else next.push({ name, value });
      });
      return next;
    });
  
    setShowFeaturePanel(true);
    afterPaint(() => scrollToRef(templateSectionRef));
  };
  
    // initialize the backend features 
    useEffect(() => {
    setBackendExpectedFeatures(EXPECTED_FEATURES);
  }, []);


//helpers to scroll
const scrollToTop = () => {
   const el = validationSectionRef.current;
   if (!el) return;
   // Defer to next paint so layout/state changes don’t cancel the animation
   requestAnimationFrame(() =>
     requestAnimationFrame(() =>
       el.scrollIntoView({ behavior: "smooth", block: "start" })
     )
   );
 };

const scrollToRef = (ref) => {
  const el = ref.current;
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // If not mounted yet, try again on the next frame
    requestAnimationFrame(() => scrollToRef(ref));
  }
};
//make sure scrolling happens after filling the data 
const afterPaint = (fn) =>
  requestAnimationFrame(() => requestAnimationFrame(fn));

const groupsForDisease = (d) => {
  if (d === "INF3") return FEATURE_REQUIRED_INF3;
  if (d === "MAG6") return FEATURE_REQUIRED_MAG6;
  if (d === "MAG7") return FEATURE_REQUIRED_MAG7;
  return FEATURE_REQUIRED_INF1;
}


// PDF upload 
const handlePdfUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setIsParsing(true);
  try {
    const form = new FormData();
    form.append("file", file);
    
    const model_type = getModelLabel(disease); //long label
    form.append("model_type", model_type);
    console.log(form)
    
    
    const { data } = await api.post("/upload-pdf/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend returns: { columns: [], values: [], preview: [] }
    const columns = Array.isArray(data?.columns) ? data.columns : [];
    const values  = Array.isArray(data?.values)  ? data.values  : [];
    const parsedMap = new Map(columns.map((c, i) => [c, values[i]]));

    // Merge into existing features; also add any new ones from backend
    const mergedKnown = displayedExpectedFeatures.map((name) => {
      const current = features.find((f) => f.name === name)?.value ?? "";
      return {
        name,
        value: parsedMap.has(name) ? parsedMap.get(name) : current,
        };
    });

    const existingNames = new Set(mergedKnown.map((f) => f.name));
    const extras = columns
      .filter((c) => !existingNames.has(c))
      .map((c) => ({ name: c, value: parsedMap.get(c) ?? "" }));

    // setFeatures([...mergedKnown, ...extras]);
    const merged = [...mergedKnown, ...extras];
    setFeatures(merged);
    // write every parsed value into the global store
    setGlobalFeatures((prev) => {
      const next = [...prev];
      merged.forEach(({ name, value }) => {
        const i = next.findIndex((f) => f.name === name);
        if (i >= 0) next[i] = { ...next[i], value };
        else next.push({ name, value });
      });
      return next;
    });
    setShowFeaturePanel(true);
    afterPaint(() => scrollToRef(templateSectionRef));
    toast.success("PDF parsed successfully. You can review and adjust the values.");
  } catch (err) {
    console.error(err);
    toast.error("Parsing failed. You can still fill values manually.");
    alert("Parsing failed. You can still fill values manually.");
    setShowFeaturePanel(true);
    afterPaint(() => scrollToRef(templateSectionRef));
  } finally {
    setIsParsing(false);
    e.target.value = "";
  }
};


  // Change a single feature value
  //TODO: decide whether to recompute model prediction on every new feature value
const updateFeature = (idx, value) => {
  setFeatures((prev) => {
    const copy = [...prev];
    copy[idx] = { ...copy[idx], value };

    // also update global store
    setGlobalFeatures((prevGlobal) => {
      const g = [...prevGlobal];
      const i = g.findIndex((f) => f.name === copy[idx].name);
      if (i >= 0) g[i] = { ...g[i], value };
      else g.push({ name: copy[idx].name, value });
      return g;
    });

    return copy;
  });
};

const prevDiseaseRef = useRef();
// when a different use case is selected, change the disease, get the other features and show them in the frontend. Don't load them into backend!
useEffect(() => {
  if (!disease) return;

  const groups = groupsForDisease(disease);
  setFeatureGroups(groups);
  const ordered = flattenGroupFeatures(groups)
  setDisplayedExpectedFeatures(ordered);

  // reuse global values if available
  setFeatures(
    ordered.map((name) => {
      const match = globalFeatures.find((f) => f.name === name);
      return { name, value: match ? match.value : "" };
    })
  );

  // Only clear results if disease changed AFTER the initial mount
  if (prevDiseaseRef.current !== undefined && prevDiseaseRef.current !== disease) {
    setProbability(null);
    setShapValues([]);
  }
  // Only when the user *actually* changes disease:
  if (prevDiseaseRef.current !== undefined && prevDiseaseRef.current !== disease) {
// 1) Clear prediction/SHAP so plots & summary disappear
    setProbability(null);
    setShapValues([]);

}

  prevDiseaseRef.current = disease;

}, [disease, globalFeatures]);

  // When clicking Validate -> calls backends predict endpoint 
const handleValidate = async () => {
  scrollToTop();
  setIsPredicting(true);
  try {
    const payload = buildManualPayload(disease, backendExpectedFeatures, features);
    // pass all features here, even the ones that are not used. 
    await api.post("/set-features", payload);
    console.log(payload)
    const { data } = await api.post("/predict", { model_type: payload.model_type });
    setPredClass(data?.predicted_class ?? null); // ← NEW

     // Keep the backend's probability as-is (probability of the predicted class)
    const rawProb =
    typeof data?.probability === "number" ? data.probability :
    typeof data?.score === "number" ? data.score :
    typeof data?.certainty === "number" ? data.certainty :
    null;
    setProbability(rawProb);

    const shapPairs = Array.isArray(data?.top_shap_values) ? data.top_shap_values : [];
    const parsed = shapPairs.map(([feature, value]) => ({ feature, value: Number(value) }));
    const absTotal = parsed.reduce((s, d) => s + Math.abs(d.value), 0) || 1;
    const withMeta = parsed.map(d => ({
      ...d,
      abs_value: Math.abs(d.value),
      percent: (Math.abs(d.value) / absTotal) * 100
    }));
    const top = withMeta.slice().sort((a, b) => b.abs_value - a.abs_value).slice(0, 10);
    const ordered = top.slice().sort((a, b) => b.value - a.value); // 10,5,...,0,-1,-3,...
    setShapValues(ordered);
    toast.success("Validation complete.");
  } catch (err) {
    toast.error("Validation failed.");
    console.error("Predict error:", err?.response?.data || err);
    setProbability(null);
  } finally {
    setIsPredicting(false);
  }
};

  // Download PDF report
  const handleDownload = async () => {
    if (!hasResults) return;

    const predEl = predChartRef.current;
    const shapEl = shapChartRef.current;
    if (!predEl || !shapEl) {
      alert("Charts not ready yet.");
      return;
    }

    // Snapshot the two visible chart containers
    // to be used later
    const [predCanvas, shapCanvas] = await Promise.all([
      html2canvas(predEl, { scale: 2, backgroundColor: "#ffffff" }),
      html2canvas(shapEl, { scale: 2, backgroundColor: "#ffffff" }),
    ]);

    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });

    const toBase64 = (buf) => {
        let binary = "";
        const bytes = new Uint8Array(buf);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      };
      
    const fontResp = await fetch("/fonts/NotoSans-Regular.ttf"); // served from public/
    const fontBuf  = await fontResp.arrayBuffer();
    pdf.addFileToVFS("NotoSans-Regular.ttf", toBase64(fontBuf));
    pdf.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    pdf.setFont("NotoSans", "normal"); // ← after this, all pdf.text uses NotoSans

    pdf.setFont("NotoSans", "normal");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    let y = margin;

    // Title + subtitle
    const title = (DISEASES.find((d) => d.id === disease)?.label) || "Dashboard Report";
    // increased spacing
    pdf.setFontSize(14);
    pdf.text(`Disease Category: ${title}`, pageWidth / 2, y, { align: "center" });
    y += 9; // +2 mm more spacing

    pdf.setFontSize(10);
      pdf.text(`Generated: ${nowStr}`, pageWidth / 2, y, { align: "center" });
      y += 10; // +4 mm more spacing before next section
  // added the reliability disclaimer (not sure if this is necessary)
    pdf.setFontSize(8);

    const boxX = margin; // left edge of content
    const boxW = pageWidth - margin * 2;// full content width
    const padX = 3; // horizontal padding inside the box
    const padY = 3;  // vertical padding inside the box
    const lineH = 4; // line height (mm)

    const disclaimerLines = [
      "Prediction Reliability Notice:",`${filledPct}% of patient features were provided.`,"Predictions from machine-learning models can be wrong. Add more measurements for greater precision and confidence.",
      "Do not use the results for clinical diagnosis or patient management."
    ];

    // Wrap each line to the box width (minus padding)
    const wrapped = disclaimerLines.flatMap((ln) =>
      pdf.splitTextToSize(ln, boxW - padX * 2)
    );

    // Measure box height
    const boxH = wrapped.length * lineH + padY * 2;

    // New page if needed
    if (y + boxH > pageHeight - margin) { pdf.addPage(); y = margin; }

    // Added color to the background of the titles
    pdf.setDrawColor(226, 232, 240);   
    pdf.setFillColor(254, 242, 242); 
    pdf.setLineWidth(0.2);
    pdf.rect(boxX, y, boxW, boxH, "FD");

    // Print text inside the box
    pdf.setTextColor(30, 41, 59);      // slate-800
    let ty = y + padY + 3;             // a little top padding
    wrapped.forEach((ln) => {
      pdf.text(ln, boxX + padX, ty);   // left-aligned inside the full-width box
      ty += lineH;
    });

    // added more room below the banner
    y += boxH + 6;
    // Added the Prediction charts
    const gutter = 6;
    const colW = (pageWidth - margin * 2 - gutter) / 2;
    const maxChartH = 60; // mm cap to keep charts compact

    // Scaled heights 
    const predH = Math.min(maxChartH, (predCanvas.height * colW) / predCanvas.width);
    const shapH = Math.min(maxChartH, (shapCanvas.height * colW) / shapCanvas.width);

    const chartsBlockH = Math.max(predH, shapH) + 8;
    if (y + chartsBlockH > pageHeight - margin) { pdf.addPage(); y = margin; }

    // Titles of the plots
    pdf.setFontSize(10);
    pdf.text("Prediction", margin,y);
    pdf.text("Top SHAP Features",margin + colW + gutter, y);
    y += 4;

    // Pictures of the plots
    pdf.addImage(predCanvas.toDataURL("image/png"), "PNG", margin, y, colW, predH);
    pdf.addImage(shapCanvas.toDataURL("image/png"), "PNG", margin + colW + gutter, y, colW, shapH);

    // Advance y by tallest image
    y += Math.max(predH, shapH) + 4;

    // ---- Result summary (plain text for PDF) ----
    {
        const isPos = String(predClass) === "1" || String(predClass).toLowerCase() === "positive"; // ← CHANGED
        const pct   = (typeof probability === "number") ? Math.round(probability * 100) : null;
      
        // top 3 toward/away
        const posTop = shapValues.filter(d => d.value > 0).slice(0, 3).map(d => name_mapping(d.feature));
        const negTop = shapValues.filter(d => d.value < 0).sort((a, b) => a.value - b.value).slice(0, 3).map(d => name_mapping(d.feature));
        const join   = (xs) => xs.join(", ");
      
        const summaryTitle = "Summary";
        const modelLabel = (DISEASES.find(d => d.id === disease)?.label) || "Selected Use Case";
      
        // Compose lines (plain text)
        const line1 = `For the disease category ${modelLabel}, the prediction is ${pct !== null ? pct + "% " : ""}${isPos ? "Positive" : "Negative"}.`;
        const line2 = `The most impactful features towards positive: ${join(posTop) || "—"}.`;
        const line3 = `The most impactful features away from positive: ${join(negTop) || "—"}.`;
      
        const margin = 12;
        const pageWidth  = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const boxX  = margin;
        const boxW  = pageWidth - margin * 2;
        const padX  = 4;
        const padY  = 4;
        const lineH = 4;
      
        // Measure and wrap
        pdf.setFontSize(9);
        const currentFontSize = pdf.getFontSize(); // CHANGED
        const titleWrapped = pdf.splitTextToSize(summaryTitle, boxW - padX * 2);
        const bodyWrapped = [
          ...pdf.splitTextToSize(line1, boxW - padX * 2),
          ...pdf.splitTextToSize(line2, boxW - padX * 2),
          ...pdf.splitTextToSize(line3, boxW - padX * 2),
        ];
      
        const boxH = padY + titleWrapped.length * lineH + 2 + bodyWrapped.length * lineH + padY;
      
        // New page if needed      
        // Draw box (plain stroke, no fill color)
        pdf.setLineWidth(0.2);
        pdf.rect(boxX, y, boxW, boxH);
      
        // Title
        pdf.setFontSize(10);
        let ty = y + padY + 3;
        titleWrapped.forEach((ln) => { pdf.text(ln, boxX + padX, ty); ty += lineH; });
      
        // Body
        pdf.setFontSize(8);
        ty += 2; // small gap after title
        bodyWrapped.forEach((ln) => { pdf.text(ln, boxX + padX, ty); ty += lineH; });
      
        // advance cursor
        y += boxH + 6;
      }

    // printed Mesurements 
  if (groupedMeasurements.length) {
    pdf.setFontSize(10);
    const headingText = lang === "en" ? "Entered Patient Measurements" : "Eingetragene Messwerte";
    if (y + 6 > pageHeight - margin) { pdf.addPage(); y = margin; }
    pdf.text(headingText, margin, y);
    y += 5;

    pdf.setFontSize(8);
    const colW = (pageWidth - margin * 2 - gutter) / 2;

    // Inside each column: we split the name from the value
    const nameRatio = 0.55;
    const nameColW = colW * nameRatio;
    const valueColW = colW * (1 - nameRatio);
    const rowH = 5; // base row height

    const colStartX = [margin, margin + colW + gutter];

    // Simple balancing: assign each WHOLE group to the shorter column
    const columns = [[], []]; // arrays of groups
    const estHeights = [y, y];
    for (const g of groupedMeasurements) {
      // Estimate height: header + rows
      // gaps between groups 
      const est = 6 + g.items.length * rowH + 2 ;
      const idx = estHeights[0] <= estHeights[1] ? 0 : 1;
      columns[idx].push(g);
      estHeights[idx] += est;
    }

    // for each group column we do: 
    const drawGroupsColumn = (groups, startX) => {
      let cy = y;
      const drawGroupHeader = (title) => { // this is the title 
        const headerH = 6;
        if (cy + headerH > pageHeight - margin) { pdf.addPage(); cy = margin; }
        // added shading to the background
        pdf.setFillColor(248, 250, 252); // gray-50
        pdf.setDrawColor(226, 232, 240); 
        pdf.rect(startX, cy, colW, headerH, "FD");
        pdf.text(title_mapping(title), startX + 2, cy + 4);
        pdf.setTextColor(0, 0, 0);
        cy += headerH + 1;
      };
      // this now contains the values
        const drawRow = (m) => {
          const nameLines = pdf.splitTextToSize(m.name, nameColW);
          const valStr = `${m.value}${m.unit ? ` ${m.unit}` : ""}`;
          const valueLines = pdf.splitTextToSize(valStr, valueColW);
          const lines = Math.max(nameLines.length, valueLines.length);
          const cellH = Math.max(rowH, lines * 4);

          if (cy + cellH > pageHeight - margin) { pdf.addPage(); cy = margin; }
          let ty = cy + 3;
          nameLines.forEach((line) => { pdf.text(line, startX, ty); ty += 4; });
          ty = cy + 3;
          valueLines.forEach((line) => { pdf.text(line, startX + nameColW + 1, ty); ty += 4; });
          cy += cellH;
        };

        for (const g of groups) {
          drawGroupHeader(g.title);
          for (const m of g.items) drawRow(m);
          cy += 2; // space between groups
        }

        return cy;
      };

    const endYLeft  = drawGroupsColumn(columns[0], colStartX[0]);
    const endYRight = drawGroupsColumn(columns[1], colStartX[1]);
    y = Math.max(endYLeft, endYRight) + 2;
  }// Move y below whichever column is taller, for any future content, maybe not necessary. 
    pdf.save("dashboard-report.pdf");
  };

  const predictionData = useMemo(() => {
       if (probability === null || predClass == null) return [];
       const isPos = String(predClass) === "1" || String(predClass).toLowerCase() === "positive";
       return isPos
         ? [
             { name: "Negative", value: 1 - probability },
             { name: "Positive", value: probability },
           ]
         : [
             { name: "Negative", value: probability },
             { name: "Positive", value: 1 - probability },
           ];
     }, [probability, predClass]);

  return (
    <section className="space-y-6">
    {/* Top bar with title + disease + two buttons to populate data */}
        <div className="text-center mt-4">
        <div className="inline-flex items-center gap-3">    
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-800">
            <section ref={validationSectionRef}>
            Zurich Classifier
            </section>
        </h1>
        </div>
    </div>

    <div className="inline-grid grid-cols-3 gap-2 w-fit max-w-[28rem]">
    {/* selector spans all 3 columns and matches total button width */}
        <label htmlFor="disease" className="sr-only">Select Use Case</label>
        <select
            id="disease"
            className="col-span-3 border rounded-xl px-3 py-2 hover:shadow-2xl text-sm bg-white w-full"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            aria-label="Select a use case"
            title="Select a use case"
        >
        <option value="" disabled>Select Use Case</option>

        {DISEASES.map((d) => (
        <option key={d.id} value={d.id}>
            {d.label}
        </option>
        ))}
    </select>
    <button
      onClick={handlePopulateManually}
      disabled={!disease}
      aria-disabled={!disease}
      className={`px-3 py-2 rounded-xl text-sm border bg-white
      ${disease
        ? 'bg-[#163b62] text-black hover:bg-[#233e62]/20'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed border'}`}
    >
      Enter your data
    </button>

    <button
      onClick={handleTryTemplate}
      disabled={!disease}
      aria-disabled={!disease}
      className={`px-3 py-2 rounded-xl text-sm border  bg-white
      ${disease
        ? 'bg-[#163b62] text-black hover:bg-[#233e62]/20'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed border'}`}
    >
      Try template data
    </button>

    <button
      onClick={handleDownload}
      disabled={!hasResults}                          // ← disable when no results
      aria-disabled={!hasResults}
    //   className={`inline-flex gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-200
    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-200
        ${hasResults
          ? 'bg-[#233e62] text-white hover:bg-[#233e62]'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed border'}`}
    >
    <Download className="w-4 h-4" />
    Download
    </button>
  {/* </div> */}
</div>
      {/* About – initially under buttons; after results moved below plots */}
      {!hasResults && AboutBlock}

      {/* Results area + (afterwards) features panel */}
      <div ref={reportRef} className="space-y-6">
        {/* Plots appear after validation */}
        
        {hasResults && ( 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prediction bar (binary) problem: if probability is too high, number is cut off => increase height of box?*/}
            <Card title="Prediction" icon={<Activity className="w-4 h-4" />}>
              <div ref={predChartRef} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...predictionData].reverse()} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid horizontal={false} vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_TICK} stroke={COLORS.primary} />
                    <YAxis domain={[0,1]} tick={AXIS_TICK} stroke={COLORS.primary} tickFormatter={(v)=>`${Math.round(v*100)}%`} />
                    <CartesianGrid stroke={COLORS.muted} />
                    <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}> {/* included the new colors */}
                      {[...predictionData].reverse().map((entry, i) => (
                    
                        <Cell
                          key={`pred-${i}`}
                          fill={entry.name === "Positive" ? COLORS.positive : COLORS.negative}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        formatter={(v) => `${Math.round(v * 100)}%`}
                        position="top"
                        style={AXIS_TICK}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* SHAP top features */}
            <Card title="Top SHAP Features" icon={<FileText className="w-4 h-4" />}>
              <div ref={shapChartRef} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...shapValues]} // show largest at top
                    layout="vertical"
                    margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid horizontal={false} vertical={false}/>
                     <CartesianGrid stroke={COLORS.muted} />
                    <XAxis type="number" stroke={COLORS.primary}  tick={AXIS_TICK} />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke={COLORS.primary}
                      width={Y_AXIS_WIDTH}
                      tick={AXIS_TICK}
                      tickFormatter={name_mapping}

                    />
                     <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
                    <Tooltip
                      formatter={(v, _name, ctx) => {
                        const percent = ctx?.payload?.percent != null ? ctx.payload.percent.toFixed(1) : null;
                        const val = Number(v);
                        return [`${val.toFixed(4)}${percent !== null ? `  (${percent}%)` : ""}`, "SHAP"];
                      }}
                    />

                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {[...shapValues].map((d, i) => (
                        <Cell
                          key={`shap-${i}`}
                          fill={d.value >= 0 ? COLORS.positive : COLORS.negative}
                        />
                    ))}                    
                    <LabelList
                    dataKey="value"
                    content={({ value, x, y, width, height }) => {
                        const v = Number(value) || 0;
                        const isPos = v >= 0;

                        const left  = Math.min(x, x + width);
                        const right = Math.max(x, x + width);
                        const barW  = Math.abs(width);

                        const placeInside = barW >= LABEL_INSIDE_MIN;

                        // Inside → sit near true end of the bar; Outside → nudge away from bar
                        const lx = placeInside
                        ? (isPos ? right - 4 : left + 4)       // inside
                        : (isPos ? right + 6 : left - 6);      // outside

                        const anchor = placeInside
                        ? (isPos ? "end" : "start")            // inside
                        : (isPos ? "start" : "end");           // outside

                        const fill = placeInside ? "#ffffff" : (isPos ? COLORS.positive : COLORS.negative);

                        return (
                        <text
                            x={lx}
                            y={y + height / 2}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            style={AXIS_TICK}
                            fill={fill}
                        >
                            {`${isPos ? "+" : ""}${v.toFixed(2)}`}
                        </text>
                        );
                    }}
                    />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
        

        {/* About block moves down once plots are shown */}
        {hasResults && AboutBlock}
        {/* Feature panel (window). Before validation it appears here; after validation it stays visible below results */}
        {showFeaturePanel && (
          <Card
            key={`panel-${disease}`} // forces remount on change of disease
            title="Patient Features"
            subtitle="Upload PDF to auto-extract values or edit manually. Validate to run the model."
            toolbar={ //added a clear button 
              <div className="flex items-center gap-2">
                {/* hover:bg-slate-100  */}
                <label className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm border bg-white hover:bg-[#233e62]/20 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    // setGlobalFeatures([]);
                    // setFeatures(displayedExpectedFeatures.map((n) => ({ name: n, value: "" })));
                       // Reset in memory
                       setGlobalFeatures([]);
                       setFeatures(displayedExpectedFeatures.map((n) => ({ name: n, value: "" })));
                       setProbability(null);
                       setShapValues([]);
                       // Also clear persisted keys
                       localStorage.removeItem("cls:globalFeatures");
                       localStorage.removeItem("cls:features");
                       localStorage.removeItem("cls:prob");
                       localStorage.removeItem("cls:shap");                    
                  }}
                  className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-[#233e62]/20"
                  title="Clear all saved inputs"
                >
                  Clear
                </button>

                <button
                    onClick={() => setLang((l) => (l === "de" ? "en" : "de"))}
                    className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-[#233e62]/20"
                    title="Toggle language (frontend only)"
                >
                    {lang === "de" ? "English" : "Deutsch"}
                </button>
              </div>
              
            }

          >
            <div className="mb-4">
              {isParsing && <p className="text-sm text-gray-500">Parsing PDF…</p>}
            </div>
            {/* <section ref={templateSectionRef}> */}
            <FeatureGrid
                  key={`grid-${disease}`}
                  features={features}
                  groups={featureGroups}
                  onChange={updateFeature}
                  unitOf={unitOf}
                  t={name_mapping}
                  tg={title_mapping}
                  lang={lang}
                />
          {/* </section> */}
          <div className="mt-6 flex items-center justify-end screen-only print-exclude">
              <button
                onClick={handleValidate}
                disabled={isPredicting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                title="Validate values and run model"
              >
                <CheckCircle2 className="w-4 h-4" />

                {isPredicting ? "Validating…" : "Validate values"}
              </button>
            </div>
          </Card>
        )}
      </div>

    </section>
  );
}

// Subcomponents:
// Card : to keep the look of patient features and the prediction plots the same

function Card({ title, subtitle, icon, toolbar, children }) {
  return (
    <div
      className="bg-white border rounded-2xl p-5 md:p-5 
                 shadow-lg hover:shadow-xl 
                 transition-all duration-300 
                 hover:-translate-y-1 
                 overflow-visible"
    >
      {(title || toolbar) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {icon && <span className="p-1.5 rounded-lg bg-gray-50 border">{icon}</span>}
              <h2 className="text-base md:text-lg font-semibold">{title}</h2>
            </div>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}

function FeatureGrid({ features, groups, onChange, t, tg, unitOf, lang }) {
  const byName = useMemo(
    () => new Map(features.map((f, i) => [f.name, { ...f, idx: i }])),
    [features]
  );

  const updateByName = (name, value) => {
    const f = byName.get(name);
    if (!f) return;
    onChange(f.idx, value);
  };

  return (
      <div className="space-y-8 print-exclude">
        {groups.map((group, idx) => (
          <div key={group.title} className="space-y-3 relative">
            <h3 className="text-sm md:text-base font-semibold text-slate-800">
                {tg ? tg(group.title) :group.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {group.features.map((name) => {
              const f = byName.get(name);
              if (!f) return null;

            if (name === "GESCHLECHT") {
                const isEN = lang === "en";
                return (
                  <div key={name} className="flex flex-col">
                    <label className="text-xs font-medium text-black mb-1">
                       {isEN ? "Sex" : "Geschlecht"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={String(f.value ?? "")}
                      onChange={(e) => updateByName(name, e.target.value)}
                      className={[
                        "border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none",
                        isEmpty(f.value)
                          ? "text-gray-400 ring-2 ring-red-400 shadow-[0_0_0.6rem_rgba(248,113,113,0.55)]"
                          : "text-black focus:ring-2 focus:ring-black/10",
                      ].join(" ")}
                    >
                    <option value="">{isEN ? "Please Choose" : "Bitte wählen"}</option>
                    <option value="M">{isEN ? "Male" : "Männlich"}</option>
                    <option value="W">{isEN ? "Female" : "Weiblich"}</option>
                    </select>
                  </div>
                );
              }

              if (name === "ALTER_J") {
                return (
                  <div key={name} className="flex flex-col">
                    <label className="text-xs font-medium text-black-700 mb-1">
                        {lang === "en" ? "Age (years)" : "Alter (Jahre)"} <span className="text-red-500">*</span>
                     </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="eg. 54"
                      value={String(f.value ?? "")}
                      onChange={(e) => updateByName(name, e.target.value)}
                      className={[
                        "border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none",
                        isEmpty(f.value)
                          ? "ring-2 ring-red-400 shadow-[0_0_0.6rem_rgba(248,113,113,0.55)]"
                          : "focus:ring-2 focus:ring-black/10",
                      ].join(" ")}
                    />
                  </div>
                );
              }

              return (
                <div key={name} className="flex flex-col">
                  <label className="text-xs font-medium text-black-600 mb-1">
                     {t(name)}{" "}
                     {unitOf(name) && (
                       <span className="text-gray-400">[{unitOf(name)}]</span>
                     )}
                   </label>
                  <input
                    value={String(f.value ?? "")}
                    onChange={(e) => updateByName(name, e.target.value)}
                    placeholder={lang === "en" ? "Enter value" : "Wert eingeben"}
                    aria-invalid={isEmpty(f.value) ? "true" : "false"}
                    className={[
                      "border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none",
                      isEmpty(f.value)
                        ? "ring-2 ring-red-400 shadow-[0_0_0.6rem_rgba(248,113,113,0.55)]"
                        : "focus:ring-2 focus:ring-black/10"
                  ].join(" ")}
                  />
                </div>
              );
            })}
          </div>
          {/* Added a small line between the group sections */}
          {idx < groups.length - 1 && (
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4" />
      )}
        </div>
      ))}
    </div>
  );
}


function ResultSummaryText({ diseaseId, probability, shapValues, lang, mapName, predClass }) {
    if (probability == null || !Array.isArray(shapValues) || shapValues.length === 0) return null;
  
    const modelLabel = (DISEASES.find(d => d.id === diseaseId)?.label);
    const isPos = String(predClass) === "1" || String(predClass).toLowerCase() === "positive"; // ← CHANGED
    const pct = Math.round(probability * 100);
  
    // Your brand colors
    const POS = "text-[#233e62]";   // deep oxford blue
    const NEG = "text-[#950606]";   // your red
  
    // Top 3 features by sign (already ordered in your code)
    const posTop = shapValues.filter(d => d.value > 0).slice(0, 3).map(d => mapName(d.feature));
    const negTop = shapValues.filter(d => d.value < 0).sort((a, b) => a.value - b.value).slice(0, 3).map(d => mapName(d.feature));
    const join = (xs) => xs.join(", ");
  
    return (
      <p className="mt-2">
          <>
            For the disease category <strong>{modelLabel}</strong>, the prediction is{" "}
            <strong className={isPos ? POS : NEG}>
              {pct}% {isPos ? "Positive" : "Negative"}
            </strong>.{" "}
            The most impactful features{" "}
            <strong className={POS}>towards positive</strong>:{" "}
            <span className={`font-semibold ${POS}`}>{join(posTop)}</span>;{" "}
            <strong className={NEG}>away from positive</strong>:{" "}
            <span className={`font-semibold ${NEG}`}>{join(negTop)}</span>.
          </>
      </p>
    );
  }