export const REQUIRED_FIELDS = ["GESCHLECHT", "ALTER_J"];

const isEmpty = (v) => v === "" || v === null || v === undefined;
const toNum = (x) => {
  const n = Number(String(x).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

//use below keys everywhere. 
export const MODEL_KEYS = ["MAG7", "MAG6", "INF3", "INF1"];

export const MODEL_KEY_TO_LABEL = {
  MAG7: "Central Nervous System Parenchymal Malignancy",
  MAG6: "Central Nervous System Leptomeningeal Malignancy",
  INF1: "Central Nervous System Autoimmune Inflammatory Disease",
  INF3: "Central Nervous System Infectious Disease",
};

export const MODEL_LABEL_TO_KEY = Object.fromEntries(
  Object.entries(MODEL_KEY_TO_LABEL).map(([k, v]) => [v, k])
);

export function normalizeModelKey(keyOrLabel) {
  if (MODEL_KEY_TO_LABEL[keyOrLabel]) return keyOrLabel;          // already a key
  if (MODEL_LABEL_TO_KEY[keyOrLabel]) return MODEL_LABEL_TO_KEY[keyOrLabel]; // was a label
  throw new Error(
    `Unknown model identifier "${keyOrLabel}". Expected one of ${MODEL_KEYS.join(
      "|"
    )} or a known long label.`
  );
}

export function getModelLabel(keyOrLabel) {
  if (MODEL_KEY_TO_LABEL[keyOrLabel]) return MODEL_KEY_TO_LABEL[keyOrLabel];
  if (MODEL_LABEL_TO_KEY[keyOrLabel]) return keyOrLabel; // already a label
  return undefined;
}

// categorical mappings same for all
const mapGrobdiff = {
  "vorw. mononukleär": 1,
  "gemisch": 2, "gemischt": 2, "gemischt poly- und mononukleär": 2,
  "vorw. polynukleär": 3,
};

const mapOKB = {
  "OKB Typ I": 0, "OKB Typ IV": 0, "V.a. OKB Typ V": 0,
  "OKB Typ II": 1, "OKB Typ III": 1,
};

const mapMRZ = {
  "negativ (0/3)": 0, "negativ (1/3)": 0,
  "positiv (3/3)": 1, "positiv (2/3; zusätzlich fraglich positiv: 1/3)": 1, "positiv (2/3)": 1,
  "negativ (0/4)": 0, "negativ (1/4)": 0, "positiv (2/4)": 1,
};

const mapOCB = mapMRZ;

const mapGender = { M: 0, W: 1, m: 0, w: 1, male: 0, female: 1 };

// (shared) which features are categorical
const SHARED_CATEGORICAL = {
  "Grobdifferenzierung": mapGrobdiff,
  "OKB-Beurteilung": mapOKB,
  "MRZ(H)-Beurteilung": mapMRZ,
  "Oligoklonale Banden (Liquor)": mapOCB,
  "Oligoklonale Banden (Serum)": mapOCB,
  "GESCHLECHT": mapGender,
};

//The order in which the training features are passed matters here!!

// INF3 — Autoimmune Inflammatory Diseases (30 features)
const FEATURES_INF3 = [
  "Aktivierte Lymphozyten",
  "Albumin (Serum)",
  "Eosinophile",
  "Erythrozyten",
  "Glukose (Liquor)",
  "Glukose-Quotient",
  "Grobdifferenzierung",
  "IgA (Liquor)",
  "IgA (Serum)",
  "IgA(IF)",
  "IgG (Liquor)",
  "IgG (Serum)",
  "IgG(LOC)",
  "IgG-Index",
  "IgM-Quotient",
  "Kappa (Serum)",
  "Kappa(IF)",
  "Kappa-Quotient",
  "Korrigierte Zellzahl",
  "Laktat (Liquor)",
  "Lambda (Liquor)",
  "Lambda (Serum)",
  "Lymphozyten",
  "Maligne Zellen",
  "Zellzahl",
  "Neutrophile",
  "Oligoklonale Banden (Serum)",
  "Totalprotein (Liquor)",
  ...REQUIRED_FIELDS,
];

// MAG6 — Leptomeningeal Malignancy (50 features)
const FEATURES_MAG6 = [
  "Aktivierte Lymphozyten",
  "Albumin (Serum)",
  "Albumin-Quotient",
  "Basophile",
  "Erythrozyten",
  "Glukose (Liquor)",
  "Glukose (Plasma)",
  "Glukose-Quotient",
  "Grobdifferenzierung",
  "IgA (Liquor)",
  "IgA (Serum)",
  "IgA(LOC)",
  "IgA-Quotient",
  "IgG (Liquor)",
  "IgG (Serum)",
  "IgG(LOC)",
  "IgG-Index",
  "IgG-Quotient",
  "IgM (Liquor)",
  "IgM (Serum)",
  "IgM(IF)",
  "IgM(LOC)",
  "IgM-Quotient",
  "Kappa (Liquor)",
  "Kappa (Serum)",
  "Kappa(IF)",
  "Kappa(LOC)",
  "Kappa-Index",
  "Kappa-Quotient",
  "Korrigierte Zellzahl",
  "Laktat (Liquor)",
  "Lambda (Liquor)",
  "Lambda (Serum)",
  "Lambda-Quotient",
  "Leukophagen (bei Durchsicht)",
  "Lymphozyten",
  "MRZ(H)-Beurteilung",
  "Makrophagen (bei Durchsicht)",
  "Makrophagen/Monozyten",
  "Maligne Zellen",
  "Neutrophile",
  "OKB-Beurteilung",
  "Oligoklonale Banden (Liquor)",
  "Oligoklonale Banden (Serum)",
  "Plasmazellen",
  "Plasmazellen (bei Durchsicht)",
  "Totalprotein (Liquor)",
  "Zellzahl",
  ...REQUIRED_FIELDS,
];

// MAG7 — Parenchymal Malignancy (30 features, Fold1 Set2)
const FEATURES_MAG7 = [
  "Aktivierte Lymphozyten",
  "Albumin (Serum)",
  "Erythrozyten",
  "Glukose (Liquor)",
  "IgA (Liquor)",
  "IgA (Serum)",
  "IgA(IF)",
  "IgA-Quotient",
  "IgG (Serum)",
  "IgG(IF)",
  "IgG-Index",
  "IgM (Liquor)",
  "IgM-Quotient",
  "Kappa (Liquor)",
  "Kappa (Serum)",
  "Kappa(IF)",
  "Kappa-Quotient",
  "Korrigierte Zellzahl",
  "Laktat (Liquor)",
  "Lambda (Liquor)",
  "Lambda-Quotient",
  "Lymphozyten",
  "Makrophagen/Monozyten",
  "Mitosen (bei Durchsicht)",
  "Neutrophile",
  "OKB-Beurteilung",
  "Totalprotein (Liquor)",
  "Zellzahl",
  ...REQUIRED_FIELDS,
];

const FEATURES_INF1 = [
  "Aktivierte Lymphozyten",
  "Albumin (Serum)",
  "Erythrozyten",
  "Glukose (Liquor)",
  "IgA (Liquor)",
  "IgA (Serum)",
  "IgA(IF)",
  "IgA-Quotient",
  "IgG (Serum)",
  "IgG(IF)",
  "IgG-Index",
  "IgM (Liquor)",
  "IgM-Quotient",
  "Kappa (Liquor)",
  "Kappa (Serum)",
  "Kappa(IF)",
  "Kappa-Quotient",
  "Korrigierte Zellzahl",
  "Laktat (Liquor)",
  "Lambda (Liquor)",
  "Lambda-Quotient",
  "Lymphozyten",
  "Makrophagen/Monozyten",
  "Mitosen (bei Durchsicht)",
  "Neutrophile",
  "OKB-Beurteilung",
  "Totalprotein (Liquor)",
  "Zellzahl",
  ...REQUIRED_FIELDS,
];



export function diffFeatures(modelKeyOrLabel, featureObj /* {name:value} */) {
  // const expected = getTrainingFeatures(modelKeyOrLabel);
  // const sent = Object.keys(featureObj);
  // const missing = expected.filter(k => !sent.includes(k));
  // const extra = sent.filter(k => !expected.includes(k));
  // return { missing, extra };
  return;
}

// Helper: create a unique ordered list and ensure required fields are present at the end
function ensureRequired(list) {
  const seen = new Set();
  const dedup = [];
  for (const f of list) {
    if (!seen.has(f)) { seen.add(f); dedup.push(f); }
  }
  for (const r of REQUIRED_FIELDS) {
    if (!seen.has(r)) dedup.push(r);
  }
  return dedup;
}

const EXPECTED_BY_DISEASE = {
  MAG7: ensureRequired(FEATURES_MAG7),
  MAG6: ensureRequired(FEATURES_MAG6),
  INF3: ensureRequired(FEATURES_INF3),
  INF1: ensureRequired(FEATURES_INF1),
  // INF1: ADD THIS
};


// Union fallback for d4 (essentially show all features )
const UNION_FALLBACK = ensureRequired([
  ...FEATURES_INF1,
  ...FEATURES_INF3,
  ...FEATURES_MAG6,
  ...FEATURES_MAG7,
]);

export function getExpectedFeatures(modelKey) {
  const mk = normalizeModelKey(modelKey);
  return EXPECTED_BY_DISEASE[mk] ?? UNION_FALLBACK; // union for INF4 TODO: 
}

// Normalization (categorical + numeric)

export function normalizeValue(name, raw) {
  if (isEmpty(raw)) return null;
  const s = String(raw).trim();

  const cat = SHARED_CATEGORICAL[name];
  if (cat) {
    const mapped = cat[s];
    if (mapped !== undefined) return mapped;
    if (name === "GESCHLECHT" && Number.isFinite(Number(s))) return Number(s);
    return null;
  }
  return toNum(s);
}

export function buildManualPayload(modelKeyOrLabel, expectedFeatures, features) {
  // compute long label (model_type) once here
  let model_type;
  if (MODEL_KEY_TO_LABEL[modelKeyOrLabel]) {
    model_type = MODEL_KEY_TO_LABEL[modelKeyOrLabel];
  } else if (MODEL_LABEL_TO_KEY[modelKeyOrLabel]) {
    model_type = modelKeyOrLabel; // already a label
  } else {
    throw new Error(`Unknown model identifier "${modelKeyOrLabel}"`);
  }

  const byName = new Map(features.map(f => [f.name, f.value]));
  const out = {};
  for (const fname of expectedFeatures) {
    out[fname] = normalizeValue(fname, byName.get(fname) ?? "");
  }

  return { model_type, features: out };
}

// guard to notice quickly if the key is wrong
export function assertValidModelKey(k) {
  const ok = ["MAG7","MAG6","INF3","INF1"].includes(k);
  if (!ok) {
    throw new Error(`Unknown model_key "${k}". Expected one of MAG7|MAG6|INF3|INF1`);
  }
}

export const EXPECTED_BY_DISEASE_DEBUG = EXPECTED_BY_DISEASE;
