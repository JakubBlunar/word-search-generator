export type WordPositions = Record<string, { x: number; y: number }[]>

export class Puzzle {
  readonly width: number
  readonly height: number
  readonly grid: string[]
  readonly words: string[]
  readonly wordsPositions: WordPositions
  readonly solution: string

  constructor(
    width: number,
    height: number,
    grid: string[],
    words: string[],
    positions: WordPositions,
    solution: string
  ) {
    this.width = width
    this.height = height
    this.grid = grid
    this.words = words
    this.wordsPositions = positions
    this.solution = solution
  }
}

export const getCharacter = (
  grid: string[],
  x: number,
  y: number,
  width: number
) => {
  return grid[y * width + x]
}

export const puzzleToString = (puzzle: Puzzle) => {
  let result = ''
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      result += getCharacter(puzzle.grid, x, y, puzzle.width) + ' '
    }
    result += '\n'
  }
  return result
}
