export const UI_LANGS = ['en', 'sk', 'cz'] as const
export type UILang = (typeof UI_LANGS)[number]

/**
 * Detect the UI language from the browser.
 * Slovak → sk, Czech → cz, everything else → en.
 * Returns 'en' on the server (no navigator).
 */
export function detectUILang(): UILang {
  if (typeof navigator === 'undefined') return 'en'
  const raw =
    navigator.language ||
    (typeof navigator.languages === 'object' && navigator.languages?.[0]) ||
    'en'
  const primary = raw.toLowerCase().split('-')[0] ?? 'en'
  if (primary === 'sk') return 'sk'
  if (primary === 'cs' || primary === 'cz') return 'cz'
  return 'en'
}

type Dict = Record<string, string>

const en: Dict = {
  brand: 'Word Search',
  // canonical copywriting
  word_search: 'Word Search',
  word_search_puzzle: 'Word Search Puzzle',
  find_the_words: 'Find the words',
  words_to_find: 'Words to find',
  generate_puzzle: 'Generate puzzle',
  solution: 'Solution',
  new_puzzle: 'New puzzle',
  solution_of: 'Solution of',
  // home
  generatePuzzles: 'Generate puzzle',
  demo_caption: 'Live demo — a puzzle being solved',
  badge: 'Printable puzzle generator',
  h1a: 'Find the words',
  h1b: 'in a printable puzzle.',
  intro:
    'Pick a language, choose how many pages you need, and get a print-ready A4 sheet — three puzzles per page, no clutter on the paper.',
  start: 'Generate puzzle',
  free: 'Free · no account · prints locally in your browser',
  feat1_title: 'Three languages',
  feat1_desc:
    'Slovak, Czech and English word lists — 370,000 English words included.',
  feat2_title: 'Ready for A4 print',
  feat2_desc:
    'Every page holds three puzzles. Press print and your pages come out exactly as laid out.',
  feat3_title: 'Bonus solution word',
  feat3_desc:
    'Each puzzle hides one bonus word in the grid. The answer key stays off the printed page.',
  footer: 'Word Search — generated for you, printed on your printer.',
  configureLink: 'Configure →',
  // configure
  step: 'Step 1 of 2 · Configure',
  cfg_title: 'Configure your print run',
  cfg_note: 'Each A4 page contains {n} {p}.',
  language: 'Language',
  pages: 'Pages',
  page_one: 'page',
  page_interval: 'pages',
  page_other: 'pages',
  puzzle_s: 'puzzle',
  puzzle_p: 'puzzles',
  word_length: 'Word length',
  letters: 'letters',
  min: 'Min',
  max: 'Max',
  directions: 'Directions',
  allow_diagonals: 'Allow diagonals',
  directions_desc:
    'Without diagonals only horizontal and vertical words are placed.',
  back: '← Back',
  generate_cta: 'Vygenerovať {n} {p} →',
  // generate
  gen_toolbar: '{lang} · {n} {puzzles} · {m} {pages}',
  gen_status_busy: 'Generating…',
  gen_ready: 'Ready to print',
  new_settings: '← New settings',
  print: 'Print',
  generating_pct: 'Generating {done}/{total}…',
  tip: 'Tip: the printed page hides the solution and color highlights. ↻ generates a new puzzle.',
  bonus_word: 'bonus word',
  regenerating: 'regenerating…',
  regenerate: '↻ New puzzle',
  retry: '↻ Retry',
  // language names (word list)
  lang_sk: 'Slovak',
  lang_cz: 'Czech',
  lang_en: 'English',
}

