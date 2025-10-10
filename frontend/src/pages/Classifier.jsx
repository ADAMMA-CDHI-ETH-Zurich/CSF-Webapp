// src/pages/Classifier.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,Cell
} from "recharts";
import { Upload, CheckCircle2, Download, FileText, Brain, Activity } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


//connect to backend TODO: change this to actual link once hosted at eth 
const api = axios.create({
  baseURL: "http://localhost:8000", 
});

const DISEASES = [
  { id: "d1", label: "Central Nervous System Parenchymal Malignancy" },
  { id: "d2", label: "Central Nervous System Leptomeningeal Malignancy" },
  { id: "d3", label: "Central Nervous System Autoimmune Inflammatory Disease" },
  { id: "d4", label: "Central Nervous System Infectious Disease" },
];

// copied from backend
const EXPECTED_FEATURES = [
  "Aktivierte Lymphozyten","Albumin (Liquor)","Albumin (Serum)","Albumin-Quotient","Basophile",
  "Eosinophile","Erythroblasten (bei Durchsicht)","Erythrophagen (bei Durchsicht)","Erythrozyten",
  "Glukose (Liquor)","Glukose (Plasma)","Glukose-Quotient",
  "Grobdifferenzierung","IgA (Liquor)","IgA (Serum)",
  "IgA(IF)","IgA(LOC)","IgA-Quotient","IgG (Liquor)","IgG (Serum)","IgG(IF)","IgG(LOC)","IgG-Index",
  "IgG-Quotient","IgM (Liquor)","IgM (Serum)","IgM(IF)","IgM(LOC)","IgM-Quotient",
  "Kappa (Liquor)","Kappa (Serum)","Kappa(IF)","Kappa(LOC)","Kappa-Index","Kappa-Quotient",
  "Knorpelzellen (bei Durchsicht)","Korrigierte Zellzahl","Laktat (Liquor)","Lambda (Liquor)","Lambda (Serum)","Lambda-Quotient",
  "Leukophagen (bei Durchsicht)","Lymphozyten","MRZ(H)-Beurteilung","Makrophagen (bei Durchsicht)","Makrophagen/Monozyten",
  "Maligne Zellen","Maligne Zellen (bei Durchsicht)","Mitosen (bei Durchsicht)","Neutrophile","OKB-Beurteilung",
  "Oligoklonale Banden (Liquor)","Oligoklonale Banden (Serum)",
  "Plasmazellen","Plasmazellen (bei Durchsicht)","Totalprotein (Liquor)","Zellzahl","GESCHLECHT", "ALTER_J"
];

const REQUIRED_FIELDS = ["GESCHLECHT", "ALTER_J"];
const isEmpty = (v) => v === "" || v === null || v === undefined;

const DEFAULT_FEATURES = EXPECTED_FEATURES.map(name => ({ name, value: "" }));


//normalization of manual input => the model expects numeric values (from backend)
// categorical encoders 
const mapGrobdiff = {
  "vorw. mononukleär": 1,
  "gemisch": 2,
  "gemischt": 2,
  "gemischt poly- und mononukleär": 2,
  "vorw. polynukleär": 3,
};

const mapOKB = {
  "OKB Typ I": 0,
  "OKB Typ IV": 0,
  "V.a. OKB Typ V": 0,
  "OKB Typ II": 1,
  "OKB Typ III": 1,
};

const mapMRZ = {
  "negativ (0/3)": 0, "negativ (1/3)": 0,
  "positiv (3/3)": 1, "positiv (2/3; zusätzlich fraglich positiv: 1/3)": 1, "positiv (2/3)": 1,
  "negativ (0/4)": 0, "negativ (1/4)": 0, "positiv (2/4)": 1,
};

const mapOCB = mapMRZ;

// Gender mapping note in backend: M:0, W:1
const mapGender = { "M": 0, "W": 1, "m": 0, "w": 1, "male": 0, "female": 1 };

