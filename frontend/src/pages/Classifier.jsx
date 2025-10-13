import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,Cell
} from "recharts";
import { Upload, CheckCircle2, Download, FileText, Brain, Activity } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getExpectedFeatures,
  buildManualPayload,
  getModelLabel,           
  normalizeModelKey,REQUIRED_FIELDS, diffFeatures } from "../normalization";

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
  positive: "#163b62", // for positive values 
  negative: "#950606", // negative values
  accent:   "#f0f6ff", // header ribbon on the app.js page
};

const MODEL_NAME_MAP = {
      MAG7: "Central Nervous System Parenchymal Malignancy",
      MAG6: "Central Nervous System Leptomeningeal Malignancy",
      INF3: "Central Nervous System Infectious Disease",
      INF1: "Central Nervous System Autoimmune Inflammatory Disease",
    };
const AXIS_TICK = { fontSize: 12 };      // unify font size across plots
const Y_AXIS_WIDTH = 120;                // enough space for long feature names

export default function Classifier() {
  const [disease, setDisease] = useState(DISEASES[0].id);
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  
  const [expectedFeatures, setExpectedFeatures] = useState([]);

  const [features, setFeatures] = useState([]);

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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-[#1e293b]">Publication & Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-sm text-slate-700 leading-6">
                <p>
                  This dashboard lets clinicians populate patient data manually or via PDF upload,
                  validate values, and view a model prediction and SHAP explanations of feature importance.     </p>
                <p className="mt-2">
                  <span className="font-medium">Contributors: </span>
                  Names, affiliations (ETH / ADAMMA), and collaborators.
                </p>
              </div>
              <div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Choose an application.</li>
                  <li>Populate features via PDF or manual input.</li>
                  <li>Validate to run the ML model and see results.</li>
                </ul>
              </div>
            </div>
          </section>
  );

  // Open features panel (manual entry) without uploading
  const handlePopulateManually = () => {
    setShowFeaturePanel(true);
  };

  // Load template data quickly
  const handleTryTemplate = () => {
  const templ = expectedFeatures.map((name, idx) => ({
    name,
    value: idx % 5 === 0 ? Math.round(Math.random() * 100) : "",
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
    
    const model_type = getModelLabel(disease); //long label
    form.append("model_type", model_type);
    
    const { data } = await api.post("/upload-pdf/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend returns: { columns: [], values: [], preview: [] }
    const columns = Array.isArray(data?.columns) ? data.columns : [];
    const values  = Array.isArray(data?.values)  ? data.values  : [];
    const parsedMap = new Map(columns.map((c, i) => [c, values[i]]));

    // Merge into existing features; also add any new ones from backend
    const mergedKnown = expectedFeatures.map((name) => {
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
  // when a different use case is selected, change the desease, get the other features. 
useEffect(() => {
  if (!disease) return;

  const fetchFeatures = async () => {
    try {
      const model_type = getModelLabel(disease); // long label
      const { data } = await api.get("/model-features", { params: { model_type } });
      const expected = data.features; // authoritative, correct order
      setExpectedFeatures(expected);
      setFeatures(expected.map(name => ({ name, value: "" }))); // clear UI inputs
    } catch (err) {
      const detail = err?.response?.data?.detail ?? err?.message;
      console.error("Failed to load model features:", detail);
      // fallback to hardcoded definition if server unavailable
 

      console.error("Failed to load model features:", err);
      // fallback to hardcoded definition if server unavailable
      const fallback = getExpectedFeatures(disease);
      setExpectedFeatures(fallback);
      setFeatures(fallback.map(name => ({ name, value: "" })));
    }
  };

  fetchFeatures();
  setProbability(null);
  setShapValues([]);
}, [disease]);



  // When clicking Validate -> calls backends predict endpoint 
const handleValidate = async () => {
  setIsPredicting(true);
  try {
    // payload now = { model_type, features }, in correct order
    const payload = buildManualPayload(disease, expectedFeatures, features);

    // (optional) preflight check
    const sent = Object.keys(payload.features);
    const missing = expectedFeatures.filter(f => !sent.includes(f));
    const extra = sent.filter(f => !expectedFeatures.includes(f));
    if (missing.length || extra.length) {
      console.error("Feature mismatch", { missing, extra });
      alert("Feature mismatch — check console.");
      setIsPredicting(false);
      return;
    }

    await api.post("/set-features", payload);
    const { data } = await api.post("/predict", { model_type: payload.model_type });

    const p = [data?.certainty, data?.probability, data?.score]
      .find(v => typeof v === "number") ?? null;
    setProbability(p);

    const shapPairs = Array.isArray(data?.top_shap_values) ? data.top_shap_values : [];
    const parsed = shapPairs.map(([feature, value]) => ({ feature, value: Number(value) }));
    const absTotal = parsed.reduce((s, d) => s + Math.abs(d.value), 0) || 1;
    const withMeta = parsed.map(d => ({
      ...d,
      abs_value: Math.abs(d.value),
      percent: (Math.abs(d.value) / absTotal) * 100
    }));
    const top = withMeta.slice().sort((a, b) => b.abs_value - a.abs_value).slice(0, 10);
    setShapValues(top);
  } catch (err) {
    console.error("Predict error:", err?.response?.data || err);
    setProbability(null);
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
      className="border rounded-xl px-3 py-2 hover:shadow-2xl text-sm bg-white"
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
      className="px-3 py-2 rounded-xl text-sm border bg-white hover:shadow-2xl hover:bg-gray-50"
    >
      Enter your data
    </button>

    <button
      onClick={handleTryTemplate}
      className="px-3 py-2 rounded-xl text-sm border hover:shadow-2xl bg-white hover:bg-gray-50"
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
                  <BarChart data={predictionData} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <CartesianGrid horizontal={false} vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_TICK} stroke={COLORS.primary} />
                    <YAxis domain={[0,1]} stroke={COLORS.primary} tick={AXIS_TICK} tickFormatter={(v)=>`${Math.round(v*100)}%`} />
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
                    margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                  >
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <CartesianGrid horizontal={false} vertical={false} />
                     <CartesianGrid stroke={COLORS.muted} />
                    <XAxis type="number" stroke={COLORS.primary} tick={AXIS_TICK}  />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke={COLORS.primary}
                      width={Y_AXIS_WIDTH}        // give labels room
                      interval={0}                // show every tick, no skipping
                      tick={AXIS_TICK}            // unified font size
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
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
            key={`panel-${disease}`} // forces remount on change of disease
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

            <FeatureGrid key={`grid-${disease}`}  features={features} onChange={updateFeature} />

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