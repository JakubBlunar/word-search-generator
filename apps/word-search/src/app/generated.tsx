'use client'

import styled from 'styled-components'
import { times, map, reduce, keys } from 'lodash'
import { useEffect, useState } from 'react'
import { wrap } from 'comlink'
import { Puzzle, getCharacter } from '../utils/puzzle'
import { useParams } from 'react-router-dom'

const StyledPage = styled.div`
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    html,
    body {
      width: 210mm;
      height: 297mm;
    }

    .page-break {
      page-break-after: always;
    }

    .word {
      background: white !important;
    }

    .words button {
      display: none;
    }

    td {
      background: white !important;
    }

    .solution {
      display: none;
    }
  }

  display: flex;
  justify-items: center;
  flex-direction: column;
  font-size: 30px;

  table {
    table-layout: fixed;
    width: 400px;
  }

  td {
    font-family: 'Roboto Mono', monospace;
    text-align: center;
    padding: 0 3px;
    line-height: 34px;
    width: 18px;
  }

  .words {
    margin: 0;
    margin-left: 50px;
    display: block;
    flex: 1 1 auto;
  }

  .word {
    display: inline-block;
    font-size: 26px;
  }

  .container {
    padding: 30px;
    padding-top: 33px;
    padding-bottom: 0;

    display: flex;
  }

  .solution {
    margin-top: 20px;
  }
`

const getRandomColor = () => {
  const o = Math.round,
    r = Math.random,
    s = 255
  return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ', 0.3)'
}

type Highlight = {
  words: Record<string, string>
  positions: Record<string, string>
}

const createHighlight = (puzzle: Puzzle): Highlight =>
  reduce(
    puzzle.wordsPositions,
    (acc, value, key) => {
      const color = getRandomColor()
      const word = key

      acc.words[word] = color

      value.forEach((position) => {
        acc.positions[`${position.x},${position.y}`] = color
      })

      return acc
    },
    { words: {}, positions: {} } as {
      words: Record<string, string>
      positions: Record<string, string>
    }
  )

type GeneratedPuzzleProps = {
  puzzle: Puzzle
  reload: () => void
  highlight: Highlight
}

const GeneratedPuzzle = ({
  puzzle,
  reload,
  highlight,
}: GeneratedPuzzleProps) => {
  const widths = times(puzzle.width, (x) => x)
  const heights = times(puzzle.height, (x) => x)

  const enableHighlight = true

  const words = keys(highlight.words).sort()
  return (
    <div className="container">
      <table>
        <tbody>
          {map(heights, (y) => (
            <tr key={y}>
              {map(widths, (x) => (
                <td
                  key={`${y}-${x}`}
                  style={
                    enableHighlight && highlight.positions[`${x},${y}`]
                      ? {
                          background: highlight.positions[`${x},${y}`],
                        }
                      : undefined
                  }
                >
                  {getCharacter(puzzle.grid, x, y, puzzle.width)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="words">
        {map(words, (word, i) => (
          <span
            key={word}
            className="word"
            style={{
              marginInlineStart: 7,
              background: enableHighlight ? highlight.words[word] : undefined,
            }}
          >
            {word}
            {i !== words.length - 1 ? ',' : ''}
          </span>
        ))}

        <div className="solution">
          {puzzle.solution}
          <button onClick={reload} style={{ marginInlineStart: 30 }}>
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}

const generatePuzzle = async (lang?: string) => {
  const worker = new Worker(
    /* webpackChunkName: "generator-worker" */ new URL(
      './generator-worker',
      import.meta.url
    )
  )

  const { generate } =
    wrap<import('./generator-worker').GeneratorWorkerType>(worker)

  const puzzle = await generate({
    diagonals: true,
    height: 9,
    width: 13,
    numberOfWords: 250,
    minLength: 3,
    maxLength: 6,
    effort: 70000,
    lang,
  })

  return {
    puzzle,
    highlight: createHighlight(puzzle),
  }
}

type GeneratedProps = {
  lang?: string
}

export const Generated = ({ lang }: GeneratedProps) => {
  const [puzzles, setPuzzles] = useState<
    { puzzle: Puzzle; highlight: Highlight }[]
  >([])

  const reload = (index: number) => async () => {
    const puzzle = await generatePuzzle(lang)

    setPuzzles((prev) => {
      const newPuzzles = [...prev]
      newPuzzles[index] = puzzle
      return newPuzzles
    })
  }

  useEffect(() => {
    const promises = times(48, () => generatePuzzle(lang))
    Promise.all(promises).then((generated) => {
      setPuzzles(generated)
      setTimeout(() => window.print(), 2000)
    })
  }, [])

  if (!puzzles.length) return <div>Generating</div>

  return (
    <StyledPage>
      {map(puzzles, (config, index) => (
        <div key={index}>
          <GeneratedPuzzle
            puzzle={config.puzzle}
            highlight={config.highlight}
            reload={reload(index)}
          />
          {index % 3 === 2 && <div className="page-break" />}
        </div>
      ))}
    </StyledPage>
  )
}