const sk: Dict = {
  brand: 'Osemsmerovka',
  // canonical copywriting
  word_search: 'Osemsmerovka',
  word_search_puzzle: 'Osemsmerovka',
  find_the_words: 'Nájdi slová',
  words_to_find: 'Slová na nájdenie',
  generate_puzzle: 'Vygenerovať osemsmerovku',
  solution: 'Riešenie',
  new_puzzle: 'Nová osemsmerovka',
  solution_of: 'Riešenie osemsmerovky',
  generatePuzzles: 'Vygenerovať osemsmerovku',
  demo_caption: 'Naživo — riešiaca sa osemsmerovka',
  badge: 'Generátor tlačiteľných osemsmeroviek',
  h1a: 'Osemsmerovky',
  h1b: 'pripravené na tlač.',
  intro:
    'Vyberte jazyk, počet strán a získajte tlačiteľnú A4 — tri osemsmerovky na stranu, bez neporiadku na papieri.',
  start: 'Vygenerovať osemsmerovku',
  free: 'Zdarma · bez účtu · tlačí sa lokálne v prehliadači',
  feat1_title: 'Tri jazyky',
  feat1_desc:
    'Slovenské, české a anglické zoznamy slov — 370 000 anglických slov.',
  feat2_title: 'Pripravené na A4',
  feat2_desc:
    'Každá strana obsahuje tri osemsmerovky. Stlačte tlač a strany vyjdú presne podľa rozloženia.',
  feat3_title: 'Bonusové riešenie',
  feat3_desc:
    'Každá osemsmerovka skrýva jedno bonusové slovo. Odpoveď ostáva mimo tlačených strán.',
  footer: 'Osemsmerovky — generované pre vás, tlačené na vašej tlačiarni.',
  configureLink: 'Nastaviť →',
  // configure
  step: 'Krok 1 z 2 · Nastavenie',
  cfg_title: 'Nastavte tlačovú sériu',
  cfg_note: 'Každá A4 strana obsahuje {n} {p}.',
  language: 'Jazyk',
  pages: 'Strany',
  page_one: 'strana',
  page_interval: 'strany',
  page_other: 'strán',
  puzzle_one: 'osemsmerovka',
  puzzle_interval: 'osemsmerovky',
  puzzle_other: 'osemsmeroviek',
  word_length: 'Dĺžka slov',
  letters: 'písmen',
  min: 'Min',
  max: 'Max',
  directions: 'Smerovanie',
  allow_diagonals: 'Povoliť diagonály',
  directions_desc:
    'Bez diagonál sa umiestňujú iba vodorovné a zvislé slová.',
  back: '← Späť',
  generate_cta: 'Generovať →',
  // generate
  gen_toolbar: '{lang} · {n} {puzzles} · {m} {pages}',
  gen_status_busy: 'Generujem…',
  gen_ready: 'Pripravené na tlač',
  new_settings: '← Nové nastavenia',
  print: 'Tlačiť',
  generating_pct: 'Generujem {done}/{total}…',
  tip: 'Tip: na tlačenej strane sú skryté bonusové slovo a farebné zvýraznenia. ↻ vygeneruje novú osemsmerovku.',
  bonus_word: 'bonusové slovo',
  regenerating: 'Načítava sa…',
  regenerate: '↻ Nová osemsmerovka',
  retry: '↻ Skúsiť znova',
  // language names (word list)
  lang_sk: 'Slovenčina',
  lang_cz: 'Čeština',
  lang_en: 'Angličtina',
}

