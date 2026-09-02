export const LANGS = ['sk', 'cz', 'en'] as const
export type Lang = (typeof LANGS)[number]

export type WordPositions = Record<string, { x: number; y: number }[]>

export type GenerationOptions = {
  diagonals?: boolean
  height: number
  width: number
  numberOfWords?: number
  minLength?: number
  maxLength?: number
  effort?: number
}

export type PuzzleData = {
  width: number
  height: number
  grid: string[]
  words: string[]
  wordsPositions: WordPositions
  solution: string
}

// Worker protocol
export type GenerateRequest = {
  id: number
  lang: Lang
  options: GenerationOptions
}

export type WorkerResponse =
  | { id: number; ok: true; puzzle: PuzzleData }
  | { id: number; ok: false; error: string }
