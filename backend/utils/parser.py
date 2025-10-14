'''This is the PDF Parser'''
import io, re
import pdfplumber, fitz
from pint import UnitRegistry
from utils.config_features import EXPECTED_FEATURES #SYNONYMS, EXPECTED_UNITS, RANGES, EXPECTED_FEATURES
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List, Tuple
import unicodedata
import math
import numpy as np

# ---------- Data model ----------
@dataclass
class ParsedField:
    raw_name: str
    name: str
    value: Optional[float]
    unit: Optional[str]
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    ref_op: Optional[str] = None    # "<" or ">"
    ref_unit: Optional[str] = None
    flagged: bool = False           # star present or outside ref
    line: str = ""                  # original line for audit

ureg = UnitRegistry()

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

# tiny fallback dictionary for true exceptions
FALLBACK = {"okb-beurteilung":"OKB-Beurteilung",
            "mrz(h)-beurteilung":"MRZ(H)-Beurteilung"
    # e.g., hospital-specific headers → your canonical keys
    # "grobdiff vorw. mononukleär": "Grobdifferenzierung",
}


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

    #print("N in CANONIZE", n)

    # ------------- Generic groups -------------
    ANALYTE = r"(albumin|igg|iga|igm|kappa|lambda|laktat)"
    COMPART = r"(serum|liquor|plasma)"
    SUFFIX  = r"(quotient|index|if|loc)"

    # 1) Forms like: "Albumin im Serum" or "IgG im Liquor"
    m = re.match(rf"^{ANALYTE}\s+im\s+{COMPART}$", n, re.I)
    if m:
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        analyte = _format_analyte(m.group(1))
        compartment = m.group(2).capitalize()
        return f"{analyte} ({compartment})"

    # 2) Parenthesized forms: "Albumin (Serum)", "IgA (Liquor)"
    # Avoid Albumin (Liquor, Serum) and Totalprotein (Liquor) from Liquorchemie
    # Define sub analyte and compart 
    ANALYTE_SUB = r"(igg|iga|igm|kappa|lambda|laktat)"
    m = re.match(rf"^{ANALYTE_SUB}\s*\(\s*{COMPART}\s*\)$", n, re.I)
    if m:
        analyte = _format_analyte(m.group(1))
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        compartment = m.group(2).capitalize()
        return f"{analyte} ({compartment})"

    # 3) Suffix variants: "Albumin-Quotient", "IgG Index", "Kappa-IF", "Lambda LOC"
    m = re.match(rf"^{ANALYTE}[\s\-]*{SUFFIX}$", n, re.I)
    if m:
        analyte = _format_analyte(m.group(1))
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        suffix  = m.group(2).capitalize() if m.group(2).lower() in {"quotient","index"} else m.group(2).upper()
        
        #TODO M: this is for IgA-IF > IgA(IF)
        if analyte in ["IgA", "IgG", "IgM", "Kappa"] and suffix == "IF":
            return f"{analyte}({suffix})"
        else:
            return f"{analyte}-{suffix}"

    # 4) Combined with compartment accidentally: "Albumin-Quotient (Liquor)" (rare)
    m = re.match(rf"^{ANALYTE}[\s\-]*{SUFFIX}\s*\(\s*{COMPART}\s*\)$", n, re.I)
    if m:
        analyte = _format_analyte(m.group(1))
        #analyte = m.group(1).upper() if m.group(1).startswith("ig") else m.group(1).capitalize()
        suffix  = m.group(2).capitalize() if m.group(2).lower() in {"quotient","index"} else m.group(2).upper()
        comp    = m.group(3).capitalize()
        return f"{analyte}-{suffix} ({comp})"

    # 5) “Glukose/Glucose” family with compartments and suffixes
    m = re.match(r"^(glukose|glucose)\s+im\s+(serum|liquor|plasma)$", n, re.I)
    if m:
        return f"Glukose ({m.group(2).capitalize()})"  # keep 'Glukose' spelling consistent
    m = re.match(r"^(glukose|glucose)\s*\(\s*(liquor|plasma)\s*\)$", n, re.I)
    if m:
        return f"Glukose ({m.group(2).capitalize()})"
    m = re.match(r"^(glukose|glucose)[\s\-]*quotient$", n, re.I)
    if m:
        return "Glukose-Quotient"

    # 6) Oligoclonal bands (two compartments)
    m = re.match(r"^oligoklonale\s+banden\s+im\s+(serum|liquor)$", n, re.I)
    if m:
        return f"Oligoklonale Banden ({m.group(1).capitalize()})"
    m = re.match(r"^oligoklonale\s+banden\s*\(\s*(serum|liquor)\s*\)$", n, re.I)
    if m:
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
    if re.fullmatch(r"makrophagen\s*/\s*monozyten", n, re.I):
        return "Makrophagen/Monozyten"

    # 8) Albumin/Totalprotein without compartments (rare headings)
    if re.fullmatch(r"totalprotein(?:\s+im\s+liquor)?", n, re.I):
        return "Totalprotein (Liquor)"
    if re.fullmatch(r"albumin(?:\s+im\s+liquor)?", n, re.I):
        return "Albumin (Liquor)"
    if re.fullmatch(r"albumin(?:\s+im\s+serum)?", n, re.I):
        return "Albumin (Serum)"

    # 9) Fallback dictionary for true one-offs
    if n in FALLBACK:
        return FALLBACK[n]
    
    # 9b) Preserve "(bei Durchsicht)" forms exactly
    m = re.match(r"^(erythroblasten|knorpelzellen|erythrophagen|plasmazellen|mitosen|leukophagen|maligne\s+zellen)\s*\(\s*bei\s+durchsicht\s*\)$", n, re.I)
    if m:
        base = " ".join(w.capitalize() for w in m.group(1).split())
        return f"{base} (bei Durchsicht)"    

    # 10) Safe generic fallback (snake_case of what’s left) except full case features 
    # such as OKB, MRZ
    return re.sub(r"[^a-z0-9]+", " ", n).strip().title()

