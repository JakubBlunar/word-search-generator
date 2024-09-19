import wordsJson from './words.json'
import wordsJsonCz from './words_cz.json'
import _ from 'lodash'
import { Puzzle, WordPositions } from './puzzle'

type Options = {
  words?: string[]
  diagonals?: boolean
  minLength?: number
  maxLength?: number
  width: number
  height: number
  numberOfWords?: number
  effort?: number
  lang?: string
}

function getRandomElementsFromArray(arr: string[], n: number) {
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

export async function generateSinglePuzzle(options: Options): Promise<Puzzle> {
  const wordsList = options.lang === 'cz' ? wordsJsonCz : wordsJson
  if (!options.words) {
    options.words = getRandomElementsFromArray(
      wordsList.words,
      options.numberOfWords || 20
    )
  }
  if (!options.diagonals) options.diagonals = true
  if (!options.minLength) options.minLength = 3
  if (!options.maxLength || options.maxLength < options.minLength)
    options.maxLength = options.minLength
  if (!options.effort) options.effort = 40000

  const words = options.words.filter(
    (w) =>
      w.length >= (options.minLength || 0) &&
      (options.maxLength == null || w.length <= options.maxLength)
  )

  const { width, height, diagonals, effort } = options

  const grid: string[] = _.times(width * height, () => ' ')
  const used: string[] = []
  const generatedWords: WordPositions = {}
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
    word: string
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
    word: string
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

  let solution = ''
  let solutionString = ''

  const firstSolutionWordLength = empty > 12 ? rand(empty - 6) + 6 : empty

  if (firstSolutionWordLength >= 3 && firstSolutionWordLength < 20) {
    if (empty > firstSolutionWordLength) {
      let firstLength = empty - firstSolutionWordLength
      if (firstLength < 3) firstLength = 3
      const secondLength = empty - firstLength

      const firstWords = _.get(wordsList.lengths, `${firstLength}`, '')
      const secondWords = _.get(wordsList.lengths, `${secondLength}`, '')

      const firstSolutionWord = firstWords[rand(firstWords.length)]
      const secondSolutionWord = secondWords[rand(secondWords.length)]

      solution = `${firstSolutionWord}${secondSolutionWord}`

      solutionString = `${firstSolutionWord}, ${secondSolutionWord}`
    } else {
      const solutionWords = _.get(wordsList.lengths, `${empty}`, '')
      const solutionWord = solutionWords[rand(solutionWords.length)]
      solution = solutionWord
      solutionString = solutionWord
    }
  }

  if (solution) {
    let index = 0
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === ' ') {
        grid[i] = solution[index]
        index++
      }
    }
  }

  return new Puzzle(width, height, grid, used, generatedWords, solutionString)
}

export async function generate(options: Options) {
  let puzzle
  do {
    puzzle = await generateSinglePuzzle(options)
  } while (!puzzle.solution)

  return puzzle
}
