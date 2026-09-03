// Generate word data JSON files under ./data (server-side only — not
// exposed to the browser). Output shape: { words: string[], count, lengths }
// Usage: npm run words
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'data')

const sources = [
  { name: 'sk', file: 'tools/pmena.txt' },
  { name: 'cz', file: 'tools/ceske_slova.txt' },
  // English uses a huge "everything" list; keep only words that also appear
  // in a curated common-words list so obscure entries are dropped and the
  // generation pool stays small and high quality (faster + better puzzles).
  { name: 'en', file: 'tools/en_words.txt', commonFile: 'tools/en_common_words.txt' },
]

mkdirSync(outDir, { recursive: true })

function readCommonWords(file) {
  return new Set(
    readFileSync(join(root, file), 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim().toUpperCase())
      .filter(Boolean),
  )
}

for (const { name, file, commonFile } of sources) {
  let words = readFileSync(join(root, file), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim().toUpperCase())
    .filter((word) => /^[A-ZČĎĹĽŇŠŤŽA-Z]{2,}$/.test(word))

  let before = words.length
  if (commonFile) {
    const common = readCommonWords(commonFile)
    words = words.filter((w) => common.has(w))
  }

  const lengths = {}
  for (const word of words) {
    ;(lengths[word.length] ??= []).push(word)
  }

  const out = join(outDir, `words_${name}.json`)
  writeFileSync(out, JSON.stringify({ words, count: words.length, lengths }))
  const size = `${(Buffer.byteLength(words.join(',')) / 1024 / 1024).toFixed(1)} MB raw`
  const note =
    before !== words.length ? ` (filtered from ${before} by common-words list)` : ''
  console.log(`${out}: ${words.length} words (${size})${note}`)
}