# def parse_number_or_quantity(s: str):
#     s = s.strip()
#     s = s.replace(",", ".")  # European decimals
#     # Try scientific notation / plain float
#     try:
#         return float(s), None
#     except:
#         pass
#     # Try quantity with units, e.g., "10 mg/dL"
#     try:
#         q = ureg(s)
#         return q.magnitude, str(q.units)
#     except:
#         return None, None

# ---------- Small helpers ----------
# def normalize_unit(u: Optional[str]) -> Optional[str]:
#     if not u: return u
#     u = u.strip().replace("µ", "u").replace("μ", "u")  # micro → u
#     u = re.sub(r"\s+", "", u)
#     u = u.replace("mg/l", "mg/L").replace("g/l", "g/L").replace("/ul", "/uL")
#     return u

def to_float(s: Optional[str]) -> Optional[float]:
    # if not s: return None
    # s = s.strip().replace(",", ".")
    # try: return float(s)
    # except: return None

    if not s: return None
    import re
    s = s.strip()
    # handle ranges like "23-26" or "23–26" → return average
    m = re.fullmatch(r"([\d.,]+)\s*[-–]\s*([\d.,]+)", s)
    if m:
        a = float(m.group(1).replace(",", "."))
        b = float(m.group(2).replace(",", "."))
        return (a + b) / 2.0
    s = s.replace(",", ".")
    try:
        return float(s)
    except:
        return None


