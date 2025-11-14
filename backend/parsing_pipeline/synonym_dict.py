"""
Feature synonym dictionary for CSF/Liquor lab report extraction.
Contains German and English synonyms for all 50 medical features.
"""

FEATURE_SYNONYMS = {
    "Aktivierte Lymphozyten": {
        "de": [
            "Aktivierte Lymphozyten",
            "aktivierte Lymphozyten",
            "Lymphozyten aktiviert",
            "aktiv. Lymphozyten"
        ],
        "en": [
            "Activated Lymphocytes",
            "activated lymphocytes",
            "lymphocyte activation",
            "active lymphocytes"
        ]
    },
    "Albumin-Quotient": {
    "de": [
        "Albumin-Quotient",
        "Albumin Quotient",
        "QAlbumin",
        "Quotient Albumin",
        "Albumin Verhältnis"
    ],
    "en": [
        "Albumin Quotient",
        "QAlbumin",
        "Albumin ratio",
        "Albumin quotient value",
        "Albumin concentration ratio"
    ]
},
"Glukose (Plasma)": {
    "de": [
        "Glukose (Plasma)",
        "Plasmaglukose",
        "Glukose im Plasma",
        "Blutglukose (Plasma)",
        "Plasma-Zucker"
    ],
    "en": [
        "Glucose (Plasma)",
        "Plasma glucose",
        "Blood glucose (plasma)",
        "Plasma sugar",
        "Glucose concentration in plasma"
    ]
},
"Glukose-Quotient": {
    "de": [
        "Glukose-Quotient",
        "Glukose Quotient",
        "QGlukose",
        "Glukose Verhältnis",
        "Quotient Glukose"
    ],
    "en": [
        "Glucose Quotient",
        "Glucose ratio",
        "QGlucose",
        "Glucose concentration ratio",
        "Glucose quotient value"
    ]
},

    "Albumin (Serum)": {
        "de": [
            "Albumin (Serum)",
            "Albumin im Serum",
            "Serum-Albumin",
            "Serumalbumin",
            "S-Albumin"
        ],
        "en": [
            "Albumin (Serum)",
            "Serum Albumin",
            "Blood Albumin",
            "S-Albumin",
            "Albumin in Serum"
        ]
    },
    
    "Erythrozyten": {
        "de": [
            "Erythrozyten",
            "Erythrozytenzahl",
            "rote Blutkörperchen",
            "RBC",
            "Erys"
        ],
        "en": [
            "Erythrocytes",
            "Red Blood Cells",
            "RBC",
            "red blood cell count",
            "erythrocyte count"
        ]
    },
    
    "Glukose (Liquor)": {
        "de": [
            "Glukose (Liquor)",
            "Glukose im Liquor",
            "Liquor-Glukose",
            "Liquorglukose",
            "CSF Glukose"
        ],
        "en": [
            "Glucose (CSF)",
            "CSF Glucose",
            "Cerebrospinal fluid glucose",
            "Glucose in CSF",
            "CSF sugar"
        ]
    },
    
    "IgA (Liquor)": {
        "de": [
            "IgA (Liquor)",
            "IgA im Liquor",
            "Liquor-IgA",
            "Liquor IgA",
            "CSF IgA"
        ],
        "en": [
            "IgA (CSF)",
            "CSF IgA",
            "Immunoglobulin A in CSF",
            "IgA in cerebrospinal fluid",
            "CSF Immunoglobulin A"
        ]
    },
    
    "IgA (Serum)": {
        "de": [
            "IgA (Serum)",
            "IgA im Serum",
            "Serum-IgA",
            "Serum IgA",
            "S-IgA"
        ],
        "en": [
            "IgA (Serum)",
            "Serum IgA",
            "Immunoglobulin A",
            "Blood IgA",
            "Serum Immunoglobulin A"
        ]
    },
    
    
    "IgA-Quotient": {
        "de": [
            "IgA-Quotient",
            "IgA Quotient",
            "IgA-Q",
            "QIgA"
        ],
        "en": [
            "IgA Quotient",
            "IgA-Quotient",
            "IgA ratio",
            "QIgA"
        ]
    },
    
    "IgG (Serum)": {
        "de": [
            "IgG (Serum)",
            "IgG im Serum",
            "Serum-IgG",
            "Serum IgG",
            "S-IgG"
        ],
        "en": [
            "IgG (Serum)",
            "Serum IgG",
            "Immunoglobulin G",
            "Blood IgG",
            "Serum Immunoglobulin G"
        ]
    },
    
    "IgG-Index": {
        "de": [
            "IgG-Index",
            "IgG Index",
            "IgG-I",
            "Link-Index"
        ],
        "en": [
            "IgG Index",
            "IgG-Index",
            "Link Index",
            "IgG synthesis index"
        ]
    },
    
    "IgM (Liquor)": {
        "de": [
            "IgM (Liquor)",
            "IgM im Liquor",
            "Liquor-IgM",
            "Liquor IgM",
            "CSF IgM"
        ],
        "en": [
            "IgM (CSF)",
            "CSF IgM",
            "Immunoglobulin M in CSF",
            "IgM in cerebrospinal fluid",
            "CSF Immunoglobulin M"
        ]
    },
    
    "IgM-Quotient": {
        "de": [
            "IgM-Quotient",
            "IgM Quotient",
            "IgM-Q",
            "QIgM"
        ],
        "en": [
            "IgM Quotient",
            "IgM-Quotient",
            "IgM ratio",
            "QIgM"
        ]
    },
    
    "Kappa (Liquor)": {
        "de": [
            "Kappa (Liquor)",
            "Kappa im Liquor",
            "Liquor-Kappa",
            "Kappa leichte Ketten Liquor",
            "κ Liquor"
        ],
        "en": [
            "Kappa (CSF)",
            "CSF Kappa",
            "Kappa light chains CSF",
            "κ CSF",
            "Kappa in cerebrospinal fluid"
        ]
    },
    
    "Kappa (Serum)": {
        "de": [
            "Kappa (Serum)",
            "Kappa im Serum",
            "Serum-Kappa",
            "Kappa leichte Ketten Serum",
            "κ Serum"
        ],
        "en": [
            "Kappa (Serum)",
            "Serum Kappa",
            "Kappa light chains",
            "κ Serum",
            "Serum kappa chains"
        ]
    },
    
    "Kappa(IF)": {
        "de": [
            "Kappa(IF)",
            "Kappa (IF)",
            "Kappa IF",
            "Kappa Immunfixation"
        ],
        "en": [
            "Kappa(IF)",
            "Kappa IF",
            "Kappa Immunofixation",
            "κ immunofixation"
        ]
    },
    "Grobdifferenzierung": {
    "de": [
        "Grobdifferenzierung",
        "Grobe Differenzierung",
        "Zelldifferenzierung grob",
        "Grob-Differenzierung",
        "Basisdifferenzierung"
    ],
    "en": [
        "Coarse differentiation",
        "Basic differentiation",
        "Cell differentiation (coarse)",
        "Rough differentiation",
        "Preliminary differentiation"
    ]
},
"IgA(LOC)": {
    "de": [
        "IgA(LOC)",
        "IgA Lokalisation",
        "lokale IgA-Synthese",
        "intrathekale IgA Aktivität",
        "lokal produziertes IgA"
    ],
    "en": [
        "IgA(LOC)",
        "IgA localization",
        "local IgA synthesis",
        "intrathecal IgA activity",
        "locally produced IgA"
    ]
},
"IgG(LOC)": {
    "de": [
        "IgG(LOC)",
        "IgG Lokalisation",
        "lokale IgG-Synthese",
        "intrathekale IgG Aktivität",
        "lokal produziertes IgG"
    ],
    "en": [
        "IgG(LOC)",
        "IgG localization",
        "local IgG synthesis",
        "intrathecal IgG activity",
        "locally produced IgG"
    ]
},
"IgG-Quotient": {
    "de": [
        "IgG-Quotient",
        "IgG Quotient",
        "QIgG",
        "Quotient IgG",
        "IgG Verhältnis"
    ],
    "en": [
        "IgG Quotient",
        "QIgG",
        "IgG ratio",
        "IgG concentration ratio",
        "IgG quotient value"
    ]
},
"IgM(LOC)": {
    "de": [
        "IgM(LOC)",
        "IgM Lokalisation",
        "lokale IgM-Synthese",
        "intrathekale IgM Aktivität",
        "lokal produziertes IgM"
    ],
    "en": [
        "IgM(LOC)",
        "IgM localization",
        "local IgM synthesis",
        "intrathecal IgM activity",
        "locally produced IgM"
    ]
},
"Kappa(LOC)": {
    "de": [
        "Kappa(LOC)",
        "Kappa Lokalisation",
        "lokale Kappa-Synthese",
        "intrathekale Kappa Aktivität",
        "lokal produzierte Kappa-Leichtketten"
    ],
    "en": [
        "Kappa(LOC)",
        "Kappa localization",
        "local Kappa synthesis",
        "intrathecal Kappa activity",
        "locally produced Kappa light chains"
    ]
},
"Kappa-Index": {
    "de": [
        "Kappa-Index",
        "Kappa Index",
        "Index Kappa",
        "Kappa-Syntheseindex",
        "Kappa Aktivitätsindex"
    ],
    "en": [
        "Kappa Index",
        "Kappa synthesis index",
        "Kappa activity index",
        "Index Kappa",
        "Kappa index value"
    ]
},
"Leukophagen (bei Durchsicht)": {
    "de": [
        "Leukophagen (bei Durchsicht)",
        "Leukophagen",
        "phagozytierende Leukozyten",
        "Leukozyten mit Phagozytose",
        "Leukozytenfresser"
    ],
    "en": [
        "Leukophages (on review)",
        "leukophages",
        "phagocytic leukocytes",
        "leukocytes with phagocytosis",
        "phagocytic WBCs"
    ]
},
    "MRZ(H)-Beurteilung": {
    "de": [
        "MRZ(H)-Beurteilung",
        "MRZ Beurteilung",
        "MRZ(H) Bewertung",
        "MRZ(H) Interpretation",
        "MRZ-Antikörperprofil"
    ],
    "en": [
        "MRZ(H) assessment",
        "MRZ evaluation",
        "MRZ(H) interpretation",
        "MRZ antibody profile",
        "MRZ(H) result assessment"
    ]
},
"Makrophagen (bei Durchsicht)": {
    "de": [
        "Makrophagen (bei Durchsicht)",
        "Makrophagen",
        "Makrophagen Nachweis",
        "Makrophagen Sichtung",
        "phagozytierende Makrophagen"
    ],
    "en": [
        "Macrophages (on review)",
        "macrophage detection",
        "macrophages identified",
        "macrophage review",
        "phagocytic macrophages"
    ]
},
"Maligne Zellen": {
    "de": [
        "Maligne Zellen",
        "maligne Tumorzellen",
        "bösartige Zellen",
        "neoplastische Zellen",
        "Krebszellen im Liquor"
    ],
    "en": [
        "Malignant cells",
        "malignant tumor cells",
        "cancer cells",
        "neoplastic cells",
        "malignant cells in CSF"
    ]
},
"Oligoklonale Banden (Liquor)": {
    "de": [
        "Oligoklonale Banden (Liquor)",
        "OKB Liquor",
        "OCB Liquor",
        "oligoklonale Banden im Liquor",
        "Liquor OCB"
    ],
    "en": [
        "Oligoclonal bands (CSF)",
        "OCB CSF",
        "OCB in CSF",
        "CSF oligoclonal bands",
        "cerebrospinal fluid OCB"
    ]
},
"Oligoklonale Banden (Serum)": {
    "de": [
        "Oligoklonale Banden (Serum)",
        "OKB Serum",
        "OCB Serum",
        "oligoklonale Banden im Serum",
        "Serum OCB"
    ],
    "en": [
        "Oligoclonal bands (Serum)",
        "OCB serum",
        "serum oligoclonal bands",
        "oligoclonal bands in serum",
        "serum OCB profile"
    ]
},
"Plasmazellen (bei Durchsicht)": {
    "de": [
        "Plasmazellen (bei Durchsicht)",
        "Plasmazellen Sichtung",
        "Plasmazellen Nachweis",
        "Plasma-Zellen (Durchsicht)",
        "Plasmazellen identifiziert"
    ],
    "en": [
        "Plasma cells (on review)",
        "plasma cell detection",
        "plasma cell identification",
        "reviewed plasma cells",
        "plasma cells noted"
    ]
},
    "Kappa-Quotient": {
        "de": [
            "Kappa-Quotient",
            "Kappa Quotient",
            "κ-Quotient",
            "QKappa"
        ],
        "en": [
            "Kappa Quotient",
            "Kappa-Quotient",
            "κ ratio",
            "QKappa"
        ]
    },
    
    "Korrigierte Zellzahl": {
        "de": [
            "Korrigierte Zellzahl",
            "korr. Zellzahl",
            "Zellzahl korrigiert",
            "korrigierte Leukozytenzahl"
        ],
        "en": [
            "Corrected Cell Count",
            "corrected cell count",
            "adjusted cell count",
            "corrected leukocyte count"
        ]
    },
    
    "Laktat (Liquor)": {
        "de": [
            "Laktat (Liquor)",
            "Laktat im Liquor",
            "Liquor-Laktat",
            "Liquorlaktat",
            "CSF Laktat"
        ],
        "en": [
            "Lactate (CSF)",
            "CSF Lactate",
            "Cerebrospinal fluid lactate",
            "Lactate in CSF",
            "CSF lactic acid"
        ]
    },
    
    "Lambda (Liquor)": {
        "de": [
            "Lambda (Liquor)",
            "Lambda im Liquor",
            "Liquor-Lambda",
            "Lambda leichte Ketten Liquor",
            "λ Liquor"
        ],
        "en": [
            "Lambda (CSF)",
            "CSF Lambda",
            "Lambda light chains CSF",
            "λ CSF",
            "Lambda in cerebrospinal fluid"
        ]
    },
    
    "Lambda-Quotient": {
        "de": [
            "Lambda-Quotient",
            "Lambda Quotient",
            "λ-Quotient",
            "QLambda"
        ],
        "en": [
            "Lambda Quotient",
            "Lambda-Quotient",
            "λ ratio",
            "QLambda"
        ]
    },
    
    "Lymphozyten": {
        "de": [
            "Lymphozyten",
            "Lymphozytenzahl",
            "Lymphos",
            "Lymphozyten Anteil"
        ],
        "en": [
            "Lymphocytes",
            "Lymphocyte count",
            "Lymphs",
            "Lymphocyte percentage"
        ]
    },
    
    "Makrophagen/Monozyten": {
        "de": [
            "Makrophagen/Monozyten",
            "Monozyten",
            "Makrophagen",
            "Monos",
            "Monozyten/Makrophagen"
        ],
        "en": [
            "Macrophages/Monocytes",
            "Monocytes",
            "Macrophages",
            "Monos",
            "Monocytes/Macrophages"
        ]
    },
    
    "Neutrophile": {
        "de": [
            "Neutrophile",
            "neutrophile Granulozyten",
            "Neutros",
            "segmentkernige Granulozyten"
        ],
        "en": [
            "Neutrophils",
            "neutrophil granulocytes",
            "Neutros",
            "segmented neutrophils"
        ]
    },
    
    "OKB-Beurteilung": {
        "de": [
            "OKB-Beurteilung",
            "OKB Beurteilung",
            "oligoklonale Banden Beurteilung",
            "OKB",
            "OCB Beurteilung"
        ],
        "en": [
            "OCB Assessment",
            "oligoclonal bands assessment",
            "OCB evaluation",
            "oligoclonal band interpretation"
        ]
    },
    
    "Totalprotein (Liquor)": {
        "de": [
            "Totalprotein (Liquor)",
            "Totalprotein im Liquor",
            "Liquor-Totalprotein",
            "Gesamtprotein Liquor",
            "TP Liquor",
            "Liquor Gesamteiweiß"
        ],
        "en": [
            "Total Protein (CSF)",
            "CSF Total Protein",
            "TP CSF",
            "Cerebrospinal Fluid Protein",
            "Total CSF protein"
        ]
    },
    
    "Zellzahl": {
        "de": [
            "Zellzahl",
            "Gesamtzellzahl",
            "Zellzahl im Liquor",
            "Zellen gesamt",
            "Leukozytenzahl"
        ],
        "en": [
            "Cell count",
            "Total cell count",
            "Cell number",
            "WBC count",
            "Leukocyte count"
        ]
    },
    
    "IgM (Serum)": {
        "de": [
            "IgM (Serum)",
            "IgM im Serum",
            "Serum-IgM",
            "Serum IgM",
            "S-IgM"
        ],
        "en": [
            "IgM (Serum)",
            "Serum IgM",
            "Immunoglobulin M",
            "Blood IgM",
            "Serum Immunoglobulin M"
        ]
    },
    
    "IgM(IF)": {
        "de": [
            "IgM(IF)",
            "IgM (IF)",
            "IgM IF",
            "IgM Immunfixation"
        ],
        "en": [
            "IgM(IF)",
            "IgM IF",
            "IgM Immunofixation",
            "IgM immunofixation"
        ]
    },
    
    "Lambda (Serum)": {
        "de": [
            "Lambda (Serum)",
            "Lambda im Serum",
            "Serum-Lambda",
            "Lambda leichte Ketten Serum",
            "λ Serum"
        ],
        "en": [
            "Lambda (Serum)",
            "Serum Lambda",
            "Lambda light chains",
            "λ Serum",
            "Serum lambda chains"
        ]
    },
    "Basophile": {
        "de": [
            "Basophile",
            "basophile Granulozyten",
            "Basos",
            "Basophile Leukozyten"
        ],
        "en": [
            "Basophils",
            "basophil granulocytes",
            "Basos",
            "basophilic leukocytes"
        ]
    },
    "Plasmazellen": {
        "de": [
            "Plasmazellen",
            "Plasma-Zellen",
            "Plasmocyten"
        ],
        "en": [
            "Plasma cells",
            "Plasma-cells",
            "Plasmocytes",
            "Plasmacytes"
        ]
    },
    "IgG (Liquor)": {
        "de": [
            "IgG (Liquor)",
            "IgG im Liquor",
            "Liquor-IgG",
            "Liquor IgG",
            "CSF IgG"
        ],
        "en": [
            "IgG (CSF)",
            "CSF IgG",
            "Immunoglobulin G in CSF",
            "IgG in cerebrospinal fluid",
            "CSF Immunoglobulin G"
        ]
    }
}


def get_all_feature_names():
    return list(FEATURE_SYNONYMS.keys())


def get_synonyms_for_feature(feature_name):
    return FEATURE_SYNONYMS.get(feature_name, {})


def get_total_synonym_count():
    count = 0
    for feature_data in FEATURE_SYNONYMS.values():
        for lang_synonyms in feature_data.values():
            count += len(lang_synonyms)
    return count


if __name__ == "__main__":
    print(f"Total features: {len(FEATURE_SYNONYMS)}")
    print(f"Total synonyms: {get_total_synonym_count()}")