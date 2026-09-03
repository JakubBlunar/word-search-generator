'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../app/i18n-provider'
import type { PuzzleData } from '../lib/types'

/**
 * Renders one puzzle as a live "being solved" demo:
 *  1. findable words are crossed out one by one with an animated pen stroke
 *     from the start cell to the end cell, in a random order;
 *  2. when everything is crossed, the scattered solution letters are circled
 *     in row-major order — how the puzzle is actually solved.
 *
 * The puzzle itself is pre-generated (see tools/gen-preview.mjs) so the page
 * is instant and costs no generation at render time.
 */

type Pt = { x: number; y: number }

type Step =
  | { kind: 'line'; key: string; d: string; word: string }
  | { kind: 'dot'; key: string; x: number; y: number }

const T_LINE = 700 // ms per crossed word
const T_DOT = 150 // ms per circled solution letter
const T_START = 650 // initial pause before solving starts

// ---------- geometry ----------

/**
 * Build an SVG path for a word laid out along a fixed direction. Consecutive
 * cells are unit neighbours in one of the 8 directions, so the stroke runs
 * straight from the first cell centre to the last cell centre.
 *
 * Cell coordinates in `wordsPositions` are 0-based indices; the visual
 * centre of cell (x, y) is at SVG point (x + 0.5, y + 0.5).
 */
function wordPath(cells: Pt[]): string {
  const a = cells[0]
  const b = cells[cells.length - 1]
  return `M ${(a.x + 0.5).toFixed(3)} ${(a.y + 0.5).toFixed(3)} L ${(b.x + 0.5).toFixed(3)} ${(b.y + 0.5).toFixed(3)}`
}

// ---------- choreography ----------

function buildSteps(puzzle: PuzzleData): Step[] {
  const W = puzzle.width
  const H = puzzle.height

  // Words to cross out, in random order.
  const words = Object.entries(puzzle.wordsPositions)
  for (let i = words.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[words[i], words[j]] = [words[j], words[i]]
  }
  const steps: Step[] = words.map(([word, cells], i) => ({
    kind: 'line',
    key: `l${i}`,
    word,
    d: wordPath(cells),
  }))

  // Solution letters in row-major order (the uncovered cells, top-left to
  // bottom-right), circled as the final "solving the bonus" phase.
  // objects (not Maps), so use Object.values().
  const covered = new Set<number>()
  for (const cells of Object.values(puzzle.wordsPositions))
    for (const p of cells) covered.add(p.y * W + p.x)
  const sol = puzzle.solution
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('')
  let k = 0
  for (let idx = 0; idx < W * H; idx++) {
    if (!covered.has(idx) && k < sol.length) {
      steps.push({
        kind: 'dot',
        key: `d${k}`,
        x: idx % W,
        y: (idx / W) | 0,
      })
      k++
    }
  }
  return steps
}

function solLetters(puzzle: PuzzleData): string {
  return puzzle.solution
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('')
}

function crossingOrder(steps: Step[]): string[] {
  return steps
    .filter((s): s is Extract<Step, { kind: 'line' }> => s.kind === 'line')
    .map((s) => s.word)
}

// ---------- component ----------

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function SolvePuzzleDemo({ puzzle }: { puzzle: PuzzleData }) {
  const { t } = useI18n()
  const W = puzzle.width
  const H = puzzle.height
  const reduced = useReducedMotion()

  // The full choreography is randomised once per mount; the interval below
  // only controls *when* each step becomes visible.
  const steps = useMemo(() => buildSteps(puzzle), [puzzle])
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (reduced) {
      setDone(steps.length)
      return
    }
    let i = 0
    let timer: number
    const tick = () => {
      i++
      setDone(i)
      if (i < steps.length) {
        timer = window.setTimeout(
          tick,
          steps[i - 1].kind === 'line' ? T_LINE : T_DOT,
        )
      }
    }
    timer = window.setTimeout(tick, T_START)
    return () => clearTimeout(timer)
  }, [steps, reduced])

  const visible = steps.slice(0, done)
  const linesDone = done
  const sol = solLetters(puzzle)
  const order = useMemo(() => crossingOrder(steps), [steps])
  const dotsDone = Math.max(0, done - order.length)

  const cells = useMemo(() => {
    const out: { letter: string; x: number; y: number }[] = []
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        out.push({ letter: puzzle.grid[y * W + x], x, y })
    return out
  }, [puzzle, W, H])

  return (
    <div>
      <div
        className="relative mx-auto"
        style={{ aspectRatio: `${W} / ${H}` }}
        aria-label={t('find_the_words')}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
        >
          {/* cells */}
          {cells.map((c, i) => (
            <g key={i}>
              <rect
                x={c.x + 0.07}
                y={c.y + 0.07}
                width={0.86}
                height={0.86}
                rx={0.16}
                className="fill-slate-100"
              />
              <text
                x={c.x + 0.5}
                y={c.y + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-700 font-mono"
                style={{ fontSize: 0.5, fontWeight: 600 }}
              >
                {c.letter.toUpperCase()}
              </text>
            </g>
          ))}

          {/* pen strokes, in crossing order */}
          {visible
            .filter((s) => s.kind === 'line')
            .map((s) => (
              <path
                key={s.key}
                d={s.d}
                pathLength={1}
                className="ws-pen-line"
                fill="none"
                stroke="#0f172a"
                strokeWidth={0.09}
                strokeLinecap="round"
                opacity={0.85}
              />
            ))}

          {/* solution rings, in row-major order */}
          {visible
            .filter((s) => s.kind === 'dot')
            .map((s) => (
              <circle
                key={s.key}
                cx={s.x + 0.5}
                cy={s.y + 0.5}
                r={0.4}
                className="ws-dot"
                fill="none"
                stroke="#f59e0b"
                strokeWidth={0.07}
              />
            ))}
        </svg>
      </div>

      {/* status strip: words being found, then the bonus answer revealed */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] leading-tight">
        {order.map((w, i) => (
          <span
            key={w}
            className={`rounded px-1 font-mono transition-colors duration-300 ${
              i < linesDone
                ? 'bg-slate-200 text-slate-400 line-through'
                : 'bg-white text-slate-500'
            }`}
          >
            {w.toUpperCase()}
          </span>
        ))}
        <span className="ml-1 font-medium text-slate-400">
          {t('solution')}:
        </span>
        <span className="flex gap-0.5">
          {sol.slice(0, dotsDone).split('').map((ch, i) => (
            <span
              key={i}
              className="grid place-items-center rounded-full bg-amber-100 font-mono font-semibold text-amber-800"
              style={{
                width: 14,
                height: 14,
                border: '1px solid #f59e0b',
              }}
            >
              {ch.toUpperCase()}
            </span>
          ))}
          {dotsDone === 0 && <span className="text-slate-300">···</span>}
        </span>
      </div>
    </div>
  )
}