MASTER_PATTERN = re.compile(
    r"""
    ^\s*
    (?P<name>[A-Za-zÄÖÜäöüß0-9\-\s()\.\/]+?)
    (?P<star>\*)?\s*                               # optional star
    (?=(?:[<>]=?\s*)?[\d.,])                       # stop name before first number/comparator

    # value
    #(?P<value>[\d.,]+)
    (?P<value>[\d.,]+(?:\s*[-–]\s*[\d.,]+)?)
    (?:\s*(?P<val_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))? # optional unicode scientific e.g. × 10⁻³
    #\s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?\s*
    \s*(?P<val_unit>%|mg/?[lL]|g/?[lL]|mmol/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?\s*
    (?:\(\s*\d+\s*\)\s*)?  

    # Either a range: "<value> <ref_low> - <ref_high> [unit]"
    (?:\s+
        (?P<ref_low>[\d.,]+)\s*-\s*(?P<ref_high>[\d.,]+)
        (?:\s*(?P<ref_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
        #\s*(?P<ref_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
        \s*(?P<ref_unit>%|mg/?[lL]|g/?[lL]|mmol/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
     |
    # Or a threshold: "<value> <op> <ref_value> [unit]"  (e.g., "< 9.7 × 10⁻³")
        #\s*(?:(?P<op>[<>]=?)\s*)?(?P<th_value>[\d.,]+)
        \s*(?:(?P<op>(?:[<>]=?|[≤≥]))\s*)?(?P<th_value>[\d.,]+)
        (?:\s*(?P<th_sci>[x×]\s*10\s*[⁻−-]?\s*\d+))?
        #\s*(?P<th_unit>%|mg/?[lL]|g/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
        \s*(?P<th_unit>%|mg/?[lL]|g/?[lL]|mmol/?[lL]|/u?[lL]|/µ[lL]|/μ[lL])?
    )?
    \s*$
    """,
    re.X
)


#----------------TODO M: this is for the categorical features----------------------------
# Names you want to catch (allow - or –)
CATEGORICAL_NAME = r"(?:Grobdifferenzierung|OKB[-–]Beurteilung|MRZ\(H\)[-–]Beurteilung|Oligoklonale\s+Banden\s+im\s+Liquor|Oligoklonale\s+Banden\s+im\s+Serum)"

CATEGORICAL_PATTERN = re.compile(
    rf"""
    ^\s*
    (?P<name>{CATEGORICAL_NAME})           # the feature name
    \s*(?:\*\s*)?                          # optional star after the name
    (?:[:\-–—]\s*)?                        # optional separator (:, -, –, —)
    (?P<text>.+?)                          # everything else = raw categorical value
    \s*$
    """,
    re.I | re.X
)


def nfkc(s: str) -> str:
    return unicodedata.normalize("NFKC", s or "")

def norm_spaces(s: str) -> str:
    return " ".join((s or "").split())

def norm_dashes(s: str) -> str:
    return (s or "").replace("–", "-").replace("—", "-")

def norm_text(s: str) -> str:
    # Lower, NFKC, collapse spaces, normalize dashes, strip trailing punctuation
    s = nfkc(s).lower()
    s = norm_dashes(s)
    s = norm_spaces(s)
    return s.strip(" .,:;")

# --- Grobdifferenzierung ---
# 1: vorw. mononukleär
# 2: gemischt / gemischt poly- und mononukleär / gemisch
# 3: vorw. polynukleär
GROBDIFF_PATTERNS = [
    (re.compile(r"^vorw\.?\s*mononukle(?:ä|ae)r$"), 1),
    (re.compile(r"^vorw\.?\s*polynukle(?:ä|ae)r$"), 3),
    (re.compile(r"^gemisch(?:t)?(?:\s*poly[-\s]*und\s*mononukle(?:ä|ae)r)?$"), 2),
]

# --- OKB-Beurteilung ---
# I, IV, V -> 0 ; II, III -> 1 ; allow optional "V.a." prefix
OKB_TYPMAP = {"i": 0, "ii": 1, "iii": 1, "iv": 0, "v": 0}
#OKB_RE = re.compile(r"^(?:v\.?\s*a\.?\s*)?okb\s*typ\s*(i{1,3}|iv|v)$")
OKB_RE = re.compile(r"^\s*\*?\s*(?:v\.?\s*a\.?\s*)?okb\s*typ\s*(i{1,3}|iv|v)\b", re.I)

# --- MRZ(H)-Beurteilung ---
# Examples show "positiv (2/3)" => 1, "negativ (1/3)" => 0, etc.
# Rule: take the first ratio (x/y). If x >= 2 -> 1 else 0. (Fits all given examples.)
#MRZ_RE = re.compile(r"^(positiv|negativ)\s*\((\d)\s*/\s*(\d)(?:[^)]*)\)$")
MRZ_RE = re.compile(r"^\s*(positiv|negativ)\s*\(\s*(\d+)\s*/\s*(\d+)(?:[^)]*)\)", re.I)


