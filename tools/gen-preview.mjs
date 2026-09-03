// Generates one static preview puzzle per word bank for the homepage
// "watch it get solved" animation. Output lands in public/data so the
// page can fetch it instantly without hitting the generation API.
//   node tools/gen-preview.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { generateSinglePuzzle } from '../lib/generator2.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'data')
mkdirSync(outDir, { recursive: true })

// Same options the API route uses by default.
const opts = {
  diagonals: true,
  height: 9,
  width: 13,
  numberOfWords: 250,
  minLength: 3,
  maxLength: 6,
  effort: 40000,
}

for (const lang of ['cz', 'sk', 'en']) {
  const bank = JSON.parse(
    readFileSync(join(root, 'public', 'data', `words_${lang}.json`), 'utf8'),
  )
  const puzzle = generateSinglePuzzle(bank, opts)
  const file = join(outDir, `preview_${lang}.json`)
  writeFileSync(file, JSON.stringify(puzzle, null, 2) + '\n')
  console.log(
    `preview_${lang}: ${puzzle.words.length} words, solution "${puzzle.solution}"`,
  )
}
