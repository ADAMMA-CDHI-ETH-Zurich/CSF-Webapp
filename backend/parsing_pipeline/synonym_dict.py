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
    
    "IgA(IF)": {
        "de": [
            "IgA(IF)",
            "IgA (IF)",
            "IgA IF",
            "IgA Immunfixation"
        ],
        "en": [
            "IgA(IF)",
            "IgA IF",
            "IgA Immunofixation",
            "IgA immunofixation"
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
    
    "IgG(IF)": {
        "de": [
            "IgG(IF)",
            "IgG (IF)",
            "IgG IF",
            "IgG Immunfixation"
        ],
        "en": [
            "IgG(IF)",
            "IgG IF",
            "IgG Immunofixation",
            "IgG immunofixation"
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
    
    "Mitosen (bei Durchsicht)": {
        "de": [
            "Mitosen (bei Durchsicht)",
            "Mitosen",
            "mitotische Zellen",
            "Zellteilung"
        ],
        "en": [
            "Mitoses (on review)",
            "Mitoses",
            "mitotic cells",
            "cell division"
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
    
    "Lambda(IF)": {
        "de": [
            "Lambda(IF)",
            "Lambda (IF)",
            "Lambda IF",
            "Lambda Immunfixation"
        ],
        "en": [
            "Lambda(IF)",
            "Lambda IF",
            "Lambda Immunofixation",
            "λ immunofixation"
        ]
    },
    
    "Eosinophile": {
        "de": [
            "Eosinophile",
            "eosinophile Granulozyten",
            "Eos",
            "Eosinophile Leukozyten"
        ],
        "en": [
            "Eosinophils",
            "eosinophil granulocytes",
            "Eos",
            "eosinophilic leukocytes"
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
    },
    
    "Oligoklonale Banden Typ": {
        "de": [
            "Oligoklonale Banden Typ",
            "OKB Typ",
            "OCB Typ",
            "oligoklonale Banden Muster"
        ],
        "en": [
            "Oligoclonal Bands Type",
            "OCB Type",
            "oligoclonal band pattern",
            "OCB pattern"
        ]
    },
    
    "Protein (Serum)": {
        "de": [
            "Protein (Serum)",
            "Protein im Serum",
            "Serum-Protein",
            "Gesamtprotein Serum",
            "Serumprotein"
        ],
        "en": [
            "Protein (Serum)",
            "Serum Protein",
            "Total Serum Protein",
            "Blood protein",
            "Serum total protein"
        ]
    },
    "Glukose (Serum)": {
        "de": [
            "Glukose (Serum)",
            "Glukose im Serum",
            "Serum-Glukose",
            "Blutzucker",
            "Serumglukose"
        ],
        "en": [
            "Glucose (Serum)",
            "Serum Glucose",
            "Blood Glucose",
            "Blood sugar",
            "Serum sugar"
        ]
    },
    "Laktat (Serum)": {
        "de": [
            "Laktat (Serum)",
            "Laktat im Serum",
            "Serum-Laktat",
            "Serumlaktat",
            "Blut-Laktat"
        ],
        "en": [
            "Lactate (Serum)",
            "Serum Lactate",
            "Blood Lactate",
            "Serum lactic acid",
            "Blood lactic acid"
        ]
    },
    "Intrathekale IgG-Synthese": {
        "de": [
            "Intrathekale IgG-Synthese",
            "intrathekale IgG Produktion",
            "IgG Synthese intrathekal",
            "lokale IgG-Synthese"
        ],
        "en": [
            "Intrathecal IgG Synthesis",
            "intrathecal IgG production",
            "local IgG synthesis",
            "IgG synthesis intrathecal"
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