// Normalizing a single value by feature name
function normalizeValue(name, raw) {
  if (raw === null || raw === undefined || raw === "") return null;

  const s = String(raw).trim();

  // categorical
  if (name === "Grobdifferenzierung") return mapGrobdiff[s] ?? null;
  if (name === "OKB-Beurteilung") return mapOKB[s] ?? null;
  if (name === "MRZ(H)-Beurteilung") return mapMRZ[s] ?? null;
  if (name === "Oligoklonale Banden (Liquor)") return mapOCB[s] ?? null;
  if (name === "Oligoklonale Banden (Serum)") return mapOCB[s] ?? null;
  if (name === "GESCHLECHT") return mapGender[s] ?? (isFinite(Number(s)) ? Number(s) : null);

  // numeric
  const num = Number(s.replace(",", ".")); // tolerate comma decimals
  return Number.isFinite(num) ? num : null;
}

// Build the payload strictly with expected names
function buildManualPayload(features, diseaseLabel) {
  const byName = new Map(features.map(f => [f.name, f.value]));
  const out = {};
  for (const fname of EXPECTED_FEATURES) {
    const raw = byName.has(fname) ? byName.get(fname) : "";
    out[fname] = normalizeValue(fname, raw);
  }
  return {
    model_type: diseaseLabel,
    features: out,
  };
}
 
//useful to match model config keys to the labels above 
// now included normalization from backend information
const diseaseLabelById = (id) => DISEASES.find(x => x.id === id)?.label ?? DISEASES[0].label;

// experiment with these! TODO
const COLORS = {
  primary:  "#000000", // black for text
  muted:    "#e2e8f0", 
  positive: "#1e293b", // for positive values
  negative: "#94a3b8", // negative values
  accent:   "#f0f6ff", // header ribbon on the app.js page
};

