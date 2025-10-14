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
  normalizeModelKey,REQUIRED_FIELDS, diffFeatures, FEATURE_REQUIRED_INF1,
  FEATURE_REQUIRED_INF3,
  FEATURE_REQUIRED_MAG6,
  FEATURE_REQUIRED_MAG7,EXPECTED_FEATURES, FEATURES_INF3, FEATURES_MAG6, FEATURES_MAG7, FEATURES_INF1, FEATURE_UNITS, FEATURE_LABEL_EN} from "../normalization";


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
  negative: "#94a3b8", // negative values
  accent:   "#f0f6ff", // header ribbon on the app.js page
};

const MODEL_NAME_MAP = {
      MAG7: "Central Nervous System Parenchymal Malignancy",
      MAG6: "Central Nervous System Leptomeningeal Malignancy",
      INF3: "Central Nervous System Infectious Disease",
      INF1: "Central Nervous System Autoimmune Inflammatory Disease",
    };

export default function Classifier() {
  const [disease, setDisease] = useState(DISEASES[0].id);
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  const [globalFeatures, setGlobalFeatures] = useState([]) // added this to maintain state even when switching usecase
  const [backendExpectedFeatures, setBackendExpectedFeatures] = useState([]); // ALL
  const [displayedExpectedFeatures, setDisplayedExpectedFeatures] = useState([]); // UI subset
  const [features, setFeatures] = useState([]); // current UI values (subset + any extras parsed from PDF)  
  const [featureGroups, setFeatureGroups] = useState([]);  // new feature groups
  const [isParsing, setIsParsing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [lang, setLang] = useState("de"); // language 
  // Results
  const [probability, setProbability] = useState(null); // 0..1
  const [shapValues, setShapValues] = useState([]);     // 
  const hasResults = probability !== null;

  const templateSectionRef = useRef(null);
  const validationSectionRef = useRef(null);

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
    afterPaint(() => scrollToRef(templateSectionRef));
  };

//helper to add the units of mmt . 
const name_mapping = (name) => (lang === "en" ? (FEATURE_LABEL_EN[name] ?? name) : name);
const unitOf = (name) => FEATURE_UNITS?.[name] ?? "";


  // Load template data quickly
const handleTryTemplate = () => {
  
  const templ = displayedExpectedFeatures.map((name, idx) => {
    if(name == "GESCHLECHT") return {name, value: "W"};
    if(name == "ALTER_J") return {name, value:54}; 
    return {
      name, value: idx%5 ===0 ? Math.round(Math.random()*100):"", 
    };
  });


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

const flattenGroupFeatures = (groups) =>
    groups.flatMap((g) => g.features);

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
  } catch (err) {
    console.error(err);
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


// when a different use case is selected, change the disease, get the other features and show them in the frontend. Don't load them into backend!

useEffect(() => {
  if (!disease) return;

  const groups = groupsForDisease(disease);
  setFeatureGroups(groups);
  const ordered = flattenGroupFeatures(groups)
  // let uiList = FEATURES_INF1;
  // if (disease === "INF3") uiList = FEATURES_INF3;
  // else if (disease === "MAG6") uiList = FEATURES_MAG6;
  // else if (disease === "MAG7") uiList = FEATURES_MAG7;
  setDisplayedExpectedFeatures(ordered);

  // reuse global values if available
  setFeatures(
    ordered.map((name) => {
      const match = globalFeatures.find((f) => f.name === name);
      return { name, value: match ? match.value : "" };
    })
  );

  setProbability(null);
  setShapValues([]);
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
              <section ref={validationSectionRef}>
                Dashboard
                </section>
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
            key={`panel-${disease}`} // forces remount on change of disease
            title="Patient Features"
            subtitle="Upload PDF to auto-extract values or edit manually. Validate to run the model."
            toolbar={ //added a clear button 
              <div className="flex items-center gap-2">
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
                <button
                  onClick={() => {
                    setGlobalFeatures([]);
                    setFeatures(displayedExpectedFeatures.map((n) => ({ name: n, value: "" })));
                  }}
                  className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50"
                  title="Clear all saved inputs"
                >
                  Clear
                </button>
              </div>
              
            }

          >
            <button
                onClick={() => setLang((l) => (l === "de" ? "en" : "de"))}
                className="px-2 py-1 rounded-lg text-xs border bg-white hover:bg-gray-50"
                title="Toggle language (frontend only)"
              >
                {lang === "de" ? "Switch to English" : "Auf Deutsch anzeigen"}
          </button>
            <div className="mb-4">
              {isParsing && <p className="text-sm text-gray-500">Parsing PDF…</p>}
            </div>
            <section ref={templateSectionRef}>
            <FeatureGrid
                  key={`grid-${disease}`}
                  features={features}
                  groups={featureGroups}
                  onChange={updateFeature}
                  unitOf={unitOf}
                  t={name_mapping}
                  lang={lang}
                />
          </section>
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

function FeatureGrid({ features, groups, onChange, t, unitOf, lang }) {
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
      <div className="space-y-8">
        {groups.map((group, idx) => (
          <div key={group.title} className="space-y-3 relative">
            <h3 className="text-base md:text-lg font-semibold text-slate-800">{group.title}</h3>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {group.features.map((name) => {
              const f = byName.get(name);
              if (!f) return null;

              if (name === "GESCHLECHT") {
                return (
                  <div key={name} className="flex flex-col">
                    <label className="text-xs font-medium text-black mb-1">
                       {lang === "en" ? "Gender" : "Geschlecht"} <span className="text-red-500">*</span>
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
                      <option value="">{lang === "en" ? "Please Choose" : "Bitte wählen"}</option>
                      <option value="M">M</option>
                      <option value="W">F</option>
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

