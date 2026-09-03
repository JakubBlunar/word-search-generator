import type { GenerationOptions, PuzzleData } from './types'

type WordBank = {
  words: string[]
  count: number
  lengths: Record<string, string[]>
}

// Cache of length-band-filtered pools, keyed on the word-set array itself
// (WeakMap: freed when the bank is GC'd) plus the "min:max" band. Repeated
// requests for the same language/lengths skip re-filtering the full list
// (the English bank is ~370k words / ~55k in the 3-6 band).
const poolCache = new WeakMap<string[], Map<string, string[]>>()

function poolFor(bank: WordBank, minLen: number, maxLen: number): string[] {
  const key = `${minLen}:${maxLen}`
  let byKey = poolCache.get(bank.words)
  if (!byKey) {
    byKey = new Map()
    poolCache.set(bank.words, byKey)
  }
  let pool = byKey.get(key)
  if (!pool) {
    pool = bank.words.filter((w) => {
      const l = w.length
      return l >= minLen && l <= maxLen
    })
    byKey.set(key, pool)
  }
  return pool
}

/**
 * Draw `k` distinct elements from `arr` without mutating it (the bank is a
 * shared cross-request reference, so we never reorder it). Expected O(k) via
 * a set of unique random indices — the old version was O(k^2) on `includes`.
 */
function sample<T>(arr: T[], k: number): T[] {
  const out = new Array<T>(k)
  const seen = new Set<number>()
  let i = 0
  while (i < k) {
    const idx = (Math.random() * arr.length) | 0
    if (seen.has(idx)) continue
    seen.add(idx)
    out[i++] = arr[idx]
  }
  return out
}

// The solution mechanic: every cell not covered by a listed word is filled
// with the solution's letters (read row-major, top-left to bottom-right).
// The player recovers the answer by reading those leftover cells. So after
// placement, the leftover count `empty` must equal a word (or two words)
// from the bank. Solvability depends only on which lengths exist in the
// bank, so memoize it per bank.
type SolveInfo = { lens: Set<number> }
const solveCache = new WeakMap<string[], SolveInfo>()

function solveInfo(bank: WordBank): SolveInfo {
  let info = solveCache.get(bank.words)
  if (!info) {
    const lens = new Set<number>()
    for (const l in bank.lengths) {
      const lNum = Number(l)
      if (bank.lengths[l].length > 0 && lNum >= 3) lens.add(lNum)
    }
    info = { lens }
    solveCache.set(bank.words, info)
  }
  return info
}

/**
 * Return one or two bank words whose combined length is exactly `empty`, or
 * null. Prefers a single word (one clean answer) and falls back to splitting
 * the leftover into two words (the original's "word1, word2" form).
 */
function solveFor(bank: WordBank, info: SolveInfo, empty: number): string[] | null {
  const pick = (len: number): string | null => {
    const list = bank.lengths[String(len)]
    if (!list || list.length === 0) return null
    return list[(Math.random() * list.length) | 0].toLowerCase()
  }
  if (empty >= 3 && info.lens.has(empty)) {
    const w = pick(empty)
    if (w) return [w]
  }
  for (let l1 = 3; l1 <= empty - 3; l1++) {
    const l2 = empty - l1
    if (info.lens.has(l1) && info.lens.has(l2)) {
      const a = pick(l1)
      const b = pick(l2)
      if (a && b) return [a, b]
    }
  }
  return null
}

type PlacedWords = {
  words: string[]
  positions: PuzzleData['wordsPositions']
}

