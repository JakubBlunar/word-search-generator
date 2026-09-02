'use client'

import { useMemo } from 'react'
import type { PuzzleData } from '../lib/types'
import type { Highlight } from '../lib/highlight'

type PuzzleViewProps = {
  puzzle: PuzzleData
  highlight: Highlight
}

export const PuzzleView = ({
  puzzle,
  highlight,
}: PuzzleViewProps) => {
  const words = useMemo(() => Object.keys(highlight.words).sort(), [highlight])
  const widths = useMemo(
    () => Array.from({ length: puzzle.width }, (_, x) => x),
    [puzzle.width],
  )
  const heights = useMemo(
    () => Array.from({ length: puzzle.height }, (_, y) => y),
    [puzzle.height],
  )

  return (
    <div className="puzzle-container">
      <table className="puzzle-table">
        <tbody>
          {heights.map((y) => (
            <tr key={y}>
              {widths.map((x) => {
                const bg = highlight.positions[`${x},${y}`]
                return (
                  <td key={`${y}-${x}`} style={bg ? { background: bg } : undefined}>
                    {puzzle.grid[y * puzzle.width + x]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="puzzle-words">
        {words.map((word, i) => (
          <span
            key={word}
            className="word"
            style={{
              marginInlineStart: 7,
              background: highlight.words[word],
            }}
          >
            {word}
            {i !== words.length - 1 ? ',' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
