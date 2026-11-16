// Fast dependency-free Markdown renderer matching marked 18.1.3
// (CommonMark 0.31.2 + GFM 0.29, default options). Written from the
// spec, not from marked's source: a block parser plus an inline
// tokenizer with a delimiter stack for emphasis and links.
// MIT License - see LICENSE in the repository root.

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©',
  reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–', laquo: '«',
  raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', sbquo: '‚',
  bdquo: '„', dagger: '†', Dagger: '‡', permil: '‰', lsaquo: '‹',
  rsaquo: '›', euro: '€', pound: '£', yen: '¥', cent: '¢', curren: '¤',
  brvbar: '¦', sect: '§', uml: '¨', ordf: 'ª', ordm: 'º', para: '¶',
  middot: '·', cedil: '¸', sup1: '¹', sup2: '²', sup3: '³', acute: '´',
  micro: 'µ', frac14: '¼', frac12: '½', frac34: '¾', iquest: '¿',
  iexcl: '¡', AElig: 'Æ', aelig: 'æ', Dcaron: 'Ď', dcaron: 'ď',
  HilbertSpace: 'ℋ', DifferentialD: 'ⅆ', ClockwiseContourIntegral: '∮',
  ngE: '≧̸', Auml: 'Ä', auml: 'ä', Ouml: 'Ö', ouml: 'ö', Uuml: 'Ü',
  uuml: 'ü', Euml: 'Ë', euml: 'ë', Iuml: 'Ï', iuml: 'ï', Agrave: 'À',
  agrave: 'à', Aacute: 'Á', aacute: 'á', Acirc: 'Â', acirc: 'â',
  Atilde: 'Ã', atilde: 'ã', Aring: 'Å', aring: 'å', Aogon: 'Ą',
  aogon: 'ą', Ccedil: 'Ç', ccedil: 'ç', Egrave: 'È', egrave: 'è',
  Eacute: 'É', eacute: 'é', Ecirc: 'Ê', ecirc: 'ê', Igrave: 'Ì',
  igrave: 'ì', Iacute: 'Í', iacute: 'í', Icirc: 'Î', icirc: 'î',
  Ntilde: 'Ñ', ntilde: 'ñ', Ograve: 'Ò', ograve: 'ò', Oacute: 'Ó',
  oacute: 'ó', Ocirc: 'Ô', ocirc: 'ô', Otilde: 'Õ', otilde: 'õ',
  Oslash: 'Ø', oslash: 'ø', Ugrave: 'Ù', ugrave: 'ù', Uacute: 'Ú',
  uacute: 'ú', Ucirc: 'Û', ucirc: 'û', Yacute: 'Ý', yacute: 'ý',
  yuml: 'ÿ', Yuml: 'Ÿ', szlig: 'ß', eth: 'ð', ETH: 'Ð', thorn: 'þ',
  THORN: 'Þ', yacute2: 'ý', alpha: 'α', beta: 'β', gamma: 'γ',
  delta: 'δ', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ',
  omicron: 'ο', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
  phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Alpha: 'Α', Beta: 'Β',
  Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε', Zeta: 'Ζ', Eta: 'Η',
  Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν',
  Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ',
  Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
  infin: '∞', ne: '≠', le: '≤', ge: '≥', plusmn: '±', minus: '−',
  times: '×', divide: '÷', lowast: '∗', bull: '•', deg: '°',
  sup: '⊃', sub: '⊂', cup: '∪', cap: '∩', empty: '∅', sum: '∑',
  prod: '∏', part: '∂', nabla: '∇', isin: '∈', notin: '∉', ni: '∋',
  sim: '∼', cong: '≅', asymp: '≈', equiv: '≡', perp: '⊥',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔',
  crarr: '↵', lArr: '⇐', uArr: '⇑', rArr: '⇒', dArr: '⇓',
  hArr: '⇔', forall: '∀', exist: '∃', emptyv: '∅', nbsp2: ' ',
  circ: 'ˆ', tilde: '˜', ensp: ' ', emsp: ' ', thinsp: ' ',
  zwnj: '‌', zwj: '‍', lrm: '‎', rlm: '‏', shy: '­',
  fnof: 'ƒ', Scaron: 'Š', scaron: 'š', Ydia: 'Ÿ', Zcaron: 'Ž',
  zcaron: 'ž', Cacute: 'Ć', cacute: 'ć', Eogon: 'Ę', eogon: 'ę',
  Lcaron: 'Ľ', lcaron: 'ľ', Ncaron: 'Ň', ncaron: 'ň', Rcaron: 'Ř',
  rcaron: 'ř', Tcaron: 'Ť', tcaron: 'ť', Sacute: 'Ś', sacute: 'ś',
  OElig: 'Œ', oelig: 'œ', Scedil: 'Ş', scedil: 'ş', Tcedil: 'Ţ',
  tcedil: 'ţ', Gbreve: 'Ğ', gbreve: 'ğ', Idot: 'İ', inodot: 'ı',
  Omacr: 'Ō', omacr: 'ō', Oacute2: 'Ó', Uogon: 'Ų', uogon: 'ų',
  Abreve: 'Ă', abreve: 'ă', Ccirc: 'Ĉ', ccirc: 'ĉ', Gcirc: 'Ĝ',
  gcirc: 'ĝ', Hcirc: 'Ĥ', hcirc: 'ĥ', Jcirc: 'Ĵ', jcirc: 'ĵ',
  Scirc: 'Ŝ', scirc: 'ŝ', Ubreve: 'Ŭ', ubreve: 'ŭ', Wcirc: 'Ŵ',
  wcirc: 'ŵ', Ycirc: 'Ŷ', ycirc: 'ŷ', Hstrok: 'Ħ', hstrok: 'ħ',
  Ohorn: 'Ơ', ohorn: 'ơ', Uhorn: 'Ư', uhorn: 'ư', prime: '′',
  Prime: '″', oline: '‾', frasl: '⁄', weierp: '℘', image: 'ℑ',
  real: 'ℜ', alefsym: 'ℵ', larr2: '←', spades: '♠', clubs: '♣',
  hearts: '♥', diams: '♦', Dagger2: '‡', permil2: '‰',
};

// Windows-1252 mapping for C1 numeric character references (HTML spec).
const C1_MAP = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†',
  0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8A: 'Š', 0x8B: '‹', 0x8C: 'Œ',
  0x8E: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•',
  0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™', 0x9A: 'š', 0x9B: '›',
  0x9C: 'œ', 0x9E: 'ž', 0x9F: 'Ÿ',
};

function decodeNumericRef(body) {
  // body like "#123" or "#x1F600" (case-insensitive x). Returns the
  // decoded character, or null when the reference is invalid.
  let n;
  if (body[1] === 'x' || body[1] === 'X') {
    if (!/^[0-9A-Fa-f]+$/.test(body.slice(2))) return null;
    n = parseInt(body.slice(2), 16);
  } else {
    if (!/^[0-9]+$/.test(body.slice(1))) return null;
    n = parseInt(body.slice(1), 10);
  }
  if (n === 0 || (n >= 0xD800 && n <= 0xDFFF)) return '�';
  if (n > 0x10FFFF) return null;
  if (n >= 0x80 && n <= 0x9F && C1_MAP[n]) return C1_MAP[n];
  return String.fromCodePoint(n);
}

// Escape text for HTML output: & < > " ' (marked's escape set).
function esc(s) {
  let out = '';
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    let rep = null;
    if (c === '&') rep = '&amp;';
    else if (c === '<') rep = '&lt;';
    else if (c === '>') rep = '&gt;';
    else if (c === '"') rep = '&quot;';
    else if (c === "'") rep = '&#39;';
    if (rep !== null) {
      out += s.slice(start, i) + rep;
      start = i + 1;
    }
  }
  return start === 0 ? s : out + s.slice(start);
}

// Decode character references inside a link destination or title:
// named entities to their character, numeric ones likewise; anything
// else is left alone.
function decodeEntities(s) {
  if (!s.includes('&')) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const amp = s.indexOf('&', i);
    if (amp < 0) { out += s.slice(i); break; }
    out += s.slice(i, amp);
    const semi = s.indexOf(';', amp + 1);
    if (semi < 0 || semi - amp > 33) { out += '&'; i = amp + 1; continue; }
    const body = s.slice(amp + 1, semi);
    if (body[0] === '#') {
      const d = decodeNumericRef(body);
      if (d === null) { out += '&'; i = amp + 1; continue; }
      out += d; i = semi + 1; continue;
    }
    if (/^[A-Za-z][A-Za-z0-9]+$/.test(body) && NAMED_ENTITIES[body] !== undefined) {
      out += NAMED_ENTITIES[body]; i = semi + 1; continue;
    }
    out += '&'; i = amp + 1;
  }
  return out;
}

// Escape text for an attribute value, leaving character references
// (&name; / &#123; / &#x1F600;) untouched, as marked does.
function escAttr(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '&') {
      const m = s.slice(i).match(/^&(?:[A-Za-z][A-Za-z0-9]*|#[0-9]+|#[xX][0-9A-Fa-f]+);/);
      if (m) { out += m[0]; i += m[0].length; continue; }
      out += '&amp;'; i++; continue;
    }
    if (ch === '<') { out += '&lt;'; i++; continue; }
    if (ch === '>') { out += '&gt;'; i++; continue; }
    if (ch === '"') { out += '&quot;'; i++; continue; }
    if (ch === "'") { out += '&#39;'; i++; continue; }
    out += ch; i++;
  }
  return out;
}

// Clean a link destination the way marked does: URI-encode it, keep
// character references literal, escape for the attribute. A '%' is
// never encoded (existing escapes stay intact).
function cleanUrl(href) {
  if (href == null) return '';
  let url = href;
  try { url = encodeURI(url).replace(/%25/g, '%'); } catch (e) { /* keep raw */ }
  return escAttr(url);
}

// ---------------- inline parsing ----------------

const PUNCT = /[\p{P}\p{S}]/u;
function isSpaceCh(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === '　' || ch === '​' || ch === '﻿';
}
function isPunctCh(ch) {
  return ch !== undefined && PUNCT.test(ch);
}
function isAsciiPunct(ch) {
  const c = ch.charCodeAt(0);
  return (c >= 0x21 && c <= 0x2f) || (c >= 0x3a && c <= 0x40) || (c >= 0x5b && c <= 0x60) || (c >= 0x7b && c <= 0x7e);
}

// Normalize a link label: collapse whitespace, trim, case-fold.
// Unicode case folding maps ß/ẞ to "ss" and the Latin ligatures to
// their expansions, which toLowerCase does not do. Backslash escapes
// are deliberately NOT resolved here: a label written [foo\!] does
// not match a definition [foo!] (link reference definitions resolve
// escapes when the label is read, in parseLinkDefs).
function normalizeLabel(s) {
  return s.replace(/ß|ẞ/g, 'ss')
    .replace(/ﬀ/g, 'ff').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl')
    .replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl')
    .replace(/ﬅ|ﬆ/g, 'st')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

// Scan a single-level bracket group [ ... ] (marked's Le): escapes
// and any character except '[', ']' and '\'. Returns the index of
// the closing ']' or -1.
function scanLe(s, start) {
  let i = start + 1;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '[') return -1;
    if (ch === ']') return i;
    i++;
  }
  return -1;
}

// Scan a bracket group [ ... ] whose elements may be Le groups,
// escapes, or any character except '[', ']' and '\' (backticks are
// ordinary characters inside a group). Returns the index of the
// closing ']' or -1.
function scanBracketGroup(s, start) {
  let i = start + 1;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '[') {
      const g = scanLe(s, i);
      if (g < 0) return -1;
      i = g + 1;
      continue;
    }
    if (ch === ']') return i;
    i++;
  }
  return -1;
}

