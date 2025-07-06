// converted from this file https://www.loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt
const iso639_1to2 = {
    'aa': 'aar', 'ab': 'abk', 'af': 'afr', 'ak': 'aka', 'sq': 'sqi',
    'am': 'amh', 'ar': 'ara', 'an': 'arg', 'hy': 'hye', 'as': 'asm',
    'av': 'ava', 'ae': 'ave', 'ay': 'aym', 'az': 'aze', 'ba': 'bak',
    'bm': 'bam', 'eu': 'eus', 'be': 'bel', 'bn': 'ben', 'bi': 'bis',
    'bs': 'bos', 'br': 'bre', 'bg': 'bul', 'my': 'mya', 'ca': 'cat',
    'ch': 'cha', 'ce': 'che', 'zh': 'zho', 'cu': 'chu', 'cv': 'chv',
    'kw': 'cor', 'co': 'cos', 'cr': 'cre', 'cs': 'ces', 'da': 'dan',
    'dv': 'div', 'nl': 'nld', 'dz': 'dzo', 'en': 'eng', 'eo': 'epo',
    'et': 'est', 'ee': 'ewe', 'fo': 'fao', 'fj': 'fij', 'fi': 'fin',
    'fr': 'fra', 'fy': 'fry', 'ff': 'ful', 'ka': 'kat', 'de': 'deu',
    'gd': 'gla', 'ga': 'gle', 'gl': 'glg', 'gv': 'glv', 'el': 'ell',
    'gn': 'grn', 'gu': 'guj', 'ht': 'hat', 'ha': 'hau', 'he': 'heb',
    'hz': 'her', 'hi': 'hin', 'ho': 'hmo', 'hr': 'hrv', 'hu': 'hun',
    'ig': 'ibo', 'is': 'isl', 'io': 'ido', 'ii': 'iii', 'iu': 'iku',
    'ie': 'ile', 'ia': 'ina', 'id': 'ind', 'ik': 'ipk', 'it': 'ita',
    'jv': 'jav', 'ja': 'jpn', 'kl': 'kal', 'kn': 'kan', 'ks': 'kas',
    'kr': 'kau', 'kk': 'kaz', 'km': 'khm', 'ki': 'kik', 'rw': 'kin',
    'ky': 'kir', 'kv': 'kom', 'kg': 'kon', 'ko': 'kor', 'kj': 'kua',
    'ku': 'kur', 'lo': 'lao', 'la': 'lat', 'lv': 'lav', 'li': 'lim',
    'ln': 'lin', 'lt': 'lit', 'lb': 'ltz', 'lu': 'lub', 'lg': 'lug',
    'mk': 'mkd', 'mh': 'mah', 'ml': 'mal', 'mi': 'mri', 'mr': 'mar',
    'ms': 'msa', 'mg': 'mlg', 'mt': 'mlt', 'mn': 'mon', 'na': 'nau',
    'nv': 'nav', 'nr': 'nbl', 'nd': 'nde', 'ng': 'ndo', 'ne': 'nep',
    'nn': 'nno', 'nb': 'nob', 'no': 'nor', 'ny': 'nya', 'oc': 'oci',
    'oj': 'oji', 'or': 'ori', 'om': 'orm', 'os': 'oss', 'pa': 'pan',
    'fa': 'fas', 'pi': 'pli', 'pl': 'pol', 'pt': 'por', 'ps': 'pus',
    'qu': 'que', 'rm': 'roh', 'ro': 'ron', 'rn': 'run', 'ru': 'rus',
    'sg': 'sag', 'sa': 'san', 'si': 'sin', 'sk': 'slk', 'sl': 'slv',
    'se': 'sme', 'sm': 'smo', 'sn': 'sna', 'sd': 'snd', 'so': 'som',
    'st': 'sot', 'es': 'spa', 'sc': 'srd', 'sr': 'srp', 'ss': 'ssw',
    'su': 'sun', 'sw': 'swa', 'sv': 'swe', 'ty': 'tah', 'ta': 'tam',
    'tt': 'tat', 'te': 'tel', 'tg': 'tgk', 'tl': 'tgl', 'th': 'tha',
    'bo': 'bod', 'ti': 'tir', 'to': 'ton', 'tn': 'tsn', 'ts': 'tso',
    'tk': 'tuk', 'tr': 'tur', 'tw': 'twi', 'ug': 'uig', 'uk': 'ukr',
    'ur': 'urd', 'uz': 'uzb', 've': 'ven', 'vi': 'vie', 'vo': 'vol',
    'cy': 'cym', 'wa': 'wln', 'wo': 'wol', 'xh': 'xho', 'yi': 'yid',
    'yo': 'yor', 'za': 'zha', 'zu': 'zul',
}

const iso639_2to1 = Object.fromEntries(
    Object.entries(iso639_1to2).map(([k, v]) => [v, k])
);

const maps = {
    2: iso639_1to2,
    3: iso639_2to1,
}

export const convertLanguageCode = (code) => {
    code = code?.split("-")[0]?.split("_")[0] || "";
    return maps[code.length]?.[code.toLowerCase()] || null;
}
