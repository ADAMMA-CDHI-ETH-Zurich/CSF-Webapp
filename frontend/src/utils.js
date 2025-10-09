

export const FEATURE_GROUPS = [
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
        "Albumin (Liquor)", "Albumin (Serum)", "Albumin-Quotient",
        "IgG (Liquor)", "IgG (Serum)", "IgG-Quotient","IgG-Index",
        "IgA (Liquor)", "IgA (Serum)","IgA-Quotient",
        "IgM (Liquor)", "IgM (Serum)","IgM-Quotient",
        "Kappa (Liquor)", "Kappa (Serum)", "Kappa-Quotient","Kappa-Index",
        "Lambda (Liquor)", "Lambda (Serum)", "Lambda-Quotient",
      ],
    },
    {
      title: "Intrathekale Fraktionen nach Reiber",
      features: [
        "IgG(IF)", 
        "IgA(IF)", 
        "IgM(IF)",
        "IgG(LOC)", 
        "IgA(LOC)", 
        "IgM(LOC)",
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
            "Maligne Zellen (bei Durchsicht)", 
            "Makrophagen (bei Durchsicht)",
            "Makrophagen/Monozyten",
            "Neutrophile", 
            "Eosinophile", 
            "Basophile",
            "Knorpelzellen (bei Durchsicht)",
            "Mitosen (bei Durchsicht)"
        ],
      },
];


  // (optional) helper you can reuse
export const groupedSet = new Set(FEATURE_GROUPS.flatMap(g => g.features));