// Find the index of the ']' closing the link label whose '[' is at
// `start`, per marked's label grammar: a label is a run of bracket
// groups, backslash escapes, backtick code-span chunks (an opener
// run, backtick-free content, a closer run of any length), runs of
// two or more backticks immediately before the closing ']', and any
// other character except '[', ']' and '`'. A ']' inside an HTML tag
// does close the label (marked rejects such a link separately, with
// the escaping-tag check). -1 if the label cannot close.
//
// The grammar is backtracking: at a backtick run the code-span chunk
// is tried first, and when the label cannot close after it the run
// is retried as a literal run of two or more backticks before ']'
// (the regex's `` ``+(?=\]) `` alternative). Without that retry a
// chunk whose closer lies past the label's ']' swallows the label
// end and the link is lost.
function findBracketEnd(s, start) {
  return matchLabelEnd(s, start + 1);
}

function matchLabelEnd(s, i) {
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '[') {
      const g = scanBracketGroup(s, i);
      if (g < 0) return -1;
      i = g + 1;
      continue;
    }
    if (ch === '`') {
      let n = 0;
      while (i + n < s.length && s[i + n] === '`') n++;
      // Code-span chunk: the closer is the first backtick run after
      // the opener, of any length (the content is backtick-free).
      let k = i + n;
      while (k < s.length && s[k] !== '`') k++;
      if (k < s.length) {
        let m = 0;
        while (k + m < s.length && s[k + m] === '`') m++;
        const rest = matchLabelEnd(s, k + m);
        if (rest >= 0) return rest;
      }
      // The chunk led nowhere: retry as a literal run of two or
      // more backticks immediately before ']'.
      if (n >= 2 && s[i + n] === ']') {
        const rest = matchLabelEnd(s, i + n);
        if (rest >= 0) return rest;
      }
      return -1;
    }
    if (ch === ']') return i;
    i++;
  }
  return -1;
}

// Scan a reference bracket [ref] per marked's `be` grammar: escapes
// and any character except '[', ']' and '\' (backticks are allowed);
// the ref must not be empty or all whitespace. Returns the index of
// ']' or -1.
function findRefEnd(s, start) {
  let i = start + 1;
  let j = i;
  while (j < s.length && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
  if (j >= s.length || s[j] === ']') return -1;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '[') return -1;
    if (ch === ']') return i;
    i++;
  }
  return -1;
}

// marked's Be check: a link label that contains an HTML tag or an
// autolink extending past the label's end is not a link at all.
// `start`/`end` delimit the label in `s`.
function labelHasEscapingTag(s, start, end) {
  const label = s.slice(start, end);
  if (!label.includes('<')) return false;
  let i = 0;
  while (i < label.length) {
    const ch = label[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '`') {
      // skip a real code span (equal backtick runs)
      let n = 0;
      while (i + n < label.length && label[i + n] === '`') n++;
      let j = i + n;
      let found = -1;
      while (j < label.length) {
        if (label[j] === '`') {
          let m = 0;
          while (j + m < label.length && label[j + m] === '`') m++;
          if (m === n) { found = j; break; }
          j += m;
        } else j++;
      }
      if (found < 0) { i += n; continue; }
      i = found + n;
      continue;
    }
    if (ch !== '<') { i++; continue; }
    const pos = start + i;
    const tag = scanHtmlTag(s, pos);
    if (tag !== null) {
      if (pos + tag.length > end) return true;
      i += tag.length;
      continue;
    }
    const rest = s.slice(pos);
    let m = rest.match(/^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\s]*)>/);
    if (!m) m = rest.match(/^<([A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?)*)>/);
    if (m) {
      if (pos + m[0].length > end) return true;
      i += m[0].length;
      continue;
    }
    i++;
  }
  return false;
}

function skipWs(s, i) {
  while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n')) i++;
  return i;
}

// Parse a link destination starting at i (after '(' or after whitespace).
// Returns {dest, next} or null. next is the index just past the dest.
function parseDest(s, i) {
  if (i >= s.length) return null;
  if (s[i] === '<') {
    let j = i + 1;
    let dest = '';
    while (j < s.length && s[j] !== '>') {
      if (s[j] === '\n') return null;
      if (s[j] === '\\' && j + 1 < s.length && isAsciiPunct(s[j + 1])) { dest += s[j + 1]; j += 2; continue; }
      dest += s[j]; j++;
    }
    if (j >= s.length) return null;
    return { dest, next: j + 1 };
  }
  let dest = '';
  let depth = 0;
  let j = i;
  while (j < s.length) {
    const ch = s[j];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch.charCodeAt(0) < 0x20) break;
    if (ch === '\\' && j + 1 < s.length && isAsciiPunct(s[j + 1])) { dest += s[j + 1]; j += 2; continue; }
    if (ch === '(') { depth++; dest += ch; j++; continue; }
    if (ch === ')') {
      if (depth === 0) break;
      depth--; dest += ch; j++; continue;
    }
    dest += ch; j++;
  }
  // An empty destination is valid: [link]().
  return { dest, next: j };
}

// Parse a link title starting at i. Returns {title, next} or null.
function parseTitle(s, i) {
  if (i >= s.length) return null;
  const q = s[i];
  if (q === '"' || q === "'") {
    let j = i + 1;
    let title = '';
    while (j < s.length && s[j] !== q) {
      if (s[j] === '\\' && j + 1 < s.length && isAsciiPunct(s[j + 1])) { title += s[j + 1]; j += 2; continue; }
      title += s[j]; j++;
    }
    if (j >= s.length) return null;
    return { title, next: j + 1 };
  }
  if (q === '(') {
    let j = i + 1;
    let title = '';
    let depth = 0;
    while (j < s.length) {
      const ch = s[j];
      if (ch === '\\' && j + 1 < s.length && isAsciiPunct(s[j + 1])) { title += s[j + 1]; j += 2; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') {
        if (depth === 0) return { title, next: j + 1 };
        depth--;
      }
      title += ch; j++;
    }
    return null;
  }
  return null;
}

// Try to resolve a link/image whose text ends at closeIdx. Returns
// {href, title, end} (end = index just past the whole construct) or null.
/**
 * Resolve a bracketed span at s[open] ('[') to a link or image target.
 * The bracket's label uses marked's label grammar; when that grammar
 * fails entirely, the shortcut reference form is tried with the
 * reference grammar, which allows backticks freely inside the ref.
 */
function resolveBracket(s, open, refs) {
  const labelStart = open + 1;
  const closeIdx = findBracketEnd(s, open);
  if (closeIdx >= 0) {
    if (labelHasEscapingTag(s, labelStart, closeIdx)) return null;
    const innerRaw = s.slice(labelStart, closeIdx);
    const r = resolveLink(s, innerRaw, closeIdx, refs);
    if (r) return { innerRaw, r, end: r.end };
    return null;
  }
  const refEnd = findRefEnd(s, open);
  if (refEnd < 0 || labelHasEscapingTag(s, labelStart, refEnd)) return null;
  const innerRaw = s.slice(labelStart, refEnd);
  const ref = refs.get(normalizeLabel(innerRaw));
  if (!ref) return null;
  let end = refEnd + 1;
  if (s[end] === '[' && s[end + 1] === ']') end += 2;
  return { innerRaw, r: { href: ref.dest, title: ref.title, end }, end };
}

function resolveLink(s, innerRaw, closeIdx, refs) {
  const after = closeIdx + 1;
  if (s[after] === '(') {
    // Inline link; if it does not parse, fall through to the
    // reference forms (a failed inline link still leaves a
    // shortcut reference link standing).
    let i = skipWs(s, after + 1);
    const d = parseDest(s, i);
    if (d) {
      let hadWs = false;
      let j = d.next;
      while (j < s.length && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) { j++; hadWs = true; }
      i = j;
      let title = null;
      if (s[i] === ')') return { href: d.dest, title: null, end: i + 1 };
      if (hadWs) {
        const t = parseTitle(s, i);
        if (t) {
          title = t.title;
          i = skipWs(s, t.next);
          if (s[i] === ')') return { href: d.dest, title, end: i + 1 };
        }
      }
    }
  }
  if (s[after] === '[') {
    // A collapsed reference [label][] names the label itself.
    if (s[after + 1] === ']') {
      const ref0 = refs.get(normalizeLabel(innerRaw));
      if (ref0) return { href: ref0.dest, title: ref0.title, end: after + 2 };
      return null;
    }
    const end2 = findRefEnd(s, after);
    if (end2 >= 0) {
      const labelRaw = s.slice(after + 1, end2);
      const label = normalizeLabel(labelRaw);
      const ref = refs.get(label);
      if (ref) return { href: ref.dest, title: ref.title, end: end2 + 1 };
      // A well-formed reference that does not resolve leaves the
      // '[' standing on its own; the shortcut form is not tried.
      return null;
    }
    // A malformed reference bracket falls through to the shortcut
    // form, which may still resolve.
  }
  const ref = refs.get(normalizeLabel(innerRaw));
  if (!ref) return null;
  return { href: ref.dest, title: ref.title, end: after };
}

