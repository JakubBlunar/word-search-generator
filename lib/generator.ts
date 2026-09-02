import type { GenerationOptions, PuzzleData } from './types'

type WordBank = {
  words: string[]
  count: number
  lengths: Record<string, string[]>
}

function getRandomElementsFromArray(arr: string[], n: number): string[] {
  const result: string[] = []
  const len = arr.length
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available')

  while (n--) {
    const x = Math.floor(Math.random() * len)
    const word = arr[x]

    if (result.includes(word)) {
      continue
    }

    result.push(word)
  }
  return result
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
  const effort = options.effort || 40000

  const requested = options.numberOfWords ?? 20

  // Pick from the length-filtered pool so a valid sample is guaranteed
  // (the original sampled first, filtered second, and randomly came up empty).
  let pool = bank.words.filter(
    (w) => w.length >= minLength && w.length <= maxLength,
  )
  if (pool.length === 0) pool = bank.words.filter((w) => w.length >= minLength)
  if (pool.length === 0) pool = bank.words

  // Lowercase + dedupe (the English list is uppercase with case variants).
  const words = getRandomElementsFromArray(
    pool,
    Math.min(requested, pool.length),
  )
    .map((w) => w.toLowerCase())
    .filter((w, i, arr) => arr.indexOf(w) === i)

  if (words.length === 0) {
    throw new RangeError('no candidate words left after filtering')
  }

  const { width, height } = options

  const grid: string[] = Array.from({ length: width * height }, () => ' ')
  const used: string[] = []
  const generatedWords: PuzzleData['wordsPositions'] = {}
  const usedMap: Record<string, boolean> = {}

  let dxs: number[]
  let dys: number[]
  if (diagonals) {
    dxs = [0, 1, 1, 1, 0, -1, -1, -1, -1, 1, 1, -1]
    dys = [-1, -1, 0, 1, 1, 1, 0, -1, -1, 1, 1, -1]
  } else {
    dxs = [0, 1, 0, -1]
    dys = [-1, 0, 1, 0]
  }

  const rand = (max: number) => Math.floor(Math.random() * max)
  const get = (x: number, y: number) => grid[y * width + x]
  const set = (x: number, y: number, letter: string) => {
    grid[y * width + x] = letter
  }

  const tryWord = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    word: string,
  ) => {
    let ok = false
    for (let i = 0; i < word.length; i++) {
      const l = word[i]
      if (x < 0 || y < 0 || x >= width || y >= height) return false
      const cur = get(x, y)
      if (cur !== ' ' && cur !== l) return false
      if (cur === ' ') ok = true
      x += dx
      y += dy
    }
    return ok
  }

  const putWord = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    word: string,
  ) => {
    generatedWords[word] = []
    for (let i = 0; i < word.length; i++) {
      const l = word[i]
      set(x, y, l)
      generatedWords[word].push({ x, y })
      x += dx
      y += dy
    }
    used.push(word)
    usedMap[word] = true
  }

  for (let i = 0; i < width * height * effort; i++) {
    if (used.length === words.length) break
    const word = words[rand(words.length)]
    if (usedMap[word]) continue
    const x = rand(width)
    const y = rand(height)
    const d = rand(dxs.length)
    const dx = dxs[d]
    const dy = dys[d]
    if (tryWord(x, y, dx, dy, word)) putWord(x, y, dx, dy, word)
  }

  const empty = grid.reduce((t, c) => t + (c === ' ' ? 1 : 0), 0)

  // Fill the leftover cells with one or two random bank words; that string is
  // the "solution" the player must find. Safe fallback when the bank has no
  // word of the exact length (original silently crashed in that case).
  let solution = ''
  let solutionString = ''

  const bankWordsOfLength = (len: number): string[] | undefined =>
    bank.lengths[`${len}`]

  const firstSolutionWordLength =
    empty > 0 && empty <= 12 ? empty : rand(Math.max(empty - 6, 1)) + 6

  if (firstSolutionWordLength >= 3 && firstSolutionWordLength < 20) {
    if (empty > firstSolutionWordLength) {
      let firstLength = empty - firstSolutionWordLength
      if (firstLength < 3) firstLength = 3
      const secondLength = empty - firstLength

      const firstWords = bankWordsOfLength(firstLength)
      const secondWords = bankWordsOfLength(secondLength)

      if (firstWords && secondWords) {
        const firstSolutionWord = firstWords[rand(firstWords.length)]
        const secondSolutionWord = secondWords[rand(secondWords.length)]

        solution = `${firstSolutionWord}${secondSolutionWord}`
        solutionString = `${firstSolutionWord}, ${secondSolutionWord}`
      }
    } else {
      const solutionWords = bankWordsOfLength(empty)
      if (solutionWords && solutionWords.length > 0) {
        const solutionWord = solutionWords[rand(solutionWords.length)]
        solution = solutionWord
        solutionString = solutionWord
      }
    }
  }

  if (solution) {
    solution = solution.toLowerCase()
    solutionString = solutionString.toLowerCase()
    let index = 0
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === ' ') {
        grid[i] = solution[index]
        index++
      }
    }
  }

  return {
    width,
    height,
    grid,
    words: used,
    wordsPositions: generatedWords,
    solution: solutionString,
  }
}

export function generate(
  bank: WordBank,
  options: GenerationOptions,
): PuzzleData {
  for (let attempt = 0; attempt < 25; attempt++) {
    const puzzle = generateSinglePuzzle(bank, options)
    if (puzzle.solution) return puzzle
  }
  throw new Error('could not generate a puzzle with a solution')
}
