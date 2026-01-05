# EXPECTED_FEATURES = [
#     # your canonical 50 feature names in exactly the order the scaler expects
#     "glucose_liquor", "glucose_plasma", "albumin_serum", "albumin_liquor",
#     "kappa_index", "lambda_quotient", "lymphocytes", "neutrophils",
#     # ... add all 50 ...
# ]

#TODO M: ask the Age and Gender in the front end! 
#TODO M: define expected features per use case so extend this part
EXPECTED_FEATURES = [
"Aktivierte Lymphozyten", 
"Albumin (Liquor)", 
"Albumin (Serum)", 
"Albumin-Quotient",
"Auffaellige Zellen",
"Auffaellige Zellen (bei Durchsicht)",
"Basophile",
"Eosinophile", 
"Erythroblasten (bei Durchsicht)", 
"Erythrophagen (bei Durchsicht)", 
"Erythrozyten", 
"Glukose (Liquor)", 
"Glukose (Plasma)", 
"Glukose-Quotient",
"Grobdifferenzierung", 
"Haematoidin (bei Durchsicht)",
"Haemosiderophagen (bei Durchsicht)",
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
"Knorpelzellen (bei Durchsicht)", 
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
"Maligne Zellen (bei Durchsicht)", 
"Mitosen (bei Durchsicht)", 
"Neutrophile", 
"OKB-Beurteilung",
"Oligoklonale Banden (Liquor)", 
"Oligoklonale Banden (Serum)",
"Plasmazellen", 
"Plasmazellen (bei Durchsicht)", 
"Totalprotein (Liquor)", 
"Zellzahl", 
"GESCHLECHT", 
"ALTER_J"
]


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