// Scan an inline HTML tag starting at i. Returns the raw tag or null.
function scanHtmlTag(s, i) {
  if (s[i] !== '<') return null;
  const rest = s.slice(i);
  let m = rest.match(/^<!-->/);
  if (m) return m[0];
  m = rest.match(/^<!--->/);
  if (m) return m[0];
  m = rest.match(/^<!--[\s\S]*?-->/);
  if (m) return m[0];
  m = rest.match(/^<\?[\s\S]*?\?>/);
  if (m) return m[0];
  m = rest.match(/^<![A-Za-z][^>]*>/);
  if (m) return m[0];
  m = rest.match(/^<!\[CDATA\[[\s\S]*?\]\]>/);
  if (m) return m[0];
  // open or close tag: the tag name is letters/digits/hyphens, and
  // after it only whitespace, '/', or '>' may follow. A closing tag
  // takes no attributes, and attributes must be separated from each
  // other (and from the tag name) by whitespace.
  if (!/^<\/?[A-Za-z]/.test(rest)) return null;
  let j = i + 1;
  let closing = false;
  if (s[j] === '/') { closing = true; j++; }
  while (j < s.length && /[A-Za-z0-9-]/.test(s[j])) j++;
  if (closing) {
    while (j < s.length && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
    return s[j] === '>' ? s.slice(i, j + 1) : null;
  }
  if (j < s.length && s[j] !== ' ' && s[j] !== '\t' && s[j] !== '\n' && s[j] !== '>' && s[j] !== '/') return null;
  let ok = false;
  while (j < s.length) {
    const ch = s[j];
    if (ch === '>') { ok = true; j++; break; }
    if (ch === '/' && s[j + 1] === '>') { ok = true; j += 2; break; }
    if (ch === ' ' || ch === '\t' || ch === '\n') { j++; continue; }
    // attribute name
    if (!/[A-Za-z_:]/.test(ch)) return null;
    while (j < s.length && /[A-Za-z0-9_.:-]/.test(s[j])) j++;
    while (j < s.length && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
    if (s[j] === '=') {
      j++;
      while (j < s.length && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
      if (s[j] === '"' || s[j] === "'") {
        const q = s[j]; j++;
        while (j < s.length && s[j] !== q) j++;
        if (j >= s.length) return null;
        j++;
      } else {
        if (j >= s.length || /[\s"'=<>`]/.test(s[j])) return null;
        while (j < s.length && !/[\s"'=<>`]/.test(s[j])) j++;
      }
      // After a value, only whitespace, '/', or '>' may follow.
      if (j < s.length && s[j] !== ' ' && s[j] !== '\t' && s[j] !== '\n' && s[j] !== '>' && s[j] !== '/') return null;
    }
    // A bare attribute needs no check: the loop validates the next
    // character (whitespace, '/', '>', or another attribute name).
  }
  return ok ? s.slice(i, j) : null;
}

function trimUrlEnd(u) {
  // Trim trailing punctuation per GFM autolink rules, with balanced ().
  // A trailing entity-like suffix (&name;) is not part of the URL.
  const em = u.match(/&[A-Za-z][A-Za-z0-9]*;$/);
  if (em) u = u.slice(0, u.length - em[0].length);
  // A '(' with no matching ')' later in the URL ends the URL here
  // (an unmatched ')' is allowed and stays).
  let depth = 0;
  const opens = [];
  for (let k = 0; k < u.length; k++) {
    if (u[k] === '(') { depth++; opens.push(k); }
    else if (u[k] === ')') { if (depth > 0) depth--; }
  }
  if (depth > 0) u = u.slice(0, opens[opens.length - depth]);
  let end = u.length;
  while (end > 0) {
    const ch = u[end - 1];
    if (ch === ')' ) {
      // Keep a trailing ')' when it closes a '(' earlier in the URL;
      // trim it only when no '(' is open at that point (an unmatched
      // ')' earlier in the URL does not count against it).
      let depth = 0;
      for (let k = 0; k < end - 1; k++) {
        if (u[k] === '(') depth++;
        else if (u[k] === ')') { if (depth > 0) depth--; }
      }
      if (depth === 0) { end--; continue; }
      break;
    }
    if ('?!.,:;*_~'.includes(ch)) { end--; continue; }
    break;
  }
  return u.slice(0, end);
}

// Tokenize inline markdown into nodes. Node kinds:
// 0 text (raw, escaped at render), 1 raw html, 2 code span (raw text),
// 3 hard break, 4 delimiter run, 5 em, 6 strong, 7 del,
// 8 link (html string children), 9 image.
// When an email match is followed by '-' or '_', the address may be
// incomplete: the final domain label cannot end in '-'/'_', so the
// match backtracks by dropping that label (if the domain still has a
// dot). But a '_' that closes an emphasis run opened earlier in this
// inline text is not part of the address at all: the full match stands.
function emailAfter(tokens, email, nextCh) {
  if (nextCh !== '-' && nextCh !== '_') return email;
  if (nextCh === '_') {
    let bal = 0;
    for (const t of tokens) {
      if (t.k === 4 && t.ch === '_') {
        if (t.open && !t.close) bal++;
        else if (t.close && !t.open) bal--;
      }
    }
    if (bal > 0) return email;
  }
  const at = email.lastIndexOf('@');
  const dom = email.slice(at + 1);
  const dot = dom.lastIndexOf('.');
  if (dot <= 0) return null;
  const truncDom = dom.slice(0, dot);
  if (!truncDom.includes('.')) return null;
  return email.slice(0, at + 1 + dot);
}

// Is position i a boundary where an extended autolink (email /
// scheme) may start? The previous character must not be one that
// could extend the address. A '*' or '_' run counts as a boundary
// only when it is an emphasis delimiter (otherwise it is part of a
// word, as in x_because@...).
function isAutoBoundary(s, i) {
  if (i === 0) return true;
  const prev = s[i - 1];
  if (prev === '*' || prev === '_') {
    let j = i - 1;
    while (j > 0 && s[j - 1] === prev) j--;
    const p = j > 0 ? s[j - 1] : undefined;
    const nx = i < s.length ? s[i] : undefined;
    const prevSpace = p === undefined || isSpaceCh(p);
    const nextSpace = nx === undefined || isSpaceCh(nx);
    const prevPunct = p !== undefined && isPunctCh(p);
    const nextPunct = nx !== undefined && isPunctCh(nx);
    const leftFlank = !nextSpace && (!nextPunct || prevSpace || prevPunct);
    const rightFlank = !prevSpace && (!prevPunct || nextSpace || nextPunct);
    const canOpen = leftFlank && (prev !== '_' || !rightFlank || prevPunct);
    const canClose = rightFlank && (prev !== '_' || !leftFlank || nextPunct);
    return canOpen || canClose;
  }
  // The previous character must not be one that could extend the
  // address (alphanumeric or . _ + @ -).
  const c = prev.charCodeAt(0);
  if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)) return false;
  return prev !== '.' && prev !== '_' && prev !== '+' && prev !== '@' && prev !== '-';
}

// --- Emphasis mask (marked's #n) -------------------------------------
// marked decides emphasis on a MASKED copy of the inline source: a
// resolved reference link, a code span, an inline link, or an HTML
// tag is replaced by a length-preserving run of 'a's, so any
// delimiter inside such a span cannot open or close emphasis. The
// mask is computed in three passes:
//
//  1. reflinkSearch: a [label][ref] or [ref] whose ref resolves is
//     masked (the whole span, or only the ref text when the label
//     itself holds a link);
//  2. anyPunctuationOutsideCode: a code span keeps its delimiters
//     and turns inner backticks into '+'; an escape is skipped (it
//     can never be a delimiter); a bare backtick run is unchanged;
//  3. blockSkip: an inline link, a code span, or an HTML tag is
//     replaced by '[aaa...]'.
//
// A delimiter token whose position was changed by the mask is dead:
// it can neither open nor close emphasis. The mask is per inline
// string, so tokenize computes it for its own source (link text and
// emphasis interiors get their own mask, as in marked).

function findEqualCodeSpan(s, i) {
  // s[i] is a backtick; find a code span with an opener run equal to
  // the closer run, non-empty backtick-free content (the content may
  // hold backticks only in the Ot pass, handled by maskOt). Returns
  // the index just past the closer, or -1.
  let n = 0;
  while (i + n < s.length && s[i + n] === '`') n++;
  if (n === 0) return -1;
  let j = i + n;
  if (j >= s.length) return -1;
  while (j < s.length) {
    if (s[j] === '`') {
      let m = 0;
      while (j + m < s.length && s[j + m] === '`') m++;
      if (m === n) return j + m;
      j += m;
    } else j++;
  }
  return -1;
}

function maskOt(s) {
  // Without a backtick there is no code span to sanitize, and an
  // escape can never be a delimiter, so the mask is the identity.
  if (!s.includes('`')) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\' && i + 1 < s.length && isAsciiPunct(s[i + 1])) {
      // An escape becomes '+' runs (length-preserving): an escaped
      // backtick must not read as a code-span opener later, and an
      // escaped delimiter can never be a delimiter.
      out += '++'; i += 2; continue;
    }
    if (ch === '`') {
      let n = 0;
      while (i + n < s.length && s[i + n] === '`') n++;
      // A code span: opener run, content that does not start or end
      // with a backtick, closer run equal to the opener. The content
      // may hold backticks in the middle; those become '+'.
      let j = i + n;
      let found = -1;
      while (j < s.length) {
        if (s[j] === '`') {
          let m = 0;
          while (j + m < s.length && s[j + m] === '`') m++;
          if (m === n && j > i + n) { found = j; break; }
          j += m;
        } else j++;
      }
      if (found >= 0) {
        out += s.slice(i, i + n);
        out += s.slice(i + n, found).replace(/`/g, '+');
        out += s.slice(found, found + n);
        i = found + n;
        continue;
      }
      out += s.slice(i, i + n); i += n; continue;
    }
    out += ch; i++;
  }
  return out;
}

function matchBlockSkipDest(s, i) {
  // s[i] is '('; match a link destination with one level of paren
  // nesting. Returns the index just past the closing ')', or -1.
  if (s[i] !== '(') return -1;
  let j = i + 1;
  while (j < s.length) {
    const ch = s[j];
    if (ch === '\\') { j += 2; continue; }
    if (ch === '(') {
      j++;
      let closed = false;
      while (j < s.length) {
        const c2 = s[j];
        if (c2 === '\\') { j += 2; continue; }
        if (c2 === '(') return -1;
        if (c2 === ')') { j++; closed = true; break; }
        j++;
      }
      if (!closed) return -1;
      continue;
    }
    if (ch === ')') return j + 1;
    j++;
  }
  return -1;
}

function matchBlockSkipLink(s, i) {
  // s[i] is '['; match an inline link per blockSkip's link pattern:
  // a label of non-bracket characters and equal-run code spans,
  // then a destination. Returns the index just past the link, or -1.
  let j = i + 1;
  while (j < s.length) {
    const ch = s[j];
    if (ch === ']') {
      const d = matchBlockSkipDest(s, j + 1);
      return d >= 0 ? d : -1;
    }
    if (ch === '[') return -1;
    if (ch === '\\') { j += 2; continue; }
    if (ch === '`') {
      const span = findEqualCodeSpan(s, j);
      if (span < 0) return -1;
      j = span; continue;
    }
    j++;
  }
  return -1;
}

function maskBlockSkip(s) {
  // A link needs '](', a code span needs a backtick, HTML needs '<'.
  // Without any of those there is nothing to mask.
  if (!s.includes('](') && !s.includes('`') && !s.includes('<')) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '[') {
      const m = matchBlockSkipLink(s, i);
      if (m >= 0) { out += '[' + 'a'.repeat(m - i - 2) + ']'; i = m; continue; }
      out += ch; i++; continue;
    }
    if (ch === '`') {
      const span = findEqualCodeSpan(s, i);
      if (span >= 0) { out += '[' + 'a'.repeat(span - i - 2) + ']'; i = span; continue; }
      let n = 0;
      while (i + n < s.length && s[i + n] === '`') n++;
      out += s.slice(i, i + n); i += n; continue;
    }
    if (ch === '<' && s[i + 1] !== ' ' && s[i + 1] !== undefined) {
      let j = i + 1;
      while (j < s.length && s[j] !== '<' && s[j] !== '>') j++;
      if (j < s.length && s[j] === '>') { out += '[' + 'a'.repeat(j - i - 1) + ']'; i = j + 1; continue; }
      out += ch; i++; continue;
    }
    out += ch; i++;
  }
  return out;
}

// Does the text hold a (non-image) link? Used by the reflinkSearch
// pass: a label that holds a link is kept, only its ref is masked.
function linkInText(text, refs, st) {
  if (!text.includes('[')) return false;
  const toks = tokenize(text, refs, false, st, true);
  return toks.some((t) => t.k === 8 && !t.auto);
}

function maskReflinks(s, refs, st) {
  if (!refs || refs.size === 0 || !s.includes('[')) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const bang = s[i] === '!' && s[i + 1] === '[';
    if (s[i] === '[' || bang) {
      const open = bang ? i + 1 : i;
      const closeIdx = findBracketEnd(s, open);
      if (closeIdx >= 0) {
        const after = closeIdx + 1;
        if (s[after] === '[') {
          // A full reference link [label][ref].
          const refEnd = findRefEnd(s, after);
          if (refEnd >= 0) {
            const ref = refs.get(normalizeLabel(s.slice(after + 1, refEnd)));
            if (ref) {
              const label = s.slice(open + 1, closeIdx);
              const whole = s.slice(i, refEnd + 1);
              if (!bang && linkInText(label, refs, st)) {
                out += '[' + maskReflinks(label, refs, st) + '][' +
                  'a'.repeat(refEnd - closeIdx - 2) + ']';
              } else {
                out += '[' + 'a'.repeat(whole.length - 2) + ']';
              }
              i = refEnd + 1;
              continue;
            }
          }
        } else {
          // A shortcut reference [ref]; the ref grammar allows
          // backticks, so fall back to it when the label grammar
          // cannot close the bracket.
          const ref = refs.get(normalizeLabel(s.slice(open + 1, closeIdx)));
          if (ref) {
            const whole = s.slice(i, closeIdx + 1);
            out += '[' + 'a'.repeat(whole.length - 2) + ']';
            i = closeIdx + 1;
            continue;
          }
        }
      } else if (s[i] === '[' || bang) {
        // The label grammar failed: a shortcut may still match with
        // the ref grammar (backticks allowed).
        const refEnd = findRefEnd(s, open);
        if (refEnd >= 0) {
          const ref = refs.get(normalizeLabel(s.slice(open + 1, refEnd)));
          if (ref) {
            const whole = s.slice(i, refEnd + 1);
            out += '[' + 'a'.repeat(whole.length - 2) + ']';
            i = refEnd + 1;
            continue;
          }
        }
      }
    }
    out += s[i]; i++;
  }
  return out;
}

// The masked inline source: delimiters inside a masked span are
// dead. `skipRefs` avoids the reflink pass (used while checking
// whether a label holds a link, where the mask is not needed).
function computeEmMask(s, refs, st, skipRefs) {
  // Nothing a mask step can match: no backtick, bracket, tag, or
  // escape. The mask is the identity.
  if (!/[\\`[<]/.test(s)) return s;
  let t = s;
  if (!skipRefs) t = maskReflinks(t, refs, st);
  t = maskOt(t);
  t = maskBlockSkip(t);
  return t;
}

// Sticky autolink patterns: matched at an exact position, so the
// tokenizer never copies the rest of the string to test a prefix.
// lastIndex is set immediately before each exec, so sharing them
// across the (recursive) tokenize calls is safe.
const RE_HTTP_URL = /(?:https?|ftp):\/\/[^\s<]+/iy;
const RE_MAILTO = /(mailto|xmpp):[A-Za-z0-9._+-]+@[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?)*/y;
const RE_XMPP_RES = /\/[A-Za-z0-9.@]+/y;
const RE_WWW = /www\.[\w-]+(\.[\w-]+)+(?:[^\s<]*)?/y;
const RE_EMAIL = /[A-Za-z0-9._+-]+@[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?)*/y;

// Characters the tokenizer's main loop handles specially. A run of
// any other character is plain text and can be appended in bulk.
// WORD_CHARS marks the characters that can extend an email address
// (an alphanumeric after any other character may start a bare-email
// autolink, so the bulk run stops there).
const PLAIN_CHARS = new Uint8Array(128);
for (let c = 0; c < 128; c++) PLAIN_CHARS[c] = 1;
for (const c of [10, 13, 33, 38, 42, 60, 70, 72, 91, 92, 95, 96, 102, 104, 109, 119, 120, 126]) PLAIN_CHARS[c] = 0;
const WORD_CHARS = new Uint8Array(128);
for (let c = 48; c <= 57; c++) WORD_CHARS[c] = 1;
for (let c = 65; c <= 90; c++) WORD_CHARS[c] = 1;
for (let c = 97; c <= 122; c++) WORD_CHARS[c] = 1;
WORD_CHARS[46] = 1; WORD_CHARS[43] = 1; WORD_CHARS[64] = 1; WORD_CHARS[45] = 1;

function tokenize(s, refs, inLink, st, skipMaskRefs) {
  const tokens = [];
  let buf = '';
  const flush = () => { if (buf !== '') { tokens.push({ k: 0, s: buf }); buf = ''; } };
  // The emphasis mask: a delimiter whose position was changed by it
  // is dead (it lies inside a link, code span, or HTML tag). It only
  // matters when the text holds an emphasis delimiter at all.
  const maskStr = /[*_~]/.test(s) ? computeEmMask(s, refs, st, skipMaskRefs) : s;
  // A bare-email autolink needs an '@' somewhere ahead; without one
  // the email rule (and its boundary check) is skipped entirely.
  const hasAt = s.includes('@');
  let i = 0;
  const n = s.length;
  while (i < n) {
    const ch = s[i];
    // Fast path: a run of plain text, appended in one slice. Stop at
    // any character the main loop handles, and (when an '@' is
    // present) at a word start, where a bare-email autolink could
    // begin; the main loop decides those with the boundary test.
    const c0 = ch.charCodeAt(0);
    if (c0 < 128 && PLAIN_CHARS[c0]) {
      let j = i;
      while (j < n) {
        const cj = s.charCodeAt(j);
        if (cj < 128 && !PLAIN_CHARS[cj]) break;
        if (hasAt && cj < 128 && ((cj >= 48 && cj <= 57) || (cj >= 65 && cj <= 90) || (cj >= 97 && cj <= 122))) {
          const prev = j > 0 ? s.charCodeAt(j - 1) : -1;
          if (prev === -1 || prev >= 128 || !WORD_CHARS[prev]) break;
        }
        j++;
      }
      if (j > i) { buf += s.slice(i, j); i = j; continue; }
    }
    if (ch === '\\') {
      if (i + 1 < n && s[i + 1] === '\n') {
        flush(); tokens.push({ k: 3 }); i += 2;
        // The line after a hard break loses its leading whitespace.
        while (i < n && (s[i] === ' ' || s[i] === '\t')) i++;
        continue;
      }
      if (i + 1 < n && isAsciiPunct(s[i + 1])) { buf += s[i + 1]; i += 2; continue; }
      buf += '\\'; i++; continue;
    }
    if (ch === '\n') {
      // hard break: two or more trailing spaces
      let sp = 0;
      while (sp < buf.length && buf[buf.length - 1 - sp] === ' ') sp++;
      if (sp >= 2) {
        buf = buf.slice(0, buf.length - sp); flush(); tokens.push({ k: 3 });
        // The line after a hard break loses its leading whitespace.
        let k = i + 1;
        while (k < n && (s[k] === ' ' || s[k] === '\t')) k++;
        i = k;
      } else { buf += '\n'; i++; }
      continue;
    }
    if (ch === '`') {
      let len = 0;
      while (i + len < n && s[i + len] === '`') len++;
      let j = i + len;
      let found = -1;
      while (j < n) {
        if (s[j] === '`') {
          let m = 0;
          while (j + m < n && s[j + m] === '`') m++;
          if (m === len) { found = j; break; }
          j += m;
        } else j++;
      }
      if (found < 0) { buf += s.slice(i, i + len); i += len; continue; }
      let content = s.slice(i + len, found).replace(/\n/g, ' ');
      if (content.length >= 2 && content[0] === ' ' && content[content.length - 1] === ' ' && content.trim() !== '') {
        content = content.slice(1, -1);
      }
      flush();
      tokens.push({ k: 2, s: content });
      i = found + len;
      continue;
    }
    if (ch === '*' || ch === '_' || ch === '~') {
      let len = 0;
      while (i + len < n && s[i + len] === ch) len++;
      // A run of three or more tildes is never a delimiter.
      if (ch === '~' && len >= 3) { buf += s.slice(i, i + len); i += len; continue; }
      const prev = i > 0 ? s[i - 1] : undefined;
      const next = i + len < n ? s[i + len] : undefined;
      const prevSpace = prev === undefined || isSpaceCh(prev);
      const nextSpace = next === undefined || isSpaceCh(next);
      const prevPunct = prev !== undefined && isPunctCh(prev);
      const nextPunct = next !== undefined && isPunctCh(next);
      const leftFlank = !nextSpace && (!nextPunct || prevSpace || prevPunct);
      const rightFlank = !prevSpace && (!prevPunct || nextSpace || nextPunct);
      let canOpen = leftFlank && (ch !== '_' || !rightFlank || prevPunct);
      let canClose = rightFlank && (ch !== '_' || !leftFlank || nextPunct);
      if (ch === '~') { canOpen = leftFlank; canClose = rightFlank; }
      if (!canOpen && !canClose) { buf += s.slice(i, i + len); i += len; continue; }
      flush();
      tokens.push({ k: 4, ch, len, run: len, open: canOpen, close: canClose, pos: i, masked: maskStr[i] !== ch });
      i += len;
      continue;
    }
    if (ch === '!' && s[i + 1] === '[') {
      const b = resolveBracket(s, i + 1, refs);
      if (b) {
        const r = b.r;
        const innerRaw = b.innerRaw;
        {
          flush();
          // The alt text is the link text rendered as inline (links
          // inside it resolve to their text) with tags stripped; a
          // nested image contributes its own alt text. The alt is
          // not document content: an <a> in it must not touch the
          // document's autolink state.
          const savedLink = st ? st.inLink : false;
          const altHtml = parseInline(innerRaw, refs, false, st);
          if (st) st.inLink = savedLink;
          const alt = altHtml.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, '$1').replace(/<[^>]*>/g, '');
          tokens.push({ k: 9, src: cleanUrl(r.href), alt, title: r.title });
          i = r.end;
          continue;
        }
      }
      buf += '!'; i++; continue;
    }
    if (ch === '[' && !inLink) {
      const b = resolveBracket(s, i, refs);
      if (b) {
        const r = b.r;
        const innerRaw = b.innerRaw;
        {
          // A link whose text contains a link is not a link: the
          // inner link stands and the outer brackets stay literal.
          // Autolinks and images inside link text are fine. Link
          // text is not document content: an <a> in it must not
          // touch the document's autolink state.
          const savedLink = st ? st.inLink : false;
          const checkTokens = tokenize(innerRaw, refs, false, st);
          if (st) st.inLink = savedLink;
          if (!checkTokens.some((t) => t.k === 8 && !t.auto)) {
            flush();
            // Inside link text, extended autolinks stay plain text
            // (only <...> autolinks still form), so re-tokenize
            // with inLink set when the text holds one; otherwise
            // the check tokens are already the render tokens.
            let innerTokens = checkTokens;
            if (checkTokens.some((t) => t.k === 8 && t.auto && !t.angle)) {
              const savedLink2 = st ? st.inLink : false;
              innerTokens = tokenize(innerRaw, refs, true, st);
              if (st) st.inLink = savedLink2;
            }
            processEmphasis(innerTokens);
            tokens.push({ k: 8, href: cleanUrl(r.href), title: r.title, html: renderTokens(innerTokens) });
            i = r.end;
            continue;
          }
        }
      }
      buf += '['; i++; continue;
    }
    if (ch === '<') {
      const tag = scanHtmlTag(s, i);
      if (tag !== null) {
        // An unclosed <a ...> tag (with a space after the name)
        // suppresses extended autolinks for the rest of the
        // document; a literal </a> restores them. The state lives
        // in st and persists across paragraphs; bare <a>, <a/>, and
        // <a\n...> do not set it, and <a> inside link text or a
        // code span does not touch the document state.
        if (st) {
          const low = tag.toLowerCase();
          if (low.startsWith('<a ')) st.inLink = true;
          else if (low === '</a>') st.inLink = false;
        }
        flush(); tokens.push({ k: 1, s: tag }); i += tag.length; continue;
      }
      // autolink <scheme:...> or <email>
      const rest = s.slice(i);
      let m = rest.match(/^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\s]*)>/);
      if (m) {
        flush();
        const href = cleanUrl(m[1]);
        tokens.push({ k: 8, href, title: null, html: esc(m[1]), auto: true, angle: true });
        i += m[0].length;
        continue;
      }
      m = rest.match(/^<([A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9])?)*)>/);
      if (m) {
        flush();
        tokens.push({ k: 8, href: 'mailto:' + esc(m[1]), title: null, html: esc(m[1]), auto: true, angle: true });
        i += m[0].length;
        continue;
      }
      buf += '<'; i++; continue;
    }
    if (ch === '&') {
      const rest = s.slice(i);
      let m = rest.match(/^&#[0-9]+;/);
      if (!m) m = rest.match(/^&#[xX][0-9A-Fa-f]+;/);
      if (m) {
        const d = decodeNumericRef(m[0].slice(1, -1));
        if (d !== null) { buf += d; i += m[0].length; continue; }
        buf += '&'; i++; continue;
      }
      m = rest.match(/^&([A-Za-z][A-Za-z0-9]*);/);
      if (m) { flush(); tokens.push({ k: 1, s: m[0] }); i += m[0].length; continue; }
      buf += '&'; i++; continue;
    }
    if (!inLink && !(st && st.inLink) && (ch === 'h' || ch === 'f' || ch === 'H' || ch === 'F') && (i === 0 || /[\s(\[{<"'\*_ ]/.test(s[i - 1]))) {
      RE_HTTP_URL.lastIndex = i;
      const m = RE_HTTP_URL.exec(s);
      if (m) {
        const url = trimUrlEnd(m[0]);
        if (url.length > 0 && /^(?:https?|ftp):\/\/\S/i.test(url)) {
          flush();
          tokens.push({ k: 8, href: cleanUrl(url), title: null, html: esc(url), auto: true });
          i += url.length;
          continue;
        }
      }
    }
    // Scheme autolink: mailto:email or xmpp:email[/resource].
    // Only these two lowercase schemes count; anything else leaves
    // the email to the bare-email rule below. The scheme test is
    // first: it fails on the first character almost everywhere, so
    // the boundary check runs only where a scheme actually starts.
    if (!inLink && !(st && st.inLink) && (s.startsWith('mailto:', i) || s.startsWith('xmpp:', i)) && isAutoBoundary(s, i)) {
      RE_MAILTO.lastIndex = i;
      const m = RE_MAILTO.exec(s);
      if (m) {
        let url = m[0];
        let hasResource = false;
        if (m[1] === 'xmpp' && s[i + url.length] === '/') {
          RE_XMPP_RES.lastIndex = i + url.length;
          const rm = RE_XMPP_RES.exec(s);
          if (rm) { url += rm[0]; hasResource = true; }
        }
        let ok = url.split('@')[1].includes('.');
        if (ok && !hasResource) {
          const nextCh = s[i + url.length];
          if (nextCh === '-' || nextCh === '_') {
            const scheme = m[1] + ':';
            const fixed = emailAfter(tokens, url.slice(scheme.length), nextCh);
            if (fixed === null) ok = false;
            else url = scheme + fixed;
          }
        }
        if (ok) {
          url = trimUrlEnd(url);
          if (url.length > 0) {
            flush();
            tokens.push({ k: 8, href: cleanUrl(url), title: null, html: esc(url), auto: true });
            i += url.length;
            continue;
          }
        }
      }
    }
    if (!inLink && !(st && st.inLink) && ch === 'w' && s.startsWith('www.', i) && (i === 0 || /[\s(\[{<"'\*_ ]/.test(s[i - 1]))) {
      RE_WWW.lastIndex = i;
      const m = RE_WWW.exec(s);
      if (m) {
        const url = trimUrlEnd(m[0]);
        if (url.length > 4 && /www\.[\w-]+(\.[\w-]+)+/.test(url)) {
          flush();
          tokens.push({ k: 8, href: cleanUrl('http://' + url), title: null, html: esc(url), auto: true });
          i += url.length;
          continue;
        }
      }
      buf += 'w'; i++; continue;
    }
    if (ch === ' ' || ch === '\t') { buf += ch; i++; continue; }
    // possible extended email autolink: only when previous char is a
    // boundary and this char can start a local part
    if (hasAt && !inLink && !(st && st.inLink) && /[A-Za-z0-9]/.test(ch) && isAutoBoundary(s, i)) {
      RE_EMAIL.lastIndex = i;
      const m = RE_EMAIL.exec(s);
      if (m) {
        let email = trimUrlEnd(m[0]);
        // A '-' or '_' directly after the address means the address
        // is incomplete (backtrack a label, or no link at all).
        const nextCh = s[i + m[0].length];
        email = emailAfter(tokens, email, nextCh);
        if (email !== null && email.includes('@') && email.split('@')[1].includes('.')) {
          flush();
          tokens.push({ k: 8, href: 'mailto:' + esc(email), title: null, html: esc(email), auto: true });
          i += email.length;
          continue;
        }
      }
    }
    buf += ch; i++;
  }
  flush();
  return tokens;
}

// Resolve emphasis / strikethrough delimiters in a token array, in
// place (CommonMark delimiter-stack algorithm, simplified: nearest
// opener wins, rule of three applied).
function processEmphasis(tokens) {
  const stacks = { '*': [], '_': [], '~': [] };
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.k !== 4 || tok.masked) { i++; continue; }
    if (tok.open && !tok.inStack) { stacks[tok.ch].push(tok); tok.inStack = true; }
    if (!tok.close) { i++; continue; }
    const stack = stacks[tok.ch];
    let opener = null;
    for (let j = stack.length - 1; j >= 0; j--) {
      const o = stack[j];
      if (o === tok) continue; // a delimiter can never match itself
      if (!o.open) continue;
      if (o.blocked) continue;
      // Strikethrough runs must be the same length on both sides.
      if (tok.ch === '~' && o.len !== tok.len) continue;
      if ((o.close || tok.open) && (o.len + tok.len) % 3 === 0 && (o.len % 3 !== 0 || tok.len % 3 !== 0)) continue;
      opener = o;
      break;
    }
    if (!opener) {
      // A close-only delimiter that finds no opener lifts the block
      // on outer openers whose length sums with its own length to a
      // multiple of 3 (the rule of three, in reverse): a later closer
      // may then match them.
      if (tok.close && !tok.open) {
        for (const o of stack) {
          if (o.blocked && (o.len + tok.len) % 3 === 0 && !(o.len % 3 === 0 && tok.len % 3 === 0)) o.blocked = false;
        }
      }
      i++; continue;
    }
    const use = tok.ch === '~' ? tok.len : (opener.len >= 2 && tok.len >= 2 ? 2 : 1);
    // A closer that can both open and close, when it closes an inner
    // emphasis whose opener cannot itself close, blocks outer openers
    // whose length sums with the closer's run length to a multiple
    // of 3 (the rule of three, applied to the delimiter that did the
    // closing). Those openers can no longer match a later closer.
    if (tok.open && tok.close && !opener.close) {
      const closerLen = tok.run;
      const oi2 = stack.indexOf(opener);
      for (let j = 0; j < oi2; j++) {
        const o = stack[j];
        if ((o.len + closerLen) % 3 === 0 && !(o.len % 3 === 0 && closerLen % 3 === 0)) o.blocked = true;
      }
    }
    const oi = tokens.indexOf(opener);
    const ci = tokens.indexOf(tok);
    if (oi < 0 || ci < 0 || ci <= oi) { i++; continue; }
    const kind = tok.ch === '~' ? 7 : (use === 2 ? 6 : 5);
    const children = tokens.slice(oi + 1, ci);
    const node = { k: kind, children };
    opener.len -= use;
    tok.len -= use;
    // drop openers that lie between the pair: they can no longer match
    for (const ch2 of ['*', '_', '~']) {
      const st = stacks[ch2];
      for (let j = st.length - 1; j >= 0; j--) {
        const d = st[j];
        const di = tokens.indexOf(d);
        if (di > oi && di < ci) { st.splice(j, 1); d.inStack = false; }
      }
    }
    const insert = [];
    if (opener.len > 0) insert.push(opener);
    else {
      const si = stack.indexOf(opener);
      if (si >= 0) { stack.splice(si, 1); opener.inStack = false; }
    }
    insert.push(node);
    if (tok.len > 0) insert.push(tok);
    else {
      const si = stack.indexOf(tok);
      if (si >= 0) { stack.splice(si, 1); tok.inStack = false; }
    }
    tokens.splice(oi, ci - oi + 1, ...insert);
    // A closer with length left may close another opener, so it is
    // re-visited at its new position instead of being skipped.
    i = tok.len > 0 ? oi + insert.length - 1 : oi + insert.length;
  }
  return tokens;
}

function renderTokens(tokens) {
  let out = '';
  for (const t of tokens) {
    switch (t.k) {
      case 0: out += esc(t.s); break;
      case 1: out += t.s; break;
      case 2: out += '<code>' + esc(t.s) + '</code>'; break;
      case 3: out += '<br>'; break;
      case 4: out += t.ch.repeat(t.len); break;
      case 5: out += '<em>' + renderTokens(t.children) + '</em>'; break;
      case 6: out += '<strong>' + renderTokens(t.children) + '</strong>'; break;
      case 7: out += '<del>' + renderTokens(t.children) + '</del>'; break;
      case 8: {
        out += '<a href="' + t.href + '"';
        if (t.title !== null && t.title !== undefined) out += ' title="' + escAttr(t.title) + '"';
        out += '>' + t.html + '</a>';
        break;
      }
      case 9: {
        out += '<img src="' + t.src + '" alt="' + escAttr(t.alt) + '"';
        if (t.title !== null && t.title !== undefined) out += ' title="' + escAttr(t.title) + '"';
        out += '>';
        break;
      }
    }
  }
  return out;
}

// Set while the first pass walks the blocks to collect link
// reference definitions: inline parsing is pure waste there (its
// HTML is discarded), so parseInline returns early and the pass
// costs only the block walk plus parseLinkDefs.
let collectOnly = false;

function parseInline(text, refs, inLink, st) {
  if (text === '' || collectOnly) return '';
  const tokens = tokenize(text, refs, !!inLink, st);
  processEmphasis(tokens);
  return renderTokens(tokens);
}

// ---------------- block parsing ----------------

const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead title tr track ul').split(' '));

function isBlank(line) {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c !== ' ' && c !== '\t') return false;
  }
  return true;
}

// Column width of the leading whitespace of a line.
function indentOf(line) {
  let col = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === ' ') col++;
    else if (c === '\t') col += 4 - (col % 4);
    else break;
  }
  return col;
}

// Remove n columns of leading indent; a tab straddling the boundary
// leaves the remaining columns as spaces.
function stripCols(line, n) {
  let col = 0;
  let i = 0;
  while (i < line.length && col < n) {
    const c = line[i];
    if (c === ' ') { col++; i++; }
    else if (c === '\t') {
      const next = col + 4 - (col % 4);
      if (next > n) return ' '.repeat(next - n) + line.slice(i + 1);
      col = next; i++;
    } else break;
  }
  return line.slice(i);
}

// Strip `targetCol - fromCol` columns starting at index fromIdx (whose
// column is fromCol), expanding every surviving leading tab to spaces
// at its original width. Used when a container marker is removed:
// the line that remains has no tabs left in its leading whitespace.
function stripExpand(line, fromIdx, fromCol, targetCol) {
  let ocol = fromCol; // original column of line[i]
  let col = fromCol; // columns consumed toward the target
  let i = fromIdx;
  let out = '';
  while (i < line.length && col < targetCol) {
    const c = line[i];
    if (c === ' ') { col++; ocol++; i++; }
    else if (c === '\t') {
      const w = 4 - (ocol % 4);
      if (col + w > targetCol) { out += ' '.repeat(col + w - targetCol); col = targetCol; ocol += w; i++; }
      else { col += w; ocol += w; i++; }
    } else break;
  }
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
    const c = line[i];
    if (c === ' ') { out += ' '; col++; ocol++; i++; }
    else { const w = 4 - (ocol % 4); out += ' '.repeat(w); col += w; ocol += w; i++; }
  }
  return out + line.slice(i);
}

// Strip n columns starting at index fromIdx (column fromCol), keeping
// surviving tabs as tabs; only a straddling tab becomes spaces.
function stripKeep(line, fromIdx, fromCol, n) {
  let col = fromCol;
  let i = fromIdx;
  const target = fromCol + n;
  while (i < line.length && col < target) {
    const c = line[i];
    if (c === ' ') { col++; i++; }
    else if (c === '\t') {
      const next = col + 4 - (col % 4);
      if (next > target) return ' '.repeat(next - target) + line.slice(i + 1);
      col = next; i++;
    } else break;
  }
  return line.slice(i);
}

// Strip up to n leading whitespace characters from a fenced code block
// content line. Marked strips by character count here, not columns: a
// tab counts as one character and is removed whole when it is inside
// the stripped prefix (e.g. fence indent 1 + "\tfoo" -> "foo", while
// fence indent 0 keeps the tab).
function stripFenceIndent(line, n) {
  let i = 0;
  while (i < n && i < line.length && (line[i] === ' ' || line[i] === '\t')) i++;
  return line.slice(i);
}

function matchAtx(line) {
  const m = line.match(/^ {0,3}(#{1,6})(?:[ \t]+(.*))?$/);
  if (!m) return null;
  let content = m[2] === undefined ? '' : m[2].replace(/[ \t]+$/, '');
  if (/^#+$/.test(content)) content = '';
  else {
    const cm = content.match(/^(.*?)[ \t]+#+$/);
    if (cm) content = cm[1];
  }
  return { level: m[1].length, content };
}

function matchFence(line) {
  const m = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (!m) return null;
  if (m[1][0] === '`' && m[2].includes('`')) return null;
  return { ch: m[1][0], len: m[1].length, info: m[2] };
}

function matchThematic(line) {
  return /^ {0,3}([*_-])(?:[ \t]*\1){2,}[ \t]*$/.test(line);
}

function matchSetext(line) {
  const m = line.match(/^ {0,3}(=+|-+)[ \t]*$/);
  return m ? (m[1][0] === '=' ? 1 : 2) : 0;
}

// HTML block start type (0 = none, 1-7 per CommonMark).
function htmlBlockType(line) {
  const m = line.match(/^ {0,3}</);
  if (!m) return 0;
  const rest = line.slice(m[0].length);
  if (/^(script|pre|style|textarea)(?:[ \t>]|$)/i.test(rest)) return 1;
  if (rest.startsWith('!--')) return 2;
  if (rest.startsWith('?')) return 3;
  if (/^![A-Za-z]/.test(rest)) return 4;
  if (rest.startsWith('![CDATA[')) return 5;
  const tag = rest.match(/^\/?([A-Za-z][A-Za-z0-9-]*)(?:[ \t>\/]|$)/);
  if (tag && BLOCK_TAGS.has(tag[1].toLowerCase())) return 6;
  const tag2 = scanHtmlTag(line, m[0].length - 1);
  if (tag2 !== null) {
    const after = line.slice(m[0].length - 1 + tag2.length);
    if (/^[ \t]*$/.test(after)) return 7;
  }
  return 0;
}

function htmlBlockEnd(line, type) {
  switch (type) {
    case 1: return /<\/(script|pre|style|textarea)/i.test(line);
    case 2: return line.includes('-->');
    case 3: return line.includes('?>');
    case 4: return line.includes('>');
    case 5: return line.includes(']]>');
    default: return isBlank(line);
  }
}

// Match a list marker at the start of a line. Returns null or an
// object describing the marker and where its content begins.
function matchListMarker(line) {
  let col = 0;
  let i = 0;
  while (i < line.length && col < 3) {
    const c = line[i];
    if (c === ' ') { col++; i++; }
    else if (c === '\t') { const nx = col + 4 - (col % 4); if (nx > 3) return null; col = nx; i++; }
    else break;
  }
  if (i >= line.length) return null;
  const ch = line[i];
  let type, marker, start = null, delim = null;
  if (ch === '-' || ch === '+' || ch === '*') {
    type = 'bullet'; marker = ch; i++;
  } else if (ch >= '0' && ch <= '9') {
    let j = i;
    while (j < line.length && line[j] >= '0' && line[j] <= '9') j++;
    if (j - i > 9) return null;
    if (j >= line.length || (line[j] !== '.' && line[j] !== ')')) return null;
    type = 'ordered'; delim = line[j]; start = parseInt(line.slice(i, j), 10); marker = line.slice(i, j + 1); i = j + 1;
  } else return null;
  const markerCol = col;
  const markerWidth = marker.length;
  // content indent: spaces after the marker
  if (i >= line.length) {
    return { type, marker, start, delim, indent: markerCol, contentIndent: markerCol + markerWidth + 1, content: '', next: i };
  }
  const c2 = line[i];
  if (c2 !== ' ' && c2 !== '\t') return null;
  let scol = markerCol + markerWidth;
  let j = i;
  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
    if (line[j] === ' ') { scol++; j++; }
    else { const nx = scol + 4 - (scol % 4); scol = nx; j++; }
  }
  const spaces = scol - (markerCol + markerWidth);
  if (spaces >= 5) {
    return { type, marker, start, delim, indent: markerCol, contentIndent: markerCol + markerWidth + 1, content: stripExpand(line, i, markerCol + markerWidth, markerCol + markerWidth + 1), next: j };
  }
  if (j >= line.length) {
    return { type, marker, start, delim, indent: markerCol, contentIndent: markerCol + markerWidth + 1, content: '', next: j };
  }
  return { type, marker, start, delim, indent: markerCol, contentIndent: scol, content: stripExpand(line, i, markerCol + markerWidth, scol), next: j };
}

// Strip one blockquote marker ('>' plus at most one following space,
// tabs expanded) from the start of a line. Returns null when the
// line does not start with a blockquote marker.
function stripBQPrefix(l) {
  const m = l.match(/^ {0,3}>/);
  if (!m) return null;
  let gtCol = 0;
  for (let c = 0; c < m[0].length - 1; c++) {
    if (m[0][c] === ' ') gtCol++;
    else gtCol += 4 - (gtCol % 4);
  }
  return stripExpand(l, m[0].length, gtCol + 1, gtCol + 2);
}

// Is a paragraph open at the end of these (already container-stripped)
// lines? Used to decide lazy continuation. fromQuote is true when the
// lines come from inside a blockquote: there a whitespace-only line
// is paragraph text (a trailing space), not a blank line.
function openParagraph(lines, fromQuote) {
  let inPara = false;
  let fenceCh = null;
  let fenceLen = 0;
  let fenceDepth = 0;
  let htmlType = 0;
  for (let k = 0; k < lines.length; k++) {
    let l = lines[k];
    // Look through nested blockquote markers: the paragraph inside
    // the innermost quote is what a lazy line would join. Count the
    // depth: a fence opened at a given depth only continues on lines
    // that reach that depth; a line with fewer markers lies outside
    // the fence's container and ends it.
    let depth = 0;
    while (true) {
      const stripped = stripBQPrefix(l);
      if (stripped === null) break;
      l = stripped;
      depth++;
    }
    if (fenceCh) {
      if (depth >= fenceDepth) {
        const cm = l.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (cm && cm[1][0] === fenceCh && cm[1].length >= fenceLen) fenceCh = null;
        continue;
      }
      fenceCh = null; // outside the fence's container: it ends here
    }
    if (htmlType >= 1 && htmlType <= 5) {
      if (htmlBlockEnd(l, htmlType)) htmlType = 0;
      continue;
    }
    if (htmlType >= 6) {
      if (isBlank(l)) htmlType = 0;
      continue;
    }
    if (isBlank(l)) {
      if (!(fromQuote && l !== '')) inPara = false;
      continue;
    }
    if (inPara) {
      if (matchSetext(l) || isDelimiterRow(l)) { inPara = false; continue; }
      // A line that starts a table ends the paragraph before it.
      // The next line in this array is the delimiter row; a header
      // line on its own (last line of the array) leaves the
      // paragraph open.
      if (k + 1 < lines.length) {
        let nx = lines[k + 1];
        while (true) {
          const s2 = stripBQPrefix(nx);
          if (s2 === null) break;
          nx = s2;
        }
        // A line that starts a table ends the paragraph before it,
        // unless the delimiter row is also a setext underline: then
        // the setext heading absorbs the line instead.
        if (isTableHeaderLine(l, nx) && !matchSetext(nx)) { inPara = false; continue; }
      }
      if (!interruptsParagraph(l)) continue; // still in the paragraph
      inPara = false; // fall through: the line starts a new block
    }
    const f = matchFence(l);
    if (f) { fenceCh = f.ch; fenceLen = f.len; fenceDepth = depth; continue; }
    const ht = htmlBlockType(l);
    if (ht >= 1) { htmlType = ht; if (htmlBlockEnd(l, ht)) htmlType = 0; continue; }
    if (matchAtx(l) || matchThematic(l)) continue;
    if (matchListMarker(l)) { inPara = true; continue; } // the item's paragraph may be open
    if (indentOf(l) >= 4) continue; // indented code
    inPara = true; // a paragraph starts
  }
  return inPara;
}
// Is a fenced code block or an HTML block open at the end of these
// (already container-stripped) lines? While one is open, following
// lines belong to it even when they are not indented to the
// container's content level: a fence only ends at its closing fence,
// and an HTML block only ends at its end marker or a blank line.
function openVerbatim(lines) {
  let fenceCh = null;
  let fenceLen = 0;
  let fenceHasContent = false;
  let htmlType = 0;
  for (let k = 0; k < lines.length; k++) {
    let l = lines[k];
    while (true) {
      const stripped = stripBQPrefix(l);
      if (stripped === null) break;
      l = stripped;
    }
    if (fenceCh) {
      const cm = l.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (cm && cm[1][0] === fenceCh && cm[1].length >= fenceLen) { fenceCh = null; fenceHasContent = false; }
      else fenceHasContent = true;
      continue;
    }
    if (htmlType >= 1 && htmlType <= 5) {
      if (htmlBlockEnd(l, htmlType)) htmlType = 0;
      continue;
    }
    if (htmlType >= 6) {
      if (isBlank(l)) htmlType = 0;
      continue;
    }
    if (isBlank(l)) continue;
    const f = matchFence(l);
    if (f) { fenceCh = f.ch; fenceLen = f.len; fenceHasContent = false; continue; }
    const ht = htmlBlockType(l);
    if (ht >= 1) { htmlType = ht; if (htmlBlockEnd(l, ht)) htmlType = 0; continue; }
  }
  // A fence that just opened (no content line yet) does not hold the
  // container open: an unindented next line ends the container and
  // leaves the fence empty (marked: `1. foo\n\n   ```toml\nbar`).
  return (fenceCh !== null && fenceHasContent) || htmlType !== 0;
}

function interruptsParagraph(line) {
  if (matchAtx(line)) return true;
  if (matchFence(line)) return true;
  const ht = htmlBlockType(line);
  if (ht >= 1 && ht <= 6) return true;
  if (matchThematic(line)) return true;
  if (/^ {0,3}>/.test(line)) return true;
  const lm = matchListMarker(line);
  if (lm) {
    // An empty list item cannot interrupt a paragraph.
    if (lm.content.trim() === '') return false;
    if (lm.type === 'bullet') return true;
    if (lm.start === 1) return true;
  }
  return false;
}

// Parse link reference definitions from the start of `text`.
// Returns {pos, refs} with pos the index just past the last definition
// (at a line boundary), or pos 0 when none parsed.
function parseLinkDefs(text, refs) {
  let pos = 0;
  const n = text.length;
  while (pos < n) {
    let p = pos;
    // up to 3 spaces of indent
    let sp = 0;
    while (p < n && text[p] === ' ' && sp < 3) { p++; sp++; }
    if (p < n && (text[p] === ' ' || text[p] === '\t')) break;
    if (text[p] !== '[') break;
    // label (a backslash escape keeps the next character from
    // closing the label, but the backslash stays part of the label:
    // labels are compared raw, escapes unresolved)
    let q = p + 1;
    let label = '';
    let ok = false;
    while (q < n) {
      const c = text[q];
      if (c === '\\' && q + 1 < n && isAsciiPunct(text[q + 1])) { label += text[q] + text[q + 1]; q += 2; continue; }
      if (c === '[') break;
      if (c === ']') { ok = true; break; }
      label += c; q++;
    }
    if (!ok || label.length === 0 || label.length > 999) break;
    const norm = normalizeLabel(label);
    if (norm === '') break;
    q++;
    if (text[q] !== ':') break;
    q++;
    // whitespace (spaces, tabs, newlines) before destination
    while (q < n && (text[q] === ' ' || text[q] === '\t' || text[q] === '\n')) q++;
    if (q >= n) break;
    let dest = null;
    if (text[q] === '<') {
      let r = q + 1;
      let d = '';
      let closed = false;
      while (r < n) {
        const c = text[r];
        if (c === '\n') break;
        if (c === '>') { closed = true; break; }
        if (c === '\\' && r + 1 < n && isAsciiPunct(text[r + 1])) { d += text[r + 1]; r += 2; continue; }
        d += c; r++;
      }
      if (!closed) break;
      dest = d; q = r + 1;
    } else {
      let r = q;
      let d = '';
      let depth = 0;
      let bad = false;
      while (r < n) {
        const c = text[r];
        if (c === ' ' || c === '\t' || c === '\n' || c.charCodeAt(0) < 0x20) break;
        if (c === '\\' && r + 1 < n && isAsciiPunct(text[r + 1])) { d += text[r + 1]; r += 2; continue; }
        if (c === '(') depth++;
        else if (c === ')') {
          if (depth === 0) break;
          depth--;
        }
        d += c; r++;
      }
      if (d === '' || depth !== 0) break;
      dest = d; q = r;
    }
    // Optional title: try it on this line or the next; if it does
    // not parse cleanly to the end of its line, fall back to a
    // destination-only definition.
    let title = null;
    let endPos = -1;
    {
      let r = q;
      let hadWs = false;
      while (r < n && (text[r] === ' ' || text[r] === '\t' || text[r] === '\n')) { r++; hadWs = true; }
      if (hadWs && r < n && (text[r] === '"' || text[r] === "'" || text[r] === '(')) {
        const t = parseTitle(text, r);
        if (t) {
          let s2 = t.next;
          while (s2 < n && (text[s2] === ' ' || text[s2] === '\t')) s2++;
          if (s2 >= n || text[s2] === '\n') {
            title = t.title;
            endPos = s2 < n ? s2 + 1 : s2;
          }
        }
      }
    }
    if (endPos < 0) {
      // destination-only: the rest of the destination's line must be
      // blank, or the definition is invalid
      let e = q;
      let clean = true;
      while (e < n && text[e] !== '\n') {
        if (text[e] !== ' ' && text[e] !== '\t') { clean = false; break; }
        e++;
      }
      if (!clean) break;
      endPos = e < n ? e + 1 : e;
    }
    if (!refs.has(norm)) refs.set(norm, { dest, title });
    pos = endPos;
  }
  return pos;
}

// Split a table row into cells on unescaped pipes. A pipe is a
// separator unless preceded by an odd number of backslashes; the
// backslash that escapes it is consumed. Backslashes are otherwise
// left alone (the inline parser resolves \\). Code spans are not
// special here: a pipe inside one still splits the row.
function splitTableRow(line) {
  const cells = [];
  let cur = '';
  let bs = 0; // consecutive backslashes just seen
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\') { cur += ch; bs++; continue; }
    if (ch === '|') {
      if (bs % 2 === 1) { cur = cur.slice(0, -1) + '|'; bs = 0; continue; }
      cells.push(cur); cur = ''; bs = 0; continue;
    }
    cur += ch; bs = 0;
  }
  cells.push(cur);
  // drop the empty cells a leading / trailing pipe creates
  if (cells.length > 1 && cells[0].trim() === '') cells.shift();
  if (cells.length > 1 && cells[cells.length - 1].trim() === '') cells.pop();
  return cells;
}

function isDelimiterRow(line) {
  const t = line.trim();
  // A delimiter row holds only ':', '-', '|' and whitespace, and at
  // least one '-'. Anything else is rejected without splitting.
  if (!t.includes('-') || !/^[:\-|\s]+$/.test(t)) return null;
  const cells = splitTableRow(t);
  if (cells.length === 0) return null;
  const aligns = [];
  for (const c of cells) {
    const t = c.trim();
    if (!/^:?-+:?$/.test(t)) return null;
    if (t.startsWith(':') && t.endsWith(':')) aligns.push('center');
    else if (t.startsWith(':')) aligns.push('left');
    else if (t.endsWith(':')) aligns.push('right');
    else aligns.push(null);
  }
  return aligns;
}

// A table delimiter row as marked's table rule reads it: at most
// three leading spaces (a tab or four spaces makes it indented code
// or paragraph text, not a delimiter).
function tableDelimiterRow(line) {
  let sp = 0;
  while (sp < line.length && line[sp] === ' ' && sp < 4) sp++;
  if (sp >= 4 || (sp < line.length && line[sp] === '\t')) return null;
  return isDelimiterRow(line.slice(sp));
}

// Is `line` a table header line (a non-blank line whose next line is
// a delimiter row)? This is the table rule's regex, which the
// paragraph rule uses to decide where a paragraph ends: it does not
// check cell counts or the delimiter's ':'/'|' (those are the table
// tokenizer's job, and a paragraph still ends before a header whose
// delimiter turns out not to make a table).
function isTableHeaderLine(line, nextLine) {
  if (nextLine === undefined) return false;
  let i = 0;
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++;
  if (i >= line.length) return false;
  return tableDelimiterRow(nextLine) !== null;
}

// Parse a range of lines into blocks. Returns {html, kinds} where
// kinds names each top-level block ('p' for paragraph). `tight`
// renders paragraphs without <p> tags (tight list items).
function parseRange(lines, refs, atEnd, endsWithNL, inList, st) {
  const blocks = [];
  let loose = false;
  let i = 0;
  const end = lines.length;
  while (i < end) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    // A blank line directly before this block separates it from the
    // previous top-level block: the enclosing list item is loose.
    if (blocks.length > 0 && i > 0 && isBlank(lines[i - 1])) loose = true;
    // ATX heading
    const atx = matchAtx(line);
    if (atx) {
      const h = '<h' + atx.level + '>' + parseInline(atx.content, refs, false, st) + '</h' + atx.level + '>\n';
      blocks.push({ kind: 'h', html: h, tight: h });
      i++;
      continue;
    }
    // fenced code
    const fence = matchFence(line);
    if (fence) {
      const findent = fence.ch === '`' ? line.match(/^ */)[0].length : 0;
      const content = [];
      i++;
      let closed = false;
      while (i < end) {
        const l = lines[i];
        const cm = l.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (cm && cm[1][0] === fence.ch && cm[1].length >= fence.len) { closed = true; i++; break; }
        content.push(findent > 0 ? stripFenceIndent(l, findent) : l);
        i++;
      }
      void closed;
      let text = content.join('\n');
      if (text !== '' && !text.endsWith('\n')) text += '\n';
      const info = fence.info.trim().replace(/\\([!-/:-@[-`{-~])/g, '$1');
      const lang = info === '' ? '' : info.split(/[ \t]+/)[0];
      const code = '<pre><code' + (lang ? ' class="language-' + escAttr(lang) + '"' : '') + '>' + esc(text) + '</code></pre>\n';
      blocks.push({ kind: 'code', html: code, tight: code });
      continue;
    }
    // HTML block
    const ht = htmlBlockType(line);
    if (ht >= 1) {
      const content = [];
      let done = false;
      while (i < end) {
        const l = lines[i];
        if (content.length > 0 && (ht === 6 || ht === 7) && isBlank(l)) break;
        content.push(l);
        i++;
        if (htmlBlockEnd(l, ht)) { done = true; break; }
      }
      void done;
      // The block's text is its lines joined with newlines. A trailing
      // newline belongs to it when the next line in this container is
      // not blank, or when the block runs to the document's end and
      // the input ends with a newline. For types 1-5 a whitespace-only
      // next line still counts (it is not empty); for types 6-7 only a
      // non-blank next line does.
      let trailing = false;
      if (i < end) trailing = ht <= 5 ? lines[i].length > 0 : !isBlank(lines[i]);
      else trailing = atEnd && endsWithNL;
      const html = content.join('\n') + (trailing ? '\n' : '');
      blocks.push({ kind: 'html', html, tight: html });
      continue;
    }
    // thematic break
    if (matchThematic(line)) {
      blocks.push({ kind: 'hr', html: '<hr>\n', tight: '<hr>\n' });
      i++;
      continue;
    }
    // blockquote
    if (/^ {0,3}>/.test(line)) {
      const inner = [];
      let j = i;
      while (j < end) {
        const l = lines[j];
        const m = l.match(/^ {0,3}>/);
        if (m) {
          const rest = stripBQPrefix(l);
          // A line that strips to only whitespace is paragraph text
          // (a trailing space) when a paragraph is open, else blank.
          if (rest !== '' && isBlank(rest)) {
            if (openParagraph(inner, true)) inner[inner.length - 1] += '\n' + rest;
            else inner.push('');
          } else inner.push(rest);
          j++;
          continue;
        }
        if (isBlank(l)) break; // a blank line without '>' ends the quote
        // lazy continuation: the line joins the paragraph's text directly, so it can never be
        // re-read as a block start. A lazy line that looks like a
        // setext underline must not become one, so it is indented
        // out of the way instead.
        if (inner.length > 0 && openParagraph(inner, true) && !interruptsParagraph(l)) {
          // A lazy line that starts a table (header + delimiter row)
          // or is the delimiter row of a table started by the
          // previous line stays its own line: marked's table rule
          // reads the raw lines, and a folded line can never be
          // re-read as a table header.
          const lstripped = indentOf(l) >= 4 ? stripKeep(l, 0, 0, 4) : l;
          let lnx = j + 1 < end ? lines[j + 1] : null;
          if (lnx !== null) {
            const s2 = stripBQPrefix(lnx);
            if (s2 !== null) lnx = s2;
          }
          const lIsHeader = lnx !== null && isTableHeaderLine(lstripped, lnx) && !matchSetext(l);
          const lPrevLast = inner[inner.length - 1].split('\n').pop();
          const lIsDelim = tableDelimiterRow(lstripped) !== null && isTableHeaderLine(lPrevLast, lstripped);
          if (lIsHeader || lIsDelim) { inner.push(lstripped); j++; continue; }
          if (matchSetext(l) && !matchThematic(l) && !matchListMarker(l)) inner.push('    ' + l);
          else inner[inner.length - 1] += '\n' + lstripped;
          j++;
          continue;
        }
        break;
      }
      const sub = parseRange(inner, refs, atEnd && j >= end, endsWithNL, false, st);
      const q = '<blockquote>\n' + sub.html + '</blockquote>\n';
      blocks.push({ kind: 'quote', html: q, tight: q });
      i = j;
      continue;
    }
    // list
    const lm = matchListMarker(line);
    if (lm) {
      const res = parseList(lines, i, end, refs, lm, atEnd, endsWithNL, st);
      blocks.push({ kind: 'list', html: res.html, tight: res.html });
      i = res.next;
      continue;
    }
    // indented code
    if (indentOf(line) >= 4) {
      const content = [];
      while (i < end) {
        const l = lines[i];
        if (isBlank(l)) {
          let k = i + 1;
          while (k < end && isBlank(lines[k])) k++;
          if (k < end && indentOf(lines[k]) >= 4) {
            while (i < k) { content.push(stripCols(lines[i], 4)); i++; }
            continue;
          }
          break;
        }
        if (indentOf(l) >= 4) { content.push(stripCols(l, 4)); i++; continue; }
        break;
      }
      const code = '<pre><code>' + esc(content.join('\n') + '\n') + '</code></pre>\n';
      blocks.push({ kind: 'code', html: code, tight: code });
      continue;
    }
    // paragraph (with setext heading / table / link definitions)
    const start = i;
    const paraLines = [];
    let paraTrailingNL = false;
    while (i < end) {
      const l = lines[i];
      if (isBlank(l)) {
        // A whitespace-only line that contains a tab is a table
        // row (empty cells), not a paragraph break, once the
        // paragraph has a header and a delimiter row. A line of
        // only spaces still ends the paragraph.
        if (l.includes('\t') && paraLines.length >= 2 && isDelimiterRow(paraLines[1])) {
          paraLines.push(l); i++; continue;
        }
        break;
      }
      // a setext underline is paragraph content, not an interruption
      if (paraLines.length > 0 && matchSetext(l)) { paraLines.push(l); i++; continue; }
      // A line that starts a table ends the paragraph before it
      // (marked's paragraph rule stops at a table header). A header
      // indented four or more columns is indented code instead, and
      // indented code directly after a paragraph merges back into
      // it with one indent level stripped, so the paragraph takes
      // the line dedented and ends there. When the delimiter row is
      // also a setext underline, the setext heading wins instead:
      // the paragraph keeps the line and the heading absorbs it.
      if (paraLines.length > 0 && i + 1 < end && isTableHeaderLine(l, lines[i + 1]) && !matchSetext(lines[i + 1])) {
        if (indentOf(l) >= 4) {
          paraLines.push(stripCols(l, 4));
          paraTrailingNL = true;
          i++;
        }
        break;
      }
      if (paraLines.length > 0 && interruptsParagraph(l)) break;
      // Inside a list item, any list marker starts a new block
      // (a nested list) even when its start number is not 1: the
      // paragraph-interruption rule only gates the top level and
      // blockquotes. The marker is already at the item's content
      // level here, so it is a block start, not continuation text.
      if (paraLines.length > 0 && inList && matchListMarker(l)) break;
      // Inside a list item, a continuation line indented by four or
      // more columns joins the paragraph with four fewer columns.
      paraLines.push(paraLines.length > 0 && inList && indentOf(l) >= 4 ? stripCols(l, 4) : l);
      i++;
    }
    const paraText = paraLines.join('\n') + (paraTrailingNL ? '\n' : '');
    const defEnd = parseLinkDefs(paraText, refs);
    let restLines = paraText.split('\n');
    if (defEnd > 0) {
      const rest = paraText.slice(defEnd);
      if (rest.trim() === '') continue;
      restLines = rest.split('\n');
    }
    if (restLines.length >= 2) {
      // table: the second line must be a delimiter row with exactly
      // as many cells as the header, indented at most three spaces,
      // and containing ':' or '|' (marked's tableDelimiter test)
      {
        const aligns = tableDelimiterRow(restLines[1]);
        const header = splitTableRow(restLines[0]);
        if (aligns && /[:|]/.test(restLines[1]) && aligns.length === header.length) {
          let t = '<table>\n<thead>\n<tr>\n';
          for (let c = 0; c < header.length; c++) {
            const a = aligns[c];
            t += '<th' + (a ? ' align="' + a + '"' : '') + '>' + parseInline(header[c].trim(), refs, false, st) + '</th>\n';
          }
          const hasBody = restLines.length > 2;
          t += '</tr>\n</thead>\n';
          if (hasBody) t += '<tbody>';
          for (let r = 2; r < restLines.length; r++) {
            const cells = splitTableRow(restLines[r]);
            t += '<tr>\n';
            for (let c = 0; c < header.length; c++) {
              const cell = c < cells.length ? cells[c] : '';
              const a = aligns[c];
              t += '<td' + (a ? ' align="' + a + '"' : '') + '>' + parseInline(cell.trim(), refs, false, st) + '</td>\n';
            }
            t += '</tr>\n';
          }
          t += hasBody ? '</tbody></table>\n' : '</table>\n';
          blocks.push({ kind: 'table', html: t, tight: t });
          continue;
        }
      }
      // setext heading: the underline is the first setext-looking line
      let sl = 0;
      let si = -1;
      for (let k = 1; k < restLines.length; k++) {
        const v = matchSetext(restLines[k]);
        if (v) { sl = v; si = k; break; }
      }
      if (sl) {
        const headLines = restLines.slice(0, si);
        headLines[0] = headLines[0].replace(/^ +/, '');
        headLines[headLines.length - 1] = headLines[headLines.length - 1].replace(/[ \t]+$/, '');
        const h = '<h' + sl + '>' + parseInline(headLines.join('\n'), refs, false, st) + '</h' + sl + '>\n';
        blocks.push({ kind: 'h', html: h, tight: h });
        // the remaining lines form new blocks; rewind the main loop
        const consumed = paraLines.length - restLines.length + si + 1;
        i = start + consumed;
        continue;
      }
    }
    const ptext = restLines.join('\n');
    const pinline = parseInline(ptext, refs, false, st);
    blocks.push({ kind: 'p', html: '<p>' + pinline + '</p>\n', tight: pinline });
  }
  return { html: blocks.map((b) => b.html).join(''), kinds: blocks.map((b) => b.kind), blocks, loose };
}

// Parse a list starting at `start` (whose marker is `first`).
// Returns {html, next}.
function parseList(lines, start, end, refs, first, atEnd, endsWithNL, st) {
  const items = [];
  let i = start;
  let cur = first;
  let itemLines = [cur.content];
  let itemHasContent = cur.content.trim() !== '';
  let blankBetweenItems = false;
  const sameList = (m) => {
    if (m.type !== cur.type) return false;
    if (m.type === 'bullet') return m.marker === cur.marker;
    return m.delim === cur.delim;
  };
  const finishItem = () => {
    items.push({ lines: itemLines });
  };
  i++;
  while (i < end) {
    const line = lines[i];
    if (isBlank(line)) {
      let k = i;
      while (k < end && isBlank(lines[k])) k++;
      if (k >= end) { i = k; break; }
      const nk = lines[k];
      const nlm = matchListMarker(nk);
      // A marker of the same list starts a new item after a blank
      // line when it is less indented than the item's content, or
      // when the current item is empty (an empty item cannot hold
      // further content past a blank line).
      if (nlm && sameList(nlm) && (indentOf(nk) < cur.contentIndent || !itemHasContent)) {
        blankBetweenItems = true;
        finishItem();
        cur = nlm;
        itemLines = [cur.content];
        itemHasContent = cur.content.trim() !== '';
        i = k + 1;
        continue;
      }
      // An empty item ends at a blank line: the following lines are
      // not part of it.
      if (!itemHasContent) break;
      if (indentOf(nk) >= cur.contentIndent) {
        while (i < k) { itemLines.push(''); i++; }
        continue;
      }
      break;
    }
    if (indentOf(line) >= cur.contentIndent) {
      const s = stripExpand(line, 0, 0, cur.contentIndent);
      itemLines.push(s);
      if (line.trim() !== '') itemHasContent = true;
      i++;
      continue;
    }
    if (matchThematic(line) && indentOf(line) < cur.contentIndent) break;
    const nlm = matchListMarker(line);
    if (nlm && sameList(nlm) && indentOf(line) < cur.contentIndent) {
      finishItem();
      cur = nlm;
      itemLines = [cur.content];
      itemHasContent = cur.content.trim() !== '';
      i++;
      continue;
    }
    if (nlm) break; // a different list starts; this one ends
    // A line inside an open fenced code block or HTML block belongs
    // to the item even when it is not indented to the content level:
    // only the closing fence / end marker / blank line ends it.
    if (openVerbatim(itemLines)) {
      itemLines.push(line);
      if (line.trim() !== '') itemHasContent = true;
      i++;
      continue;
    }
    // lazy paragraph continuation: the line joins the paragraph's
    // text directly, so it can never be re-read as a block start.
    // A lazy line that looks like a setext underline must not become
    // one, so it is folded into the previous line instead.
    if (itemLines.length > 0 && openParagraph(itemLines) && !interruptsParagraph(line)) {
      // A lazy line that starts a table (header + delimiter row) or
      // is the delimiter row of a table started by the previous
      // line stays its own line: marked's table rule reads the raw
      // lines, and a folded line can never be re-read as a table
      // header. The next line is read at the item's content level.
      const lstripped = indentOf(line) >= 4 ? stripKeep(line, 0, 0, 4) : line;
      let lnx = null;
      if (i + 1 < end) {
        const rawNx = lines[i + 1];
        lnx = indentOf(rawNx) >= cur.contentIndent ? stripExpand(rawNx, 0, 0, cur.contentIndent) : rawNx;
      }
      const lIsHeader = lnx !== null && isTableHeaderLine(lstripped, lnx) && !matchSetext(line);
      const lPrevLast = itemLines[itemLines.length - 1].split('\n').pop();
      const lIsDelim = tableDelimiterRow(lstripped) !== null && isTableHeaderLine(lPrevLast, lstripped);
      if (lIsHeader || lIsDelim) { itemLines.push(lstripped); i++; continue; }
      if (matchSetext(line) && !matchThematic(line) && !matchListMarker(line)) {
        itemLines[itemLines.length - 1] += '\n' + line;
      } else {
        itemLines[itemLines.length - 1] += '\n' + lstripped;
      }
      i++;
      continue;
    }
    break;
  }
  finishItem();
  // Looseness comes from the parsed content: the list is loose when
  // items are separated by blank lines, or when any item directly
  // contains two top-level blocks separated by a blank line. Blank
  // lines inside a nested list do not loosen the outer list.
  const subs = items.map((it, idx) => {
    let ls = it.lines;
    let checkbox = null;
    if (ls.length > 0) {
      const tm = ls[0].match(/^\[([ xX])\][ \t]+(.*)$/s) || ls[0].match(/^\[([ xX])\]$/);
      if (tm) {
        checkbox = tm[1] === ' ' ? '<input disabled="" type="checkbox">' : '<input checked="" disabled="" type="checkbox">';
        ls = ls.slice();
        ls[0] = tm[2] !== undefined ? tm[2] : '';
      }
    }
    return { sub: parseRange(ls, refs, idx === items.length - 1 && atEnd && i >= end, endsWithNL, true, st), checkbox };
  });
  const loose = blankBetweenItems || subs.some((s) => s.sub.loose);
  let out = '';
  if (first.type === 'bullet') out += '<ul>\n';
  else out += '<ol' + (first.start !== 1 ? ' start="' + first.start + '"' : '') + '>\n';
  for (let idx = 0; idx < items.length; idx++) {
    const { sub, checkbox } = subs[idx];
    let content = sub.blocks.map((b) => (loose ? b.html : b.tight)).join('');
    if (checkbox !== null) {
      if (!loose) content = checkbox + ' ' + content;
      else content = content.replace('<p>', '<p>' + checkbox + ' ');
    }
    out += '<li>' + content + '</li>\n';
  }
  out += first.type === 'bullet' ? '</ul>\n' : '</ol>\n';
  return { html: out, next: i };
}

// ---------------- entry point ----------------

export function parse(markdown) {
  const src = String(markdown).replace(/\r\n?/g, '\n');
  const lines = src.split('\n');
  // A trailing newline produces a final empty line that carries no
  // content; drop it so it cannot form a stray block.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  const endsWithNL = src.endsWith('\n');
  const refs = new Map();
  // First pass collects every link reference definition in the
  // document (definitions apply to links anywhere, even before them);
  // the second pass renders with the complete set. Each pass gets a
  // fresh inline state: an unclosed <a> tag suppresses extended
  // autolinks for the rest of the document, so the state is rebuilt
  // the same way on every pass. The first pass is collect-only
  // (parseInline is a no-op there), so it costs just the block walk.
  // A document with no '[' at all cannot hold a definition.
  if (src.includes('[')) {
    collectOnly = true;
    parseRange(lines, refs, true, endsWithNL, false, { inLink: false });
    collectOnly = false;
  }
  return parseRange(lines, refs, true, endsWithNL, false, { inLink: false }).html;
}
