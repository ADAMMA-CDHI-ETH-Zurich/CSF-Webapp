import re
import unicodedata

# MASTER_PATTERN = re.compile(
#     r"""
#     ^\s*
#     #(?P<name>[A-Za-zÄÖÜäöüß\-\s()\.\/]+?)\s*      # feature name (no digits)
#     (?P<name>[A-Za-zÄÖÜäöüß0-9\-\s()\.\/]+?)
#     (?P<star>\*)?\s*                               # optional star
#     (?=(?:[<>]=?\s*)?[\d.,])                       # stop name before first number/comparator

#     # value
#     (?P<value>[\d.,]+(?:\s*[x×]\s*10\s*[⁻−-]?\d+)?) # optional unicode scientific e.g. × 10⁻³
#     \s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?\s*

#     # Either a range: "<value> <ref_low> - <ref_high> [unit]"
#     (?:\s+
#         (?P<ref_low>[\d.,]+)\s*-\s*(?P<ref_high>[\d.,]+)
#         (?:\s*(?P<ref_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
#         \s*(?P<ref_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?
#      |
#     # Or a threshold: "<value> <op> <ref_value> [unit]"  (e.g., "< 9.7 × 10⁻³")
#         \s*(?P<op>[<>]=?)\s*(?P<th_value>[\d.,]+)
#         (?:\s*(?P<th_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
#         \s*(?P<th_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?
#     )?
#     \s*$
#     """,
#     re.X
# )


# MASTER_PATTERN = re.compile(
#     r"""
#     ^\s*
#     (?P<name>[A-Za-zÄÖÜäöüß0-9\-\s()\/]+?)          # Feature name
#     \s*(?P<star>\*)?\s*                             # Optional star
#     (?P<value>[\d.,]+                              # Main number
#         (?:\s*[x×]\s*10\s*[⁻−-]?\d+)?               # Optional scientific notation
#     )
#     \s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|/u?L|×\s?10⁻?\d+)?\s*  # Optional unit
#     (?:
#         (?P<range_sep>[-–])\s*                      # Dash for range
#         (?P<ref_high>[\d.,]+)\s*
#         (?P<ref_unit>%|mg/?[lL]|g/?[lL]|/u?L)?
#         |
#         (?P<op>[<>]=?)\s*
#         (?P<ref_value>[\d.,]+)\s*
#         (?P<th_unit>%|mg/?[lL]|g/?[lL]|/u?L)?
#     )?
#     \s*$
#     """,
#     re.X | re.UNICODE
# )

# 1.------------------------------------------------------------------------------------------------------------------
FALLBACK = {
    # e.g., hospital-specific headers → your canonical keys
    # "grobdiff vorw. mononukleär": "Grobdifferenzierung",
}

#TODO THIS WORKS ABOVE DOES NOT 
MASTER_PATTERN = re.compile(
    r"""
    ^\s*
    #(?P<name>[A-Za-zÄÖÜäöüß\-\s()\.\/]+?)\s*      # feature name (no digits)
    (?P<name>[A-Za-zÄÖÜäöüß\-\s()\.\/]+?)
    (?P<star>\*)?\s*                               # optional star
    (?=(?:[<>]=?\s*)?[\d.,])                       # stop name before first number/comparator

    # value
    (?P<value>[\d.,]+)
    (?:\s*(?P<val_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))? # optional unicode scientific e.g. × 10⁻³
    #\s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?\s*
    \s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?\s*
    (?:\(\s*\d+\s*\)\s*)?                          # allow optional parenthetical like "(1)" after the value

    # Either a range: "<value> <ref_low> - <ref_high> [unit]"
    (?:\s+
        (?P<ref_low>[\d.,]+)\s*-\s*(?P<ref_high>[\d.,]+)
        (?:\s*(?P<ref_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
        #\s*(?P<ref_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?
        \s*(?P<ref_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
     |
    # Or a threshold: "<value> <op> <ref_value> [unit]"  (e.g., "< 9.7 × 10⁻³")
        #\s*(?P<op>[<>]=?)\s*(?P<th_value>[\d.,]+)
        \s*(?:(?P<op>[<>]=?)\s*)?(?P<th_value>[\d.,]+)
        (?:\s*(?P<th_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
        #\s*(?P<th_unit>%|mg/?[lL]|g/?[lL]|/u?L|/µL|/μL)?
        \s*(?P<th_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
    )?
    \s*$
    """,
    re.X
)