const cz: Dict = {
  brand: 'Osmisměrka',
  // canonical copywriting
  word_search: 'Osmisměrka',
  word_search_puzzle: 'Osmisměrka',
  find_the_words: 'Najdi slova',
  words_to_find: 'Slova k nalezení',
  generate_puzzle: 'Vygenerovat osmisměrku',
  solution: 'Řešení',
  new_puzzle: 'Nová osmisměrka',
  solution_of: 'Řešení osmisměrky',
  demo_caption: 'Živá ukázka — osmisměrka se řeší',
  generatePuzzles: 'Vygenerovat osmisměrku',
  badge: 'Generátor tisknutelných osmisměrek',
  h1a: 'Osmisměrky',
  h1b: 'připravené k tisku.',
  intro:
    'Vyberte jazyk, počet stran a získejte tiskovou A4 — tři osmisměrky na stranu, bez nepořádku na papíře.',
  start: 'Vygenerovat osmisměrku',
  free: 'Zdarma · bez účtu · tiskne se lokálně v prohlížeči',
  feat1_title: 'Tři jazyky',
  feat1_desc:
    'Slovenské, české a anglické seznamy slov — 370 000 anglických slov.',
  feat2_title: 'Připravené na A4',
  feat2_desc:
    'Každá strana obsahuje tři osmisměrky. Stiskněte tisk a strany vyjdou přesně podle rozložení.',
  feat3_title: 'Bonusové řešení',
  feat3_desc:
    'Každá osmisměrka skrývá jedno bonusové slovo. Odpověď zůstává mimo tištěné strany.',
  footer: 'Osmisměrky — vygenerované pro vás, vytištěné na vaší tiskárně.',
  configureLink: 'Nastavit →',
  // configure
  step: 'Krok 1 ze 2 · Nastavení',
  cfg_title: 'Nastavte tiskovou sérii',
  cfg_note: 'Každá strana A4 obsahuje {n} {p}.',
  language: 'Jazyk',
  pages: 'Strany',
  page_one: 'strana',
  page_interval: 'strany',
  page_other: 'stran',
  puzzle_one: 'osmisměrka',
  puzzle_interval: 'osmisměrky',
  puzzle_other: 'osmisměrek',
  word_length: 'Délka slov',
  letters: 'písmen',
  min: 'Min',
  max: 'Max',
  directions: 'Směry',
  allow_diagonals: 'Povolit diagonály',
  directions_desc:
    'Bez diagonál se umísťují pouze vodorovná a svislá slova.',
  back: '← Zpět',
  generate_cta: 'Vygenerovat →',
  // generate
  gen_toolbar: '{lang} · {n} {puzzles} · {m} {pages}',
  gen_status_busy: 'Generuji…',
  gen_ready: 'Připraveno k tisku',
  new_settings: '← Nové nastavení',
  print: 'Tisknout',
  generating_pct: 'Generuji {done}/{total}…',
  tip: 'Tip: na tištěné straně jsou skryté bonusové slovo a barevná zvýraznění. ↻ vygeneruje novou osmisměrku.',
  bonus_word: 'bonusové slovo',
  regenerating: 'Načíta se…',
  regenerate: '↻ Nová osmisměrka',
  retry: '↻ Zkusit znovu',
  // language names (word list)
  lang_sk: 'Slovenština',
  lang_cz: 'Čeština',
  lang_en: 'Angličtina',
}



export const DICTS: Record<UILang, Dict> = { en, sk, cz }

/** Translate a key, falling back to English then the key itself. */
export function translate(
  lang: UILang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let s = DICTS[lang]?.[key] ?? en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v))
    }
  }
  return s
}

/** Pick the singular or plural translation for a count. */
export function pick(lang: UILang, n: number, singular: string, plural: string) {
  return n === 1 ? translate(lang, singular) : translate(lang, plural)
}

/**
 * Pick the correct CLDR plural slot (`one` / `many` / `other`) for a count.
 * en: 1 → one, else other. sk: 1 → one, 2–4 → many, else other.
 * cz: 1 → one, 2–4 → many, else other.
 */
export function plural(
  lang: UILang,
  n: number,
  keys: { one: string; many?: string; other: string },
): string {
  if (lang === 'en') return translate(lang, n === 1 ? keys.one : keys.other)
  if (lang === 'sk' || lang === 'cz') {
    if (n === 1) return translate(lang, keys.one)
    if (n >= 2 && n <= 4) {
      const k = keys.many ?? keys.other
      return translate(lang, k)
    }
    return translate(lang, keys.other)
  }
  return translate(lang, keys.other)
}
