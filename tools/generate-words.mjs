// Generate word data JSON files served from /public/data.
// Output shape: { words: string[], count: number, lengths: Record<string, string[]> }
// Usage: npm run words
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'data')

const sources = [
  { name: 'sk', file: 'tools/pmena.txt' },
  { name: 'cz', file: 'tools/ceske_slova.txt' },
  { name: 'en', file: 'tools/en_words.txt' },
]

mkdirSync(outDir, { recursive: true })

for (const { name, file } of sources) {
  const words = readFileSync(join(root, file), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim().toUpperCase())
    .filter((word) => /^[A-ZČĎĹĽŇŠŤŽA-Z]{2,}$/.test(word))

  const lengths = {}
  for (const word of words) {
    ;(lengths[word.length] ??= []).push(word)
  }

  const out = join(outDir, `words_${name}.json`)
  writeFileSync(out, JSON.stringify({ words, count: words.length, lengths }))
  console.log(
    `${out}: ${words.length} words (${(Buffer.byteLength(words.join(',')) / 1024 / 1024).toFixed(1)} MB raw)`,
  )
}