# helper: strip diacritics (optional; German OK to keep)
def _norm_spaces(s: str) -> str:
    # collapse all whitespace (including newlines/tabs) to single spaces
    return " ".join(s.split())
def _norm_ocr(s: str) -> str:
    # normalize micro symbols, hyphen breaks, stray spaces around hyphens/parentheses
    s = s.replace("µ", "u").replace("μ", "u")
    s = re.sub(r"-\s+\n\s*", "-", s)        # hyphen at line end
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    s = re.sub(r"\s*-\s*", "-", s)
    s = re.sub(r"\s{2,}", " ", s)
    return s

def _format_analyte(analyte: str) -> str:
    analyte = analyte.lower()
    if analyte == "iga":
        return "IgA"
    elif analyte == "igg":
        return "IgG"
    elif analyte == "igm":
        return "IgM"
    else:
        return analyte.capitalize()
    
# Build a canonical "Analyte (Compartment)" or "Analyte-Suffix"
def canonize(raw_name: str) -> str:
    n = _norm_ocr(_norm_spaces(raw_name.strip())).lower()

    # unify ' in ' to ' im ' (some labs use 'in Serum' instead of 'im Serum')
    n = re.sub(r"\bin\b\s+(serum|liquor|plasma)\b", r"im \1", n)

    # remove trailing colons, etc.
    n = n.strip(" :–-")

    # ------------- Generic groups -------------
    ANALYTE = r"(albumin|igg|iga|igm|kappa|lambda)"
    COMPART = r"(serum|liquor|plasma)"
    SUFFIX  = r"(quotient|index|if|loc)"

    # 1) Forms like: "Albumin im Serum" or "IgG im Liquor"
    m = re.match(rf"^{ANALYTE}\s+im\s+{COMPART}$", n, re.I)

    if m:
        print("In 1")
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        analyte = _format_analyte(m.group(1))
        compartment = m.group(2).capitalize()
        return f"{analyte} ({compartment})"

    # 2) Parenthesized forms: "Albumin (Serum)", "IgA (Liquor)"
    m = re.match(rf"^{ANALYTE}\s*\(\s*{COMPART}\s*\)$", n, re.I)
    if m:
        print("In 2")
        analyte = _format_analyte(m.group(1))
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        compartment = m.group(2).capitalize()
        return f"{analyte} ({compartment})"

    # 3) Suffix variants: "Albumin-Quotient", "IgG Index", "Kappa-IF", "Lambda LOC"
    m = re.match(rf"^{ANALYTE}[\s\-]*{SUFFIX}$", n, re.I)
    if m:
        print("In 3")
        analyte = _format_analyte(m.group(1))
        #print(analyte)
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        suffix  = m.group(2).capitalize() if m.group(2).lower() in {"quotient","index"} else m.group(2).upper()
        #print(suffix)
        #exit()
        #print("Analyte", analyte)
        if analyte in ["IgA", "IgG", "IgM", "Kappa"] and suffix == "IF":
            print("Condition OK")
            #print(f"{analyte}({suffix})")
            return f"{analyte}({suffix})"
        else:
            print("Condition not OK")
            return f"{analyte}-{suffix}"

    # 4) Combined with compartment accidentally: "Albumin-Quotient (Liquor)" (rare)
    m = re.match(rf"^{ANALYTE}[\s\-]*{SUFFIX}\s*\(\s*{COMPART}\s*\)$", n, re.I)
    if m:
        print("In 4")
        analyte = _format_analyte(m.group(1))
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        suffix  = m.group(2).capitalize() if m.group(2).lower() in {"quotient","index"} else m.group(2).upper()
        comp    = m.group(3).capitalize()
        return f"{analyte}-{suffix} ({comp})"

    # 5) “Glukose/Glucose” family with compartments and suffixes
    m = re.match(r"^(glukose|glucose)\s+im\s+(serum|liquor|plasma)$", n, re.I)
    if m:
        print("In 5a")
        return f"Glukose ({m.group(2).capitalize()})"  # keep 'Glukose' spelling consistent
    m = re.match(r"^(glukose|glucose)\s*\(\s*(serum|liquor|plasma)\s*\)$", n, re.I)
    if m:
        print("In 5b")
        return f"Glukose ({m.group(2).capitalize()})"
    m = re.match(r"^(glukose|glucose)[\s\-]*quotient$", n, re.I)
    if m:
        print("In 5c")
        return "Glukose-Quotient"

    # 6) Oligoclonal bands (two compartments)
    m = re.match(r"^oligoklonale\s+banden\s+im\s+(serum|liquor)$", n, re.I)
    if m:
        print("In 6a")
        return f"Oligoklonale Banden ({m.group(1).capitalize()})"
    m = re.match(r"^oligoklonale\s+banden\s*\(\s*(serum|liquor)\s*\)$", n, re.I)
    if m:
        print("In 6b")
        return f"Oligoklonale Banden ({m.group(1).capitalize()})"

    # 7) Lymphocyte/neutrophil (%-type rows without compartments)
    if re.fullmatch(r"lymphozyten", n, re.I):
        return "Lymphozyten"
    if re.fullmatch(r"aktivierte\s+lymphozyten", n, re.I):
        return "Aktivierte Lymphozyten"
    if re.fullmatch(r"plasmazellen", n, re.I):
        return "Plasmazellen"
    if re.fullmatch(r"mono(?:zyten)?", n, re.I):
        return "Monozyten"
    if re.fullmatch(r"neutrophile", n, re.I):
        return "Neutrophile"

    # 8) Albumin/Totalprotein without compartments (rare headings)
    if re.fullmatch(r"totalprotein(?:\s+im\s+liquor)?", n, re.I):
        return "Totalprotein (Liquor)"
    if re.fullmatch(r"albumin(?:\s+im\s+liquor)?", n, re.I):
        return "Albumin (Liquor)"
    if re.fullmatch(r"albumin(?:\s+im\s+serum)?", n, re.I):
        return "Albumin (Serum)"

    # 9) Fallback dictionary for true one-offs
    if n in FALLBACK:
        print("In 9")
        return FALLBACK[n]

    # 10) Safe generic fallback (snake_case of what’s left)
    return re.sub(r"[^a-z0-9]+", " ", n).strip().title()


