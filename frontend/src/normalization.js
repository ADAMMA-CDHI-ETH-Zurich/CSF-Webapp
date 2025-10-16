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

export const EXPECTED_FEATURES = ["Aktivierte Lymphozyten", "Albumin (Liquor)", "Albumin (Serum)", "Albumin-Quotient", "Basophile",
                     "Eosinophile", "Erythroblasten (bei Durchsicht)", "Erythrophagen (bei Durchsicht)", "Erythrozyten", 
                     "Glukose (Liquor)", "Glukose (Plasma)", "Glukose-Quotient",
                     "Grobdifferenzierung", "IgA (Liquor)", "IgA (Serum)",
                     "IgA(IF)", "IgA(LOC)", "IgA-Quotient", "IgG (Liquor)", "IgG (Serum)", "IgG(IF)", "IgG(LOC)", "IgG-Index",
                     "IgG-Quotient", "IgM (Liquor)", "IgM (Serum)", "IgM(IF)", "IgM(LOC)", "IgM-Quotient",
                     "Kappa (Liquor)", "Kappa (Serum)", "Kappa(IF)", "Kappa(LOC)", "Kappa-Index", "Kappa-Quotient",
                     "Knorpelzellen (bei Durchsicht)", "Korrigierte Zellzahl", "Laktat (Liquor)", "Lambda (Liquor)", "Lambda (Serum)", "Lambda-Quotient",
                     "Leukophagen (bei Durchsicht)", "Lymphozyten", "MRZ(H)-Beurteilung", "Makrophagen (bei Durchsicht)", "Makrophagen/Monozyten",
                     "Maligne Zellen", "Maligne Zellen (bei Durchsicht)", "Mitosen (bei Durchsicht)", "Neutrophile", "OKB-Beurteilung",
                     "Oligoklonale Banden (Liquor)", "Oligoklonale Banden (Serum)",
                     "Plasmazellen", "Plasmazellen (bei Durchsicht)", "Totalprotein (Liquor)", "Zellzahl", "GESCHLECHT", "ALTER_J"
                     ]


export const FEATURES_INF3 = [
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
  "Neutrophile",
  "Oligoklonale Banden (Serum)",
  "Totalprotein (Liquor)",
  "Zellzahl",
  ...REQUIRED_FIELDS,
];

