// Benchmark + correctness check for the word-search generator.
//   node tools/bench.mjs [lang]
// Measures ms per puzzle and VERIFIES the hard invariants of the mechanic:
//   1. every word in wordsPositions is spelled in order on its listed cells,
//   2. every grid cell is covered by a word OR is a leftover (no ' ' left),
//   3. the uncovered cells, read row-major, equal the solution letters joined.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { generate } from '../lib/generator.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const lang = process.argv[2] ?? 'cz'
const bank = JSON.parse(
  readFileSync(join(root, 'public', 'data', `words_${lang}.json`), 'utf8'),
)
const opts = {
  diagonals: true,
  height: 9,
  width: 13,
  numberOfWords: 250,
  minLength: 3,
  maxLength: 6,
  effort: 40000,
}
const W = opts.width, H = opts.height

const ROUNDS = 200
let totalMs = 0
let maxMs = 0
let failCoverage = 0   // leftover cells don't match the solution letters
let failWords = 0      // a listed word is not spelled in order on its positions
let failHoles = 0      // ' ' cells remain after generation (must be none)
let placementsTotal = 0
for (let i = 0; i < ROUNDS; i++) {
  const t = process.hrtime.bigint()
  let p
  try {
    p = generate(bank, opts)
  } catch (e) {
    console.log(`round ${i}: generator threw — ${e && e.message}`)
    failCoverage++
    continue
  }
  const ms = Number(process.hrtime.bigint() - t) / 1e6
  totalMs += ms
  maxMs = Math.max(maxMs, ms)
  placementsTotal += p.words.length

  // 1) Each listed word spells in order on its exact positions.
  let wordsBad = false
  for (const [w, pos] of Object.entries(p.wordsPositions)) {
    if (!pos || pos.length !== w.length) { wordsBad = true; continue }
    for (let k = 0; k < w.length; k++) {
      if (p.grid[pos[k].y * W + pos[k].x] !== w[k]) { wordsBad = true; break }
    }
  }
  if (wordsBad) failWords++

  // 2) No empty cells: every cell is part of a word or a leftover.
  if (p.grid.includes(' ')) failHoles++

  // 3) The core invariant: unread (non-word) cells, in row-major order,
  //    must spell the solution letters exactly.
  const covered = new Set()
  for (const pos of Object.values(p.wordsPositions)) {
    for (const c of pos) covered.add(c.y * W + c.x)
  }
  let leftover = ''
  for (let idx = 0; idx < W * H; idx++) {
    if (!covered.has(idx)) leftover += p.grid[idx]
  }
  const expected = p.solution
    .split(',').map((s) => s.trim()).filter(Boolean).join('')
  if (leftover.length !== expected.length || leftover !== expected) failCoverage++
}
const ok = failCoverage === 0 && failWords === 0 && failHoles === 0
console.log(
  `${lang}: rounds=${ROUNDS}  avgMs=${(totalMs / ROUNDS).toFixed(1)}  maxMs=${maxMs.toFixed(0)}  ` +
  `avgPlaced=${(placementsTotal / ROUNDS).toFixed(1)}/250  ` +
  `leftoverFails=${failCoverage}  wordFails=${failWords}  holeFails=${failHoles}`,
)
console.log(ok ? 'ALL INVARIANTS HOLD ✓' : 'INVARIANT VIOLATIONS ✗')
