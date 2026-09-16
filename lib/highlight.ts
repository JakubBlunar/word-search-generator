import type { PuzzleData } from './types'

export type Highlight = {
  words: Record<string, string>
  positions: Record<string, string>
}

const getPseudoRandom = (seed: number) => {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Curated muted palette — six distinct, calm tints that read as deliberate
// colour-coding instead of random pastels. Index assignment below is
// deterministic per puzzle, so a given board keeps the same colours across
// re-renders.
const PALETTE = [
  '#dbeafe', // blue
  '#d1fae5', // green
  '#fef3c7', // amber
  '#fce7f3', // pink
  '#e0e7ff', // indigo
  '#ffedd5', // orange
]

// Deterministic colours so a given puzzle keeps the same colours across re-renders.
export const createHighlight = (puzzle: PuzzleData): Highlight => {
  let seed = 42
  for (const c of puzzle.words.join('|'))
    seed = (seed * 31 + c.charCodeAt(0)) | 0
  const rand = getPseudoRandom(Math.abs(seed))

  const words: Record<string, string> = {}
  const positions: Record<string, string> = {}

  let colorIndex = Math.floor(rand() * PALETTE.length)
  for (const [word, path] of Object.entries(puzzle.wordsPositions)) {
    const color = PALETTE[colorIndex % PALETTE.length]
    colorIndex++
    words[word] = color
    for (const position of path) {
      positions[`${position.x},${position.y}`] = color
    }
  }
  return { words, positions }
}
