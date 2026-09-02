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
  page_s: 'page',
  page_p: 'pages',
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
  badge: 'Generátor tlačitelných hádaniek',
  h1a: 'Nájdi slová',
  h1b: 'v tlačiteľnej osemsmerovke.',
  intro:
    'Vyberte jazyk, počet strán a získajte tlačenú A4 — tri hádanky na stranu, bez neporiadku na papieri.',
  start: 'Vygenerovať osemsmerovku',
  free: 'Zdarma · bez účtu · tlačí sa lokálne v prehliadači',
  feat1_title: 'Tri jazyky',
  feat1_desc:
    'Slovenské, české a anglické zoznamy slov — 370 000 anglických slov.',
  feat2_title: 'Pripravené na A4',
  feat2_desc:
    'Každá strana má tri hádanky. Stlačte tlač a strany vyjdú presne podľa rozloženia.',
  feat3_title: 'Skryté riešenie',
  feat3_desc:
    'Každá hádanka skrýva jedno bonusové slovo. Odpoveď ostáva mimo tlačených strán.',
  footer: 'Hľadanie slov — generované pre vás, tlačené na vašom tlačisku.',
  configureLink: 'Nastaviť →',
  step: 'Krok 1 z 2 · Nastavenie',
  cfg_title: 'Nastavte tlačovú sériu',
  cfg_note: 'Každá A4 strana obsahuje {n} {p}.',
  language: 'Jazyk',
  pages: 'Strany',
  page_s: 'strana',
  page_p: 'strany',
  puzzle_s: 'osemsmerovka',
  puzzle_p: 'osemsmerovky',
  word_length: 'Dĺžka slov',
  letters: 'písmen',
  min: 'Min',
  max: 'Max',
  directions: 'Smerovanie',
  allow_diagonals: 'Povoliť diagonály',
  directions_desc: 'Bez diagonál sa umiestňujú iba vodorovné a zvislé slová.',
  back: '← Späť',
  generate_cta: 'Generovať {n} {p} →',
  gen_toolbar: '{lang} · {n} {puzzles} · {m} {pages}',
  gen_status_busy: 'Generujem…',
  gen_ready: 'Pripravené na tlač',
  new_settings: '← Nové nastavenia',
  print: 'Tlačiť',
  generating_pct: 'Generujem {done}/{total}…',
  tip: 'Tip: na tlačené strane sú skryté bonusové slovo a farebné zdôraznenia. ↻ regeneruje jednu hádanku.',
  bonus_word: 'bonusové slovo',
  regenerating: 'sa regeneruje…',
  regenerate: '↻ Nová osemsmerovka',
  retry: '↻ Skúsiť znova',
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
  generatePuzzles: 'Vygenerovat osmisměrku',
  badge: 'Generátor tisknutelných hádanek',
  h1a: 'Najdi slova',
  h1b: 'v tiskové osmisměrce.',
  intro:
    'Vyberte jazyk, počet stran a získejte tiskovou A4 — tři hádanky na stranu, bez nepořádku na papíře.',
  start: 'Vygenerovat osmisměrku',
  free: 'Zdarma · bez účtu · tiskne se lokálně v prohlížeči',
  feat1_title: 'Tři jazyky',
  feat1_desc:
    'Slovenské, české a anglické seznamy slov — 370 000 anglických slov.',
  feat2_title: 'Připravené na A4',
  feat2_desc:
    'Každá strana obsahuje tři hádanky. Stiskněte tisk a strany vyjdou přesně podle rozložení.',
  feat3_title: 'Skryté řešení',
  feat3_desc:
    'Každá hádanka skrývá jedno bonusové slovo. Odpověď zůstává mimo tisknuté strany.',
  footer: 'Hledání slov — generované pro vás, tištěné na vašem tisku.',
  configureLink: 'Nastavit →',
  step: 'Krok 1 z 2 · Nastavení',
  cfg_title: 'Nastavte tiskovou sérii',
  cfg_note: 'Každá A4 strana obsahuje {n} {p}.',
  language: 'Jazyk',
  pages: 'Strany',
  page_s: 'strana',
  page_p: 'strany',
  puzzle_s: 'osmisměrka',
  puzzle_p: 'osmisměrek',
  word_length: 'Délka slov',
  letters: 'písmen',
  min: 'Min',
  max: 'Max',
  directions: 'Směrování',
  allow_diagonals: 'Povolit diagonály',
  directions_desc: 'Bez diagonál se umísťují pouze vodorovná a svislá slova.',
  back: '← Zpět',
  generate_cta: 'Generovat {n} {p} →',
  gen_toolbar: '{lang} · {n} {puzzles} · {m} {pages}',
  gen_status_busy: 'Generuji…',
  gen_ready: 'Připraveno k tisku',
  new_settings: '← Nová nastavení',
  print: 'Tisknout',
  generating_pct: 'Generuji {done}/{total}…',
  tip: 'Tip: na tiskové straně jsou skrytá bonusová slova a barevná zdůraznění. ↻ regeneruje jednu hádanku.',
  bonus_word: 'bonusové slovo',
  regenerating: 'se regeneruje…',
  regenerate: '↻ Nová osmisměrka',
  retry: '↻ Zkusit znovu',
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