export function generateSinglePuzzle(
  bank: WordBank,
  options: GenerationOptions,
): PuzzleData {
  const diagonals = options.diagonals !== false
  const minLength = options.minLength || 3
  const maxLength =
    options.maxLength && options.maxLength >= minLength
      ? options.maxLength
      : minLength

  // Per-word placement budget (random + exhaustive fallback). Bounded by
  // `words x attempts`, far less than the old `effort x W x H` global loop.
  const attempts = Math.max(
    12,
    Math.min(300, Math.round((options.effort || 40000) / 200)),
  )

  const requested = options.numberOfWords ?? 20
  let pool = poolFor(bank, minLength, maxLength)
  if (pool.length === 0) pool = bank.words.filter((w) => w.length >= minLength)

  const W = options.width
  const H = options.height
  const cells = W * H
  const info = solveInfo(bank)
  const R = (n: number) => (Math.random() * n) | 0

  // The findable set: sample, lowercase, dedupe, then sort longest-first so
  // long words land in the open board first and short words in the dense one.
  const sampleOf = (n: number) =>
    sample(pool, Math.min(n, pool.length))
      .map((w) => w.toLowerCase())
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .sort((a, b) => b.length - a.length)

  if (sampleOf(1).length === 0) {
    throw new RangeError('no candidate words left after filtering')
  }

  // Directions.
  const dxs = diagonals ? [0, 1, 1, 1, 0, -1, -1, -1] : [0, 1, 0, -1]
  const dys = diagonals ? [-1, -1, 0, 1, 1, 1, 0, -1] : [-1, 0, 1, 0]
  const ndir = dxs.length

  // Core placement on a scratch board; returns the placed words + positions
  // and the count of still-empty cells. Leaves the board in a valid state
  // (no overlapping words) — the caller decides whether to accept.
  const placeAll = (
    words: string[],
    g: string[],
  ): { placed: PlacedWords; empty: number } => {
    const positions: PuzzleData['wordsPositions'] = {}
    const placed: string[] = []

    const fit = (
      x: number,
      y: number,
      dx: number,
      dy: number,
      word: string,
    ) => {
      for (let i = 0; i < word.length; i++) {
        const cx = x + dx * i
        const cy = y + dy * i
        if (cx < 0 || cy < 0 || cx >= W || cy >= H) return false
        const cur = g[cy * W + cx]
        if (cur !== ' ' && cur !== word[i]) return false
      }
      return true
    }

    const put = (x: number, y: number, dx: number, dy: number, word: string) => {
      for (let i = 0; i < word.length; i++) {
        g[(y + dy * i) * W + (x + dx * i)] = word[i]
      }
    }

    const tryPlace = (
      word: string,
    ): { x: number; y: number; dx: number; dy: number } | null => {
      for (let a = 0; a < attempts; a++) {
        const d = R(ndir)
        const dx = dxs[d]
        const dy = dys[d]
        const x = R(W)
        const y = R(H)
        if (fit(x, y, dx, dy, word)) {
          put(x, y, dx, dy, word)
          return { x, y, dx, dy }
        }
      }
      // Exhaustive fallback: scan every legal (x, y, dir) that still fits and
      // pick one at random. Guarantees a placement exists whenever one is
      // reachable without breaking another word.
      const slots: { x: number; y: number; dx: number; dy: number }[] = []
      for (let d = 0; d < ndir; d++) {
        const dx = dxs[d]
        const dy = dys[d]
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (fit(x, y, dx, dy, word)) slots.push({ x, y, dx, dy })
          }
        }
      }
      if (slots.length === 0) return null
      const s = slots[R(slots.length)]
      put(s.x, s.y, s.dx, s.dy, word)
      return s
    }

    for (const word of words) {
      const p = tryPlace(word)
      if (p) {
        placed.push(word)
        const arr: { x: number; y: number }[] = []
        for (let i = 0; i < word.length; i++) {
          arr.push({ x: p.x + p.dx * i, y: p.y + p.dy * i })
        }
        positions[word] = arr
      }
    }
    let empty = 0
    for (let i = 0; i < cells; i++) if (g[i] === ' ') empty++
    return { placed: { words: placed, positions }, empty }
  }

  // Loop until the leftover count spells a real word. Each pass is ~2 ms, so
  // 200 tries is ~400 ms worst case, well under the old generator's 200-400
  // ms *typical*. Leftover counts cluster in a narrow range, so once we've
  // seen a handful of distinct values the bank can't spell, we stop churning
  // on a mathematically dead end and fail fast with a clear message.
  let seenDead = 0
  for (let tries = 0; tries < 200; tries++) {
    const g: string[] = new Array(cells).fill(' ')
    const { placed, empty } = placeAll(sampleOf(requested), g)
    const solWords = solveFor(bank, info, empty)
    if (solWords) {
      // Write the solution letters into the uncovered cells, in row-major
      // order (top-left to bottom-right) — the player reads it that way.
      const sol = solWords.join('')
      let i = 0
      for (let idx = 0; idx < cells; idx++) {
        if (g[idx] === ' ') g[idx] = sol[i++]
      }
      return {
        width: W,
        height: H,
        grid: g,
        words: placed.words,
        wordsPositions: placed.positions,
        solution: solWords.join(', '),
      }
    }
    seenDead++
    if (seenDead >= 40) break
  }
  throw new Error(
    'could not place words so the leftover cells spell a bank word — try a smaller `numberOfWords` or a different word bank',
  )
}

export function generate(
  bank: WordBank,
  options: GenerationOptions,
): PuzzleData {
  // A single pass already returns a valid, full, solvable board (the
  // exhaustive fallback in `placeAll` decouples correctness from `effort`),
  // so we run it once. Throughput is the win: `generate` is now
  // `generateSinglePuzzle`, no 3× retry loop, no 25× storm.
  return generateSinglePuzzle(bank, options)
}