def map_categorical_value(name_raw: str, value_raw: str):
    name_n = norm_text(name_raw)
    text_n = norm_text(value_raw)

    # Route by feature name
    if name_n.startswith("grobdifferenzierung"):
        #print("-----GROB DETECTED------")
        for pat, val in GROBDIFF_PATTERNS:
            if pat.match(text_n):
                return val

    elif name_n.startswith("okb-beurteilung"):
        #print("-----OKB DETECTED------")
        m = OKB_RE.match(text_n)
        #print("OKB m", m)
        if m:
            roman = m.group(1).lower()
            return OKB_TYPMAP.get(roman)

    elif name_n.startswith("mrz(h)-beurteilung"):
        #print("-----MRZ DETECTED------")
        m = MRZ_RE.match(text_n)
        #print("MRZ m", m)
        if m:
            label, x, y = m.group(1).lower(), int(m.group(2)), int(m.group(3))
            # If you prefer label-only logic, use: return 1 if label.startswith("positiv") else 0
            return 1 if x >= 2 else 0
        

    # elif name_n.startswith("oligoklonale banden im"):
    #     # extract numeric values; support ranges like "2-3" (or "2–3")
    #     rng = re.findall(r"(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)", text_n)
    #     if rng and not re.search(r"\bnegativ\b", text_n):
    #         vals = [float(x.replace(",", ".")) for pair in rng for x in pair]
    #         return sum(vals) / len(vals)
    #     singles = re.findall(r"\d+(?:[.,]\d+)?", text_n)
    #     if singles and not re.search(r"\bnegativ\b", text_n):
    #         vals = [float(x.replace(",", ".")) for x in singles]
    #         return sum(vals) / len(vals)
    #     if re.search(r"\bnegativ\b", text_n):
    #         return 0.0

    elif name_n.startswith("oligoklonale banden im"):
        head, sep, tail = text_n.partition(":")
        if not sep:
            return 0.0  # no colon → treat as negative
        if re.search(r"\bnegativ\b", head):
            return 0.0
        if re.search(r"\bpositiv\b", head):
            # parse numbers only after the colon
            rng = re.findall(r"(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)", tail)
            if rng:
                vals = [float(x.replace(",", ".")) for pair in rng for x in pair]
                return sum(vals) / len(vals)
            singles = re.findall(r"\d+(?:[.,]\d+)?", tail)
            if singles:
                vals = [float(x.replace(",", ".")) for x in singles]
                return sum(vals) / len(vals)
            return 0.0  # positive but no numbers after colon → fallback


    return None  # unknown/unmapped

#----------------TODO M: this is for the categorical features----------------------------


# Header-like lines: mostly text, no digits → skip
HEADER_LINE = re.compile(r"^[^\d]*[A-Za-zÄÖÜäöüß][^\d]*$")


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