export default function Classifier() {
  const [disease, setDisease] = useState(DISEASES[0].id);
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [isParsing, setIsParsing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  // Results
  const [probability, setProbability] = useState(null); // 0..1
  const [shapValues, setShapValues] = useState([]);     // 
  const hasResults = probability !== null;

  // For PDF export
  const reportRef = useRef(null);

  // About text visibility: initially under buttons; after results, moves below plots
  const AboutBlock = (
    <div className="mt-6 text-sm text-black leading-6">
      <p className="mb-2">
        This dashboard lets clinicians populate patient data manually or via PDF upload,
        validate values, and view a model prediction and SHAP explanations of feature importance. 
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li>Choose an application.</li>
        <li>Populate features via PDF or manual input.</li>
        <li>Validate to run the ML model and see results.</li>
      </ul>
    </div>
  );

  // Open features panel (manual entry) without uploading
  const handlePopulateManually = () => {
    setShowFeaturePanel(true);
  };

  // Load template data quickly
  const handleTryTemplate = () => {
    const templ = DEFAULT_FEATURES.map((f, idx) => ({
      ...f,
      value: idx % 5 === 0 ? Math.round(Math.random() * 100) : f.value,
    }));
    setFeatures(templ);
    setShowFeaturePanel(true);
  };

  // PDF upload 
  const handlePdfUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setIsParsing(true);
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("model_type", diseaseLabelById(disease));

    const { data } = await api.post("/upload-pdf/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend returns: { columns: [], values: [], preview: [] }
    const columns = Array.isArray(data?.columns) ? data.columns : [];
    const values  = Array.isArray(data?.values)  ? data.values  : [];
    const parsedMap = new Map(columns.map((c, i) => [c, values[i]]));

    // Merge into existing features; also add any new ones from backend
    const mergedKnown = features.map((f) => ({
      name: f.name,
      value: parsedMap.has(f.name) ? parsedMap.get(f.name) : f.value,
    }));

    const existingNames = new Set(mergedKnown.map((f) => f.name));
    const extras = columns
      .filter((c) => !existingNames.has(c))
      .map((c) => ({ name: c, value: parsedMap.get(c) ?? "" }));

    setFeatures([...mergedKnown, ...extras]);
    setShowFeaturePanel(true);
  } catch (err) {
    console.error(err);
    alert("Parsing failed. You can still fill values manually.");
    setShowFeaturePanel(true);
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
      return copy;
    });
  };

  

  // When clicking Validate -> calls backends predict endpoint 
  const handleValidate = async () => {
  setIsPredicting(true);
  try {
    // Save manual data on backend (in case the pdf flow was not used, but data was manually input)
    const payload = buildManualPayload(features, diseaseLabelById(disease));
    await api.post("/set-features", payload );

    // Run the prediction using the usual endpoint
    const { data } = await api.post("/predict");

      const p = typeof data?.certainty === "number" ? data.certainty : null;
      setProbability(p ?? null);

      // Consume current backend shape
      const shapPairs = Array.isArray(data?.top_shap_values) ? data.top_shap_values : [];
      const parsed = shapPairs.map(([feature, value]) => ({ feature, value: Number(value) }));

      // Percent relative to the returned list (top-k); safe even if all zeros
      const absTotal = parsed.reduce((s, d) => s + Math.abs(d.value), 0) || 1;
      const withMeta = parsed.map(d => ({
        ...d,
        abs_value: Math.abs(d.value),
        percent: (Math.abs(d.value) / absTotal) * 100
      }));

      const top = withMeta.slice().sort((a, b) => b.abs_value - a.abs_value).slice(0, 10);
      setShapValues(top);
  } catch (err) {
    // debuging help
    console.error("Predict error:", err?.response?.data || err);
    setProbability(Math.random());
  } finally {
    setIsPredicting(false);
  }
};

  // Download PDF report
  // TODO: connect this to the backend as well
  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit image into the page while preserving aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 0;
    if (imgHeight < pageHeight) y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    pdf.save("dashboard-report.pdf");
  };

  // Pretty data for prediction bar

  const predictionData = useMemo(() => {
    if (probability === null) return [];
    return [
      { name: "Negative", value: 1 - probability },
      { name: "Positive", value: probability },
    ];
  }, [probability]);

  return (
    <section className="space-y-6">
      {/* Top bar with title + disease + two buttons to populate data */}
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-50 border">
                <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-800">
                Dashboard
            </h1>
            </div>
        </div>

    <div className="flex flex-col gap-3 items-start px-4">
    {/* selector for the different cases */}
    <select
      className="border rounded-xl px-3 py-2 text-sm bg-white"
      value={disease}
      onChange={(e) => setDisease(e.target.value)}
      aria-label="Choose application"
      title="Choose application"
    >
      {DISEASES.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label}
        </option>
      ))}
    </select>

    {/* Buttons */}
    <div className="flex items-center gap-2 w-full">
  <div className="flex gap-2">
    <button
      onClick={handlePopulateManually}
      className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50"
    >
      Enter your data
    </button>

    <button
      onClick={handleTryTemplate}
      className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50"
    >
      Try template data
    </button>
  </div>

  {hasResults && (
    <button
      onClick={handleDownload}
      className="ml-auto inline-flex gap-2 px-3 py-2 rounded-xl text-sm 
                bg-[#1e293b] text-white 
                hover:bg-[#0f172a] 
                transition-colors duration-200"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  )}
</div>
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
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionData} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={COLORS.primary} />
                    <YAxis domain={[0,1]} stroke={COLORS.primary} tickFormatter={(v)=>`${Math.round(v*100)}%`} />
                    <CartesianGrid stroke={COLORS.muted} />
                    <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}> {/* included the new colors */}
                      {predictionData.map((entry, i) => (
                        <Cell
                          key={`pred-${i}`}
                          fill={entry.name === "Positive" ? COLORS.positive : COLORS.negative}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        formatter={(v) => `${Math.round(v * 100)}%`}
                        position="top"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* SHAP top features */}
            <Card title="Top SHAP Features" icon={<FileText className="w-4 h-4" />}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...shapValues].reverse()} // show largest at top
                    layout="vertical"
                    margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                     <CartesianGrid stroke={COLORS.muted} />
                    <XAxis type="number" stroke={COLORS.primary}  />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke={COLORS.primary}
                      width={90}
                    />
                    <Tooltip
                      formatter={(v, _name, ctx) => {
                        const percent = ctx?.payload?.percent != null ? ctx.payload.percent.toFixed(1) : null;
                        const val = Number(v);
                        return [`${val.toFixed(4)}${percent !== null ? `  (${percent}%)` : ""}`, "SHAP"];
                      }}
                    />

                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {[...shapValues].reverse().map((d, i) => (
                        <Cell
                          key={`shap-${i}`}
                          fill={d.value >= 0 ? COLORS.positive : COLORS.negative}
                        />
                      ))}
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
            title="Patient Features"
            subtitle="Upload PDF to auto-extract values or edit manually. Validate to run the model."
            toolbar={
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            }
          >
            <div className="mb-4">
              {isParsing && <p className="text-sm text-gray-500">Parsing PDF…</p>}
            </div>

            <FeatureGrid features={features} onChange={updateFeature} />

            <div className="mt-6 flex items-center justify-end">
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

// simplification of the feature grid
function FeatureGrid({ features, onChange }) {
  const byName = useMemo(() => new Map(features.map((f, i) => [f.name, { ...f, idx: i }])), [features]);

  // Pull out the required fields in desired order
  const required = REQUIRED_FIELDS
    .map((n) => byName.get(n))
    .filter(Boolean);

  // Everything else afterwards, preserving original order
  const others = features.filter((f) => !REQUIRED_FIELDS.includes(f.name));

  const updateByName = (name, value) => {
    const f = byName.get(name);
    if (!f) return;
    onChange(f.idx, value);
  };

  return (
    <div className="space-y-4">
      {/* Patient basics strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* GESCHLECHT as a select */}
        {byName.has("GESCHLECHT") && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-black mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={String(byName.get("GESCHLECHT").value ?? "")}
              onChange={(e) => updateByName("GESCHLECHT", e.target.value)}
              className={[
                "border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none",
                isEmpty(byName.get("GESCHLECHT").value)
                  ? "text-gray-400 ring-2 ring-red-400 shadow-[0_0_0.6rem_rgba(248,113,113,0.55)]"
                  : "text-black focus:ring-2 focus:ring-black/10"
              ].join(" ")}
            >
              <option value="">Please Choose</option>
              <option value="M">M</option>
              <option value="W">F</option>
            </select>
          </div>
        )}

        {/* ALTER_J as a number input */}
        {byName.has("ALTER_J") && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-black-700 mb-1">
              Age (Years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="eg. 54"
              value={String(byName.get("ALTER_J").value ?? "")}
              onChange={(e) => updateByName("ALTER_J", e.target.value)}
              className={[
                "border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none",
                isEmpty(byName.get("ALTER_J").value)
                  ? "ring-2 ring-red-400 shadow-[0_0_0.6rem_rgba(248,113,113,0.55)]"
                  : "focus:ring-2 focus:ring-black/10"
              ].join(" ")}
            />
          </div>
        )}
      </div>

      {/* Divider to visually separate the basics from the rest */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Rest of features */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {others.map((f, idx) => {
          const globalIdx = byName.get(f.name)?.idx ?? idx;
          return (
            <div key={f.name} className="flex flex-col">
              <label className="text-xs font-medium text-black-600 mb-1">{f.name}</label>
              <input
                className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                value={String(f.value ?? "")}
                onChange={(e) => onChange(globalIdx, e.target.value)}
                placeholder="Enter value"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

