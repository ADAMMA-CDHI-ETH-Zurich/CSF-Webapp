export const REQUIRED_FIELDS = ["GESCHLECHT", "ALTER_J"];

const isEmpty = (v) => v === "" || v === null || v === undefined;
const toNum = (x) => {
  const n = Number(String(x).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

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
  d1: ensureRequired(FEATURES_MAG7), // Parenchymal malignancy
  d2: ensureRequired(FEATURES_MAG6), // Leptomeningeal malignancy
  d3: ensureRequired(FEATURES_INF3), // Autoimmune inflammatory
  // d4 (Infectious): no list provided → union fallback
};

// Union fallback for d4 (essentially show all features )
const UNION_FALLBACK = ensureRequired([
  ...FEATURES_INF3,
  ...FEATURES_MAG6,
  ...FEATURES_MAG7,
]);

export function getExpectedFeatures(diseaseId) {
  return EXPECTED_BY_DISEASE[diseaseId] ?? UNION_FALLBACK;
}

// Normalization (categorical + numeric)
export function normalizeValue(diseaseId, name, raw) {
  if (isEmpty(raw)) return null;
  const s = String(raw).trim();
  // all diseases share the same categorical encodings right now
  const cat = SHARED_CATEGORICAL[name];
  if (cat) {
    const mapped = cat[s];
    if (mapped !== undefined) return mapped;
    if (name === "GESCHLECHT" && Number.isFinite(Number(s))) return Number(s);
    return null; // unknown categorical value
  }
  return toNum(s);
}

// Build payload strictly in the order the selected disease expects
export function buildManualPayload(diseaseId, features, modelTypeLabel) {
  const expected = getExpectedFeatures(diseaseId);
  const byName = new Map(features.map(f => [f.name, f.value]));
  const out = {};
  for (const fname of expected) {
    out[fname] = normalizeValue(diseaseId, fname, byName.get(fname) ?? "");
  }
  return { model_type: modelTypeLabel, features: out };
}

export const EXPECTED_BY_DISEASE_DEBUG = EXPECTED_BY_DISEASE;
