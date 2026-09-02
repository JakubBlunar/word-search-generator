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

// Deterministic colors so a given puzzle keeps the same colors across re-renders.
export const createHighlight = (puzzle: PuzzleData): Highlight => {
  let seed = 42
  for (const c of puzzle.words.join('|'))
    seed = (seed * 31 + c.charCodeAt(0)) | 0
  const rand = getPseudoRandom(Math.abs(seed))

  const words: Record<string, string> = {}
  const positions: Record<string, string> = {}

  for (const [word, path] of Object.entries(puzzle.wordsPositions)) {
    const color = `rgba(${Math.round(rand() * 255)}, ${Math.round(rand() * 255)}, ${Math.round(
      rand() * 255,
    )}, 0.3)`
    words[word] = color
    for (const position of path) {
      positions[`${position.x},${position.y}`] = color
    }
  }
  return { words, positions }
}