def normalize_pdf_text(text: str) -> str:
    """
    Normalize Unicode issues from PDF OCR/parsing:
    - Replace weird dashes, minus signs, multiplication signs
    - Normalize whitespace and remove zero-width spaces
    """
    replacements = {
        '\u00D7': 'x',      # × -> x
        '\u2212': '-',      # − -> -
        '\u207B': '-',      # superscript minus -> -
        '\u2013': '-',      # en dash -> -
        '\u2014': '-',      # em dash -> -
        '\u200B': '',       # zero-width space
        '\u00A0': ' ',      # non-breaking space
    }

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    # Normalize combining characters
    text = unicodedata.normalize("NFKC", text)

    # Strip repeated spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

s = "IgA-Quotient 2.4 x 10⁻³"
s2 = "Albumin im Serum 37.2 35 - 52 g/l"
s3 = "IgG-Index 0.52 (1) < 0.57"
s4 = "Gesamtzellzahl * 43 < 5 /μl"
normalized_line = normalize_pdf_text(s4)
print("Normalized Line", normalized_line)
m = MASTER_PATTERN.match(normalized_line)
print(m)
if not m: m=None
gd = m.groupdict()

raw_name = gd.get("name", "").strip(" :")
print("-------Raw Name------\n", raw_name)

name = canonize(raw_name)
print("----After Canon------\n", name)


# (raw_name='IgG im Liquor', name='IgG (Liquor)', value=45.7, unit=None, ref_low=None, ref_high=None, ref_op=None, ref_unit=None, flagged=True, line='IgG im Liquor * 45.70 < 34 mg/l')
# (raw_name='IgG-IF', name='IgG-IF', value=0.0, unit=None, ref_low=None, ref_high=None, ref_op=None, ref_unit=None, flagged=False, line='IgG-IF 0 0 %')



# 2.------------------------------------------------------------------------------------------------------------------
# s5 = "negativ (0/3) negativ"

# # --- MRZ(H)-Beurteilung ---
# # Examples show "positiv (2/3)" => 1, "negativ (1/3)" => 0, etc.
# # Rule: take the first ratio (x/y). If x >= 2 -> 1 else 0. (Fits all given examples.)
MRZ_RE = re.compile(r"^\s*(positiv|negativ)\s*\(\s*(\d+)\s*/\s*(\d+)(?:[^)]*)\)", re.I)



m = MRZ_RE.match(s5)
print("OKB m", m)