// MAG6 — Leptomeningeal Malignancy (50 features)
export const FEATURES_MAG6 = [
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
export const FEATURES_MAG7 = [
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

export const FEATURES_INF1 = [
  "Aktivierte Lymphozyten",
  "Albumin (Liquor)", 
  "Albumin (Serum)",
  "Albumin-Quotient",
  "Erythrozyten",
  "Glukose (Liquor)",
  "Glukose (Plasma)",
  "Glukose-Quotient",
  "Grobdifferenzierung",
  "IgA (Liquor)",
  "IgA (Serum)",
  "IgA(IF)",
  "IgA(LOC)",
  "IgA-Quotient",
  "IgG (Liquor)",
  "IgG (Serum)",
  "IgG(IF)",
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
  "Lymphozyten",
  "Makrophagen (bei Durchsicht)",
  "Makrophagen/Monozyten",
  "Maligne Zellen",
  "Mitosen (bei Durchsicht)",
  "Neutrophile",
  "OKB-Beurteilung",
  "Oligoklonale Banden (Liquor)", 
  "Oligoklonale Banden (Serum)", 
  "Plasmazellen",
  "Totalprotein (Liquor)",
  "Zellzahl",
  ...REQUIRED_FIELDS,
];

// TABLES

//mag6
export const FEATURE_REQUIRED_MAG6 = [
  {
      title: "Meta Data",
      features: [
        "GESCHLECHT", "ALTER_J",
    ],
    },
  {
    title: "Proteinanalytik",
    features: [
      
      "Grobdifferenzierung", 
      "Totalprotein (Liquor)", 
      "Albumin (Serum)", 
      "Albumin-Quotient",
      "IgG (Liquor)", 
      "IgG (Serum)", 
      "IgG-Quotient",
      "IgG-Index",
      "IgA (Liquor)", 
      "IgA (Serum)",
      "IgA-Quotient",
      "IgM (Liquor)", 
      "IgM (Serum)",
      "IgM-Quotient",
      "Kappa (Liquor)", 
      "Kappa (Serum)", 
      "Kappa-Quotient",
      "Kappa-Index",
      "Lambda (Liquor)", 
      "Lambda (Serum)", 
      "Lambda-Quotient",
    ],
  },
  {
    title: "Intrathekale Fraktionen nach Reiber",
    features: [
      
      
      "IgM(IF)",
      "Kappa(IF)",
      "IgG(LOC)", 
      "IgA(LOC)", 
      "IgM(LOC)",
      "Kappa(LOC)"
      
    ],
  },
  {
    title: "Oligoklonale Banden",
    features: [
      "Oligoklonale Banden (Liquor)", 
      "Oligoklonale Banden (Serum)",
      "OKB-Beurteilung",
    ],
  },
  {
      title: "MRZ-Reaktion",
      features: [
        "MRZ(H)-Beurteilung"
      ],
    },
    {
      title: "Liquorchemie",
      features: [
          "Glukose (Liquor)", 
          "Glukose (Plasma)", 
          "Laktat (Liquor)", 
          "Glukose-Quotient", 
      ],
    },
    {
      title: "Zytologie",
      features: [
          "Lymphozyten", 
          "Aktivierte Lymphozyten", 
          "Zellzahl", 
          "Erythrozyten",
          "Korrigierte Zellzahl",
          "Plasmazellen",
          "Plasmazellen (bei Durchsicht)",
          "Maligne Zellen",   
          "Makrophagen (bei Durchsicht)",
          "Makrophagen/Monozyten",
          "Neutrophile", 
          "Basophile",
          "Leukophagen (bei Durchsicht)",

      ],
    },
];

// MAG7: Leptomeningeal Malignancy
export const FEATURE_REQUIRED_MAG7 = [
{
    title: "Meta Data",
    features: [
      "GESCHLECHT", "ALTER_J",
  ],
  },
{
  title: "Proteinanalytik",
  features: [
    
    "Totalprotein (Liquor)", 
    "Albumin (Serum)",
    "IgG (Serum)", 
    "IgG-Index",
    "IgA (Liquor)", 
    "IgA (Serum)",
    "IgA-Quotient",
    "IgM (Liquor)", 
    "IgM-Quotient",
    "Kappa (Liquor)", 
    "Kappa (Serum)", 
    "Kappa-Quotient", 
    "Lambda (Liquor)", 
    "Lambda-Quotient",
  ],
},
{
  title: "Intrathekale Fraktionen nach Reiber",
  features: [
    "IgG(IF)", 
    "IgA(IF)", 
    "Kappa(IF)"
  ],
},
{
  title: "Oligoklonale Banden",
  features: [
    "OKB-Beurteilung",
  ],
},
  {
    title: "Liquorchemie",
    features: [
        "Glukose (Liquor)", 
        "Laktat (Liquor)", 
    ],
  },
  {
    title: "Zytologie",
    features: [
        "Lymphozyten", 
        "Aktivierte Lymphozyten", 
        "Zellzahl", 
        "Erythrozyten",
        "Korrigierte Zellzahl",
        "Makrophagen/Monozyten",
        "Neutrophile", 
        "Mitosen (bei Durchsicht)"
    ],
  },
];

// INF3: Infectious
export const FEATURE_REQUIRED_INF3 = [
{
    title: "Meta Data",
    features: [
      "GESCHLECHT", "ALTER_J",
  ],
  },
{
  title: "Proteinanalytik",
  features: [
    "Grobdifferenzierung", 
    "Totalprotein (Liquor)", 
    "Albumin (Serum)", 
    "IgG (Liquor)", 
    "IgG (Serum)", 
    "IgG-Index",
    "IgA (Liquor)", 
    "IgA (Serum)",
    "IgM-Quotient",
    "Kappa (Serum)", 
    "Kappa-Quotient",
    "Lambda (Liquor)", 
    "Lambda (Serum)",
  ],
},
{
  title: "Intrathekale Fraktionen nach Reiber",
  features: [

    "IgA(IF)", 
    "Kappa(IF)",
    "IgG(LOC)", 

  ],
},
{
  title: "Oligoklonale Banden",
  features: [
    "Oligoklonale Banden (Serum)",
  ],
},
  {
    title: "Liquorchemie",
    features: [
        "Glukose (Liquor)", 
        "Glukose-Quotient",
        "Laktat (Liquor)",  
    ],
  },
  {
    title: "Zytologie",
    features: [
        "Lymphozyten", 
        "Aktivierte Lymphozyten", 
        "Zellzahl", 
        "Erythrozyten",
        "Korrigierte Zellzahl",
        "Maligne Zellen", 
        "Neutrophile", 
        "Eosinophile", 
    ],
  },
];


// INF1: Autoimmune
export const FEATURE_REQUIRED_INF1 = [
{
    title: "Meta Data",
    features: [
      "GESCHLECHT", "ALTER_J",
  ],
  },
{
  title: "Proteinanalytik",
  features: [
    
    "Grobdifferenzierung", 
    "Totalprotein (Liquor)", 
    "Albumin (Liquor)", 
    "Albumin (Serum)", 
    "Albumin-Quotient",
    "IgG (Liquor)", 
    "IgG (Serum)", 
    "IgG-Quotient",
    "IgG-Index",
    "IgA (Liquor)", 
    "IgA (Serum)",
    "IgA-Quotient",
    "IgM (Liquor)", 
    "IgM (Serum)",
    "IgM-Quotient",
    "Kappa (Liquor)", 
    "Kappa (Serum)", 
    "Kappa-Quotient",
    "Kappa-Index",
    "Lambda (Liquor)", 
    "Lambda (Serum)", 
    "Lambda-Quotient",
  ],
},
{
  title: "Intrathekale Fraktionen nach Reiber",
  features: [
    "IgG(IF)", 
    "IgA(IF)", 
    "IgM(IF)",
    "Kappa(IF)",
    "IgG(LOC)", 
    "IgA(LOC)", 
    "IgM(LOC)",
    "Kappa(LOC)"
  ],
},
{
  title: "Oligoklonale Banden",
  features: [
    "Oligoklonale Banden (Liquor)", 
    "Oligoklonale Banden (Serum)",
    "OKB-Beurteilung",
  ],
},
  {
    title: "Liquorchemie",
    features: [
        "Glukose (Liquor)", 
        "Glukose (Plasma)", 
        "Glukose-Quotient", 
        "Laktat (Liquor)"
    ],
  },
  {
    title: "Zytologie",
    features: [
        "Lymphozyten", 
        "Aktivierte Lymphozyten", 
        "Zellzahl", 
        "Erythrozyten",
        "Korrigierte Zellzahl",
        "Plasmazellen",
        "Maligne Zellen", 
        "Makrophagen (bei Durchsicht)",
        "Makrophagen/Monozyten",
        "Neutrophile", 
        "Mitosen (bei Durchsicht)"
    ],
  },
];


//to load the template features (extracted from the document provided)
export const TEMPLATE_FEATURES = [
  { name: "ALTER_J", value: 50 },
  { name: "Aktivierte Lymphozyten", value: 0.9 },
  { name: "Albumin (Liquor)", value: "" },
  { name: "Albumin (Serum)", value: 77.2 },
  { name: "Albumin-Quotient", value: 18.1 },
  { name: "Basophile", value: null },
  { name: "Eosinophile", value: "" },
  { name: "Erythroblasten (bei Durchsicht)", value: "" },
  { name: "Erythrophagen (bei Durchsicht)", value: "" },
  { name: "Erythrozyten", value: null },
  { name: "GESCHLECHT", value: 0 },
  { name: "Glukose (Liquor)", value: null },
  { name: "Glukose (Plasma)", value: null },
  { name: "Glukose-Quotient", value: null },
  { name: "Grobdifferenzierung", value: 1 },
  { name: "IgA (Liquor)", value: 17.9 },
  { name: "IgA (Serum)", value: 2.93 },
  { name: "IgA(IF)", value: "" },
  { name: "IgA(LOC)", value: null },
  { name: "IgA-Quotient", value: 0.4 },
  { name: "IgG (Liquor)", value: 49.7 },
  { name: "IgG (Serum)", value: 11.8 },
  { name: "IgG(IF)", value: "" },
  { name: "IgG(LOC)", value: null },
  { name: "IgG-Index", value: 0.57 },
  { name: "IgG-Quotient", value: 14.2 },
  { name: "IgM (Liquor)", value: 0.337 },
  { name: "IgM (Serum)", value: 0.441 },
  { name: "IgM(IF)", value: 2.14 },
  { name: "IgM(LOC)", value: null },
  { name: "IgM-Quotient", value: 3 },
  { name: "Kappa (Liquor)", value: 0.756 },
  { name: "Kappa (Serum)", value: 9.1 },
  { name: "Kappa(IF)", value: 41 },
  { name: "Kappa(LOC)", value: null },
  { name: "Kappa-Index", value: 2.523 },
  { name: "Kappa-Quotient", value: 41.733 },
  { name: "Knorpelzellen (bei Durchsicht)", value: "" },
  { name: "Korrigierte Zellzahl", value: null },
  { name: "Laktat (Liquor)", value: null },
  { name: "Lambda (Liquor)", value: 0.716 },
  { name: "Lambda (Serum)", value: 12.9 },
  { name: "Lambda-Quotient", value: 21.827 },
  { name: "Leukophagen (bei Durchsicht)", value: null },
  { name: "Lymphozyten", value: 81 },
  { name: "MRZ(H)-Beurteilung", value: 0 },
  { name: "Makrophagen (bei Durchsicht)", value: null },
  { name: "Makrophagen/Monozyten", value: null },
  { name: "Maligne Zellen", value: null },
  { name: "Maligne Zellen (bei Durchsicht)", value: "" },
  { name: "Mitosen (bei Durchsicht)", value: "" },
  { name: "Neutrophile", value: null },
  { name: "OKB-Beurteilung", value: 0 },
  { name: "Oligoklonale Banden (Liquor)", value: 3 },
  { name: "Oligoklonale Banden (Serum)", value: 3 },
  { name: "Plasmazellen", value: 3 },
  { name: "Plasmazellen (bei Durchsicht)", value: null },
  { name: "Totalprotein (Liquor)", value: 574 },
  { name: "Zellzahl", value: 39 },
];

//units of mmt
export const FEATURE_UNITS = {
  "ALTER_J": "years",
  "Totalprotein (Liquor)": "mg/l",
  "Albumin (Liquor)": "mg/l",
  "Albumin (Serum)": "g/l",
  "Albumin-Quotient": "×10⁻³",
  "IgG (Liquor)": "mg/l",
  "IgG (Serum)": "g/l",
  "IgG-Quotient": "×10⁻³",
  "IgG-Index": "",
  "IgA (Liquor)": "mg/l",
  "IgA (Serum)": "g/l",
  "IgA-Quotient": "×10⁻³",
  "IgM (Liquor)": "mg/l",
  "IgM (Serum)": "g/l",
  "IgM-Quotient": "×10⁻³",
  "Kappa (Liquor)": "mg/l",
  "Kappa (Serum)": "mg/l",
  "Kappa-Quotient": "×10⁻³",
  "Kappa-Index": "",
  "Lambda (Liquor)": "mg/l",
  "Lambda (Serum)": "mg/l",
  "Lambda-Quotient": "×10⁻³",
  "IgG(IF)": "%",
  "IgA(IF)": "%",
  "IgM(IF)": "%",
  "Kappa(IF)": "%",
  "IgG(LOC)": "mg/l",
  "IgA(LOC)": "mg/l",
  "IgM(LOC)": "mg/l",
  "Kappa(LOC)": "mg/l",
  "Oligoklonale Banden im Liquor": "",
  "Oligoklonale Banden im Serum": "",
  "OKB-Beurteilung": "",
  "MRZ(H)-Beurteilung": "",
  "Glukose (Liquor)": "mmol/l",
  "Glukose (Plasma)": "mmol/l",
  "Glukose-Quotient": "",
  "Laktat (Liquor)": "mmol/l",
  "Lymphozyten": "%",
  "Aktivierte Lymphozyten": "%",
  "Zellzahl": "/µl",
  "Erythrozyten": "/µl",
  "Korrigierte Zellzahl": "/µl",
  "Plasmazellen": "%",
  "Plasmazellen (bei Durchsicht)": "%",
  "Maligne Zellen": "%",
  "Maligne Zellen (bei Durchsicht)": "%",
  "Makrophagen (bei Durchsicht)": "%",
  "Makrophagen/Monozyten": "%",
  "Neutrophile": "%",
  "Eosinophile": "%",
  "Basophile": "%",
  "Mitosen (bei Durchsicht)": "%",
  "Knorpelzellen (bei Durchsicht)": "%",
  "Erythroblasten (bei Durchsicht)": "%",
  "Erythrophagen (bei Durchsicht)": "%",
};
//ENGLISH label names
export const FEATURE_LABEL_EN = {
  "GESCHLECHT": "Sex",
  "ALTER_J": "Age",
  "Grobdifferenzierung": "CSF Differential",
  "Totalprotein (Liquor)": "Total Protein (CSF)",
  "Albumin (Liquor)": "Albumin (CSF)",
  "Albumin (Serum)": "Albumin (Serum)",
  "Albumin-Quotient": "Albumin Ratio",
  "IgG (Liquor)": "IgG (CSF)",
  "IgG (Serum)": "IgG (Serum)",
  "IgG-Quotient": "IgG Ratio",
  "IgG-Index": "IgG Index",
  "IgA (Liquor)": "IgA (CSF)",
  "IgA im Serum": "IgA (Serum)",
  "IgA-Quotient": "IgA Ratio",
  "IgM (Liquor)": "IgM (CSF)",
  "IgM im Serum": "IgM (Serum)",
  "IgM-Quotient": "IgM Ratio",
  "Kappa (Liquor)": "FLC Kappa (CSF)",
  "Kappa im Serum": "FLC Kappa (Serum)",
  "Kappa-Quotient": "FLC Kappa Ratio",
  "Kappa-Index": "FLC Kappa Index",
  "Lambda (Liquor)": "FLC Lambda (CSF)",
  "Lambda (Serum)": "FLC Lambda (Serum)",
  "Lambda-Quotient": "FLC Lambda Ratio",
  "IgG(IF)": "IgG IF",
  "IgA(IF)": "IgA IF",
  "IgM(IF)": "IgM IF",
  "Kappa(IF)": "FLC Kappa IF",
  "IgG(LOC)": "IgG LOC",
  "IgA(LOC)": "IgA LOC",
  "IgM(LOC)": "IgM LOC",
  "Kappa(LOC)": "FLC Kappa LOC",
  "Oligoklonale Banden (Liquor)": "OCB (CSF)",
  "Oligoklonale Banden (Serum)": "OCB (Serum)",
  "OKB-Beurteilung": "CSF-specific OCB",
  "MRZ(H)-Beurteilung": "MRZ(H) Reaction",
  "Glukose (Liquor)": "Glucose (CSF)",
  "Glukose (Plasma)": "Glucose (Serum)",
  "Glukose-Quotient": "Glucose Ratio",
  "Laktat (Liquor)": "Lactate (CSF)",
  "Lymphozyten": "Lymphocytes",
  "Aktivierte Lymphozyten": "Activated Lymphocytes",
  "Zellzahl": "Total Cell Count",
  "Erythrozyten": "Erythrocytes",
  "Korrigierte Zellzahl": "Corrected Cell Count",
  "Plasmazellen": "Plasma Cells",
  "Plasmazellen (bei Durchsicht)": "Plasma Cells upon Cytological Review",
  "Maligne Zellen": "Malignant Cells",
  "Maligne Zellen (bei Durchsicht)": "Malignant Cells upon Cytological Review",
  "Makrophagen (bei Durchsicht)": "Macrophages upon Cytological Review",
  "Makrophagen/Monozyten": "Macrophages/Monocytes",
  "Neutrophile": "Neutrophils",
  "Eosinophile": "Eosinophils",
  "Basophile": "Basophils",
  "Mitosen (bei Durchsicht)": "Mitoses upon Cytological Review",
  "Knorpelzellen (bei Durchsicht)": "Cartilage Cells upon Cytological Review",
  "Erythroblasten (bei Durchsicht)": "Erythroblasts upon Cytological Review",
  "Erythrophagen (bei Durchsicht)": "Erythrophages upon Cytological Review",
};

//ENGLISH measurement category titles 
export const TITLE_LABEL_EN = {
  "Meta Data":"Meta Data",
  "Proteinanalytik":"Protein Analysis",
  "Intrathekale Fraktionen nach Reiber":"Intrathecal Fractions according to Reiber",
  "MRZ-Reaktion": "MRZ Reaction",
  "Oligoklonale Banden":"Oligoclonal Bands",
  "Liquorchemie": "CSF Chemistry",
  "Zytologie":"Cytology"
};

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

//use expected features here, not the per use case list of features!
export function buildManualPayload(disease, expectedFeaturesList, uiFeatures) {
  const map = new Map(uiFeatures.map(f => [f.name, f.value]));
  const featuresObj = {};
  expectedFeaturesList.forEach((name) => {
    featuresObj[name] = map.has(name) ? map.get(name) : ""; // or null/NaN as your backend prefers
  });
  return {
    model_type: getModelLabel(disease),
    features: featuresObj,
  };
}

// guard to notice quickly if the key is wrong
export function assertValidModelKey(k) {
  const ok = ["MAG7","MAG6","INF3","INF1"].includes(k);
  if (!ok) {
    throw new Error(`Unknown model_key "${k}". Expected one of MAG7|MAG6|INF3|INF1`);
  }
}

export const EXPECTED_BY_DISEASE_DEBUG = EXPECTED_BY_DISEASE;