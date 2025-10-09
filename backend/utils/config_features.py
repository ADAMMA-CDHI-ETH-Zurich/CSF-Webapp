# EXPECTED_FEATURES = [
#     # your canonical 50 feature names in exactly the order the scaler expects
#     "glucose_liquor", "glucose_plasma", "albumin_serum", "albumin_liquor",
#     "kappa_index", "lambda_quotient", "lymphocytes", "neutrophils",
#     # ... add all 50 ...
# ]

#TODO M: ask the Age and Gender in the front end! 
#TODO M: define expected features per use case so extend this part
EXPECTED_FEATURES = ["Aktivierte Lymphozyten", "Albumin (Liquor)", "Albumin (Serum)", "Albumin-Quotient", "Basophile",
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



# EXPECTED_FEATURES = [#----------Proteinanalytik----------
#                      "Aktivierte Lymphozyten", Grobdifferenzierung, "Totalprotein (Liquor)", 
#                      "Albumin (Liquor)", "Albumin (Serum)", "Albumin-Quotient",
#                      "IgG (Liquor)", "IgG (Serum)", "IgG-Quotient","IgG-Index",
#                      "IgA (Liquor)", "IgA (Serum)","IgA-Quotient","IgA(LOC)"
#                      "IgM (Liquor)", "IgM (Serum)","IgM-Quotient",
#                      "Kappa (Liquor)", "Kappa (Serum)", "Kappa-Quotient","Kappa-Index",
#                      "Lambda (Liquor)", "Lambda (Serum)", "Lambda-Quotient",

#                      #----------Intrathekale Fraktionen nach Reiber----------
#                      "IgG(IF)", "IgA(IF)", "IgM(IF)", "IgA(LOC)","IgG(LOC)","IgM(LOC)"

#                      #----------Oligoklonale Banden----------
#                      "Oligoklonale Banden (Liquor)", "Oligoklonale Banden (Serum)","OKB-Beurteilung",

#                      #----------MRZ-Reaktion----------
#                      "MRZ(H)-Beurteilung"

#                      #----------Liquorchemie----------
#                      "Glukose (Liquor)", "Glukose (Plasma)", "Laktat (Liquor)", "Glukose-Quotient", 
# 

#                      #----------Zytologie----------
#                      "Zellzahl", "Erythrozyten", "Korrigierte Zellzahl", "Lymphozyten", "Plasmazellen","Plasmazellen (bei Durchsicht)", "Makrophagen (bei Durchsicht)", "Makrophagen/Monozyten",
#                      "Maligne Zellen", "Maligne Zellen (bei Durchsicht)", "Mitosen (bei Durchsicht)", "Neutrophile", "Eosinophile", "Basophile", Erythroblasten (bei Durchsicht)", "Erythrophagen (bei Durchsicht)",
#                       "Knorpelzellen (bei Durchsicht)","Leukophagen (bei Durchsicht)"
#                      ]



#GESCHLECHT M:0, W:1'

categorical_features = ["Grobdifferenzierung", 
                        "Oligoklonale Banden (Liquor)", 
                        "Oligoklonale Banden (Serum)",
                        "OKB-Beurteilung",
                        "MRZ(H)-Beurteilung"]


measurement='Grobdifferenzierung'
mapping1 = {'vorw. mononukleär': 1, 'vorw. polynukleär': 3, 'gemisch': 2,
            'gemischt poly- und mononukleär': 2, 'gemischt': 2}


measurement='OKB-Beurteilung'
mapping2 = {'OKB Typ I': 0, 'OKB Typ IV': 0, 'V.a. OKB Typ V': 0, 'OKB Typ III' : 1, 'OKB Typ II': 1}

measurement='MRZ(H)-Beurteilung'
mapping3 = {'negativ (0/3)': 0, 'negativ (1/3)': 0, 'positiv (3/3)': 1,
       'positiv (2/3; zusätzlich fraglich positiv: 1/3)': 1, 'positiv (2/3)': 1,
       'negativ (0/4)': 0, 'negativ (1/4)': 0, 'positiv (2/4)': 1}

#TODO M: Here I need to extract what comes after the posivit or negative
measurement='Oligoklonale Banden (Liquor)'
mapping3 = {'negativ (0/3)': 0, 'negativ (1/3)': 0, 'positiv (3/3)': 1,
       'positiv (2/3; zusätzlich fraglich positiv: 1/3)': 1, 'positiv (2/3)': 1,
       'negativ (0/4)': 0, 'negativ (1/4)': 0, 'positiv (2/4)': 1}

measurement='Oligoklonale Banden (Serum)'


# Synonyms → canonical (regex is flexible; keep it short & audited)
# Key is the pattern to look for: value is the standardized feature name here
# SYNONYMS = {
#     #USZ Report Specifically
#     # Totalprotein
#     r"^Totalprotein\s+im\s+Liquor$": "Totalprotein (Liquor)",

#     # Albumin Variants
#     r"^Albumin\s+im\s+Liquor$": "Albumin (Liquor)",
#     r"^Albumin\s*\(Liquor\)$": "Albumin (Liquor)",
#     r"^Albumin\s+im\s+Serum$": "Albumin (Serum)",
#     r"^Albumin\s*\(Serum\)$": "Albumin (Serum)",
#     r"^Albumin-?Quotient$": "Albumin-Quotient",
    
#     # Glukose Variants
#     r"^Glukose\s+im\s+Liquor$": "Glukose (Liquor)",
#     r"^Glukose\s*\(Liquor\)$": "Glukose (Liquor)",
#     r"^Glukose\s+im\s+Plasma$": "Glukose (Plasma)",
#     r"^Glukose\s*\(Plasma\)$": "Glukose (Plasma)",
#     r"^Glukose-?Quotient$": "Glukose-Quotient",

#     # IgA Variants
#     r"^IgA\s+im\s+Liquor$": "IgA (Liquor)",
#     r"^IgA\s*\(Liquor\)$": "IgA (Liquor)",
#     r"^IgA\s+im\s+Serum$": "IgA (Serum)",
#     r"^IgA\s*\(Serum\)$": "IgA (Serum)",
#     r"^IgA-?Quotient$": "IgA-Quotient",
#     r"^IgA-?Index$": "IgA-Index",
#     r"^IgA-?(LOC)$": "IgA(LOC)",
#     r"^IgA-?IF$": "IgA(IF)",

#     # IgG Variants
#     r"^IgG\s+im\s+Liquor$": "IgG (Liquor)",
#     r"^IgG\s*\(Liquor\)$": "IgG (Liquor)",
#     r"^IgG\s+im\s+Serum$": "IgG (Serum)",
#     r"^IgG\s*\(Serum\)$": "IgG (Serum)",
#     r"^IgG-?Quotient$": "IgG-Quotient",
#     r"^IgG-?Index$": "IgG-Index",
#     r"^IgG-?(LOC)$": "IgG(LOC)",
#     r"^IgG-?IF$": "IgG(IF)",

#     # IgM Variants
#     r"^IgM\s+im\s+Liquor$": "IgM (Liquor)",
#     r"^IgM\s*\(Liquor\)$": "IgM (Liquor)",
#     r"^IgM\s+im\s+Serum$": "IgM (Serum)",
#     r"^IgM\s*\(Serum\)$": "IgM (Serum)",
#     r"^IgM-?Quotient$": "IgM-Quotient",
#     r"^IgM-?Index$": "IgM-Index",
#     r"^IgM-?(LOC)$": "IgM(LOC)",
#     r"^IgM-?IF$": "IgM(IF)",

#     # Lambda Variants
#     r"^Lambda\s+im\s+Liquor$": "Lambda (Liquor)",
#     r"^Lambda\s*\(Liquor\)$": "Lambda (Liquor)",
#     r"^Lambda\s+im\s+Serum$": "Lambda (Serum)",
#     r"^Lambda\s*\(Serum\)$": "Lambda (Serum)",
#     r"^Lambda-?Quotient$": "Lambda-Quotient",
#     r"^Lambda-?Index$": "Lambda-Index",

#     # Kappa Variants
#     r"^Kappa\s+im\s+Liquor$": "Kappa (Liquor)",
#     r"^Kappa\s*\(Liquor\)$": "Kappa (Liquor)",
#     r"^Kappa\s+im\s+Serum$": "Kappa (Serum)",
#     r"^Kappa\s*\(Serum\)$": "Kappa (Serum)",
#     r"^Kappa-?Quotient$": "Kappa-Quotient",
#     r"^Kappa-?Index$": "Kappa-Index",
#     r"^Kappa-?(LOC)$": "Kappa(LOC)",
#     r"^Kappa-?IF$": "Kappa(IF)",

#     # Oligoklonale Banden
#     r"^Oligoklonale\sBanden\s+im\s+Liquor$": "Oligoklonale Banden (Liquor)",
#     r"^Oligoklonale\sBanden\s+im\s+Serum$": "Oligoklonale Banden (Serum)",

#     # Lymphozyten
#     r"^Lymphozyten|lymphocytes$": "Lymphozyten",
#     r"^Aktivierte\s+Lymphocytes$": "Aktivierte Lymphozyten",

#     r"^Neutrophile|neutrophils$": "Neutrophile",

#     #TODO: Maybe this is binary!!!
#     r"^Grobdiff.*$": "Grobdifferenzierung",  # OCR-spelling tolerant
#     # ...
# }

# Units map (what you expect per feature)
# None means unitless count/ratio/index
EXPECTED_UNITS = {
    "glucose_liquor": "mg/dL",
    "glucose_plasma": "mg/dL",
    "albumin_serum": "g/L",
    "albumin_liquor": "g/L",
    "kappa_index": None,
    # ...
}

# Plausibility ranges (post-normalization)
RANGES = {
    "glucose_liquor": (5, 150),
    "glucose_plasma": (20, 400),
    "albumin_serum": (1, 60),
    "albumin_liquor": (0.01, 5),
    "kappa_index": (0, 50),
    # ...
}