def parse_line_generic(line: str) -> Optional[ParsedField]:
    s = " ".join(line.strip().split())  # collapse whitespace
    #print("------------S-----------------\n", s)
    if not s: return None

    #TODO M: this will check after master + categorical patterns
    #commented out due to categorical parsin
    # if HEADER_LINE.match(s):  # subtitles like "Proteinanalytik"
    #     return None

    # Normalizing the text so master pattern can match
    normalized_s = normalize_pdf_text(s)
    #print("-------Normalized-------\n", normalized_s)

    # Match with the master pattern
    m = MASTER_PATTERN.match(normalized_s)
    #print("------M-------", m)
    
    if not m:
        c = CATEGORICAL_PATTERN.match(normalized_s)
        #print("---------------C----------", c)
        if c:
            gd = c.groupdict()
            raw_name = gd["name"]
            text_value = gd["text"]

            #print("Raw name", raw_name)
            #print("Text Value", text_value)
            mapped = map_categorical_value(raw_name, text_value)
            #print("------Mapped---------", mapped)

            pf = ParsedField(
                raw_name=raw_name,
                name=canonize(raw_name),
                value=mapped,               # <-- numeric code (or None if unknown)
                unit=None,
                line=line,
                flagged=False
            )
            # Keep the original categorical text too (use whatever field you have)
            pf.category = text_value
            return pf
        
        # If neither numeric nor categorical, treat as header *after* attempts
        if HEADER_LINE.match(s):
            #print("HEADER MATCHED!!!")
            return None
        return None
    
    
    #TODO M: commented out due to categorical parsing
    #if not m: return None
    gd = m.groupdict()

    # Name & star
    raw_name = gd.get("name", "").strip(" :")
    #print("-------Raw Name------\n", raw_name)

    name = canonize(raw_name)
    #print("----After Canon------\n", name)

    star = gd.get("star") is not None

    # Value & unit
    value_txt = gd.get("value") or ""
    # If parser captured a stray comparator in value (e.g., "< 90"), strip it here:
    value_txt = re.sub(r"^[<>]=?\s*", "", value_txt)
    value = to_float(value_txt)
    #print("Value:", value)
    #TODO: Normalize unit if their units of measurement is different
    #val_unit = normalize_unit(gd.get("val_unit"))
    val_unit = gd.get("val_unit")

    pf = ParsedField(
        raw_name=raw_name,
        name=name,
        value=value,
        unit=val_unit,
        line=line,
        flagged=star
    )

    # Range?
    if gd.get("range_sep"):
        ref_low = to_float(gd.get("value"))  # left side is the first number
        ref_high = to_float(gd.get("ref_high"))
        #TODO: Normalize units later
        #ref_unit = normalize_unit(gd.get("ref_unit")) or val_unit
        ref_unit = val_unit
        pf.ref_low = ref_low
        pf.ref_high = ref_high
        pf.ref_unit = ref_unit

    # Threshold?
    if gd.get("op") and gd.get("ref_value"):
        pf.ref_op = gd["op"]
        pf.ref_value = to_float(gd["ref_value"])
        #TODO: Normalize units later
        #pf.ref_unit = normalize_unit(gd.get("th_unit")) or val_unit
        pf.ref_unit = val_unit

    # Post-check: infer out-of-range if references present and no star
    try:
        if not pf.flagged and pf.value is not None:
            if pf.ref_low is not None and pf.ref_high is not None:
                if pf.value < pf.ref_low or pf.value > pf.ref_high:
                    pf.flagged = True
            elif pf.ref_op and pf.ref_value is not None:
                if pf.ref_op.startswith("<") and not (pf.value < pf.ref_value):
                    pf.flagged = True
                if pf.ref_op.startswith(">") and not (pf.value > pf.ref_value):
                    pf.flagged = True
    except:
        pass

    return pf


def parse_lab_text(text: str) -> List[ParsedField]:
    out: List[ParsedField] = []
    for raw in text.splitlines():
        pf = parse_line_generic(raw)
        if pf:
            out.append(pf)
    return out

def to_feature_row(parsed: List[ParsedField], expected_features: List[str]) -> Dict[str, float]:
    """Map parsed fields to canonical feature row; missing → NaN."""
    
    row = {feat: float("nan") for feat in expected_features}
    for pf in parsed:
        if pf.name in row and pf.value is not None:
            row[pf.name] = float(pf.value)
    return row

#----------------------------------------------TODO M: Watch out for this!#----------------------------------------------
def apply_alias(parsed: List[ParsedField]) -> Dict[str, float]:

    for i, pf in enumerate(parsed):
        
        #placeholders for now
        if pf.name == "Gesamtzellzahl":
            parsed[i].name = "Zellzahl"
        # if pf.name == "ALTER_J":
        #     parsed

    return parsed

def extract_text_native(pdf_bytes: bytes):
    import io, math, pdfplumber

    # 1) Parse ALL pages first
    all_parsed = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            all_parsed.extend(parse_lab_text(text))

    # 2) Apply alias mapping ONCE, after aggregating
    all_parsed = apply_alias(all_parsed)

    # 3) Build a single feature row against the fixed schema
    row = to_feature_row(all_parsed, EXPECTED_FEATURES)

    # 4) Impute here (once) and force presence/order of all expected features
    out = {}

    for feat in EXPECTED_FEATURES:
        val = row.get(feat, float("nan"))
        out[feat] = float(val) if (val is not None) else np.nan

    #------------------------------TODO M: META DATA PLACEHOLDERS HERE------------------------------
    out["ALTER_J"] = 50
    out["GESCHLECHT"] = 0
    return out
