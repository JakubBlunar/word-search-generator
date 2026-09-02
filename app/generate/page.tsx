'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LANGS } from '@/lib/types'
import type { Lang, PuzzleData } from '@/lib/types'
import { createHighlight } from '@/lib/highlight'
import type { Highlight } from '@/lib/highlight'
import { PuzzleView } from '@/components/puzzle-view'

const PUZZLES_PER_PAGE = 3

type Slot =
  | { status: 'pending'; label: string }
  | { status: 'error'; label: string; error: string }
  | { status: 'ready'; label: string; puzzle: PuzzleData; highlight: Highlight }

const pendingSlot = (label: string): Slot => ({ status: 'pending', label })
const errorSlot = (label: string, error: string): Slot => ({
  status: 'error',
  label,
  error,
})

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-200">
          <p className="text-sm text-slate-500">Loading…</p>
        </main>
      }
    >
      <GenerateApp />
    </Suspense>
  )
}

function GenerateApp() {
  const searchParams = useSearchParams()
  const total =
    Math.min(20, Math.max(1, Number(searchParams.get('pages')) || 3)) *
    PUZZLES_PER_PAGE

  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: total }, (_, i) =>
      pendingSlot(
        `${String.fromCharCode(65 + Math.floor(i / 3))}.${(i % 3) + 1}`,
      ),
    ),
  )
  const [busy, setBusy] = useState(true)
  const busyRef = useRef(0)

  const params = {
    lang: (LANGS as readonly string[]).includes(searchParams.get('lang') ?? '')
      ? (searchParams.get('lang') as Lang)
      : 'sk',
    minLength: toNum(searchParams.get('minLength'), 3),
    maxLength: Math.max(
      toNum(searchParams.get('maxLength'), 6),
      toNum(searchParams.get('minLength'), 3),
    ),
    numberOfWords: toNum(searchParams.get('words'), 250),
    diagonals: searchParams.get('diagonals') !== 'false',
  }

  const generateInto = useCallback(
    async (indexes: number[]) => {
      busyRef.current += 1
      setBusy(true)
      setSlots((prev) =>
        prev.map((s, i) => (indexes.includes(i) ? pendingSlot(s.label) : s)),
      )
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            lang: params.lang,
            count: indexes.length,
            options: {
              minLength: params.minLength,
              maxLength: params.maxLength,
              numberOfWords: params.numberOfWords,
              diagonals: params.diagonals,
            },
          }),
        })
        if (!res.ok) throw new Error(`server error ${res.status}`)
        const data = (await res.json()) as { puzzles: PuzzleData[] }
        setSlots((prev) =>
          prev.map((s, i) => {
            const position = indexes.indexOf(i)
            if (position === -1) return s
            const puzzle = data.puzzles[position]
            return {
              status: 'ready' as const,
              label: s.label,
              puzzle,
              highlight: createHighlight(puzzle),
            }
          }),
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'generation failed'
        setSlots((prev) =>
          prev.map((s, i) =>
            indexes.includes(i) && s.status === 'pending'
              ? errorSlot(s.label, `${message} — click ↻ to retry`)
              : s,
          ),
        )
      } finally {
        busyRef.current -= 1
        if (busyRef.current <= 0) setBusy(false)
      }
    },
    [
      params.lang,
      params.minLength,
      params.maxLength,
      params.numberOfWords,
      params.diagonals,
    ],
  )

  useEffect(() => {
    void generateInto(Array.from({ length: total }, (_, i) => i))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const regenerate = (index: number) => void generateInto([index])
  const pages = Math.ceil(total / PUZZLES_PER_PAGE)
  const readyCount = slots.filter((s) => s.status === 'ready').length

  return (
    <main className="min-h-screen bg-slate-200 pb-16 print:bg-white print:pb-0">
      <div className="app-toolbar sticky top-0 z-10 border-b border-slate-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {params.lang.toUpperCase()} · {total} puzzles · {pages}{' '}
              {pages === 1 ? 'page' : 'pages'}
            </p>
            <p className="text-xs text-slate-500" aria-live="polite">
              {busy
                ? `Generating… ${readyCount}/${total} ready`
                : 'Ready to print'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/configure?lang=${params.lang}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              ← New settings
            </Link>
            <button
              onClick={() => window.print()}
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? `Generating ${readyCount}/${total}…` : 'Print'}
            </button>
          </div>
        </div>
      </div>

      <p className="screen-note">
        Tip: the printed page hides the bonus solution word and color
        highlights. ↻ regenerates a single puzzle.
      </p>

      <div className="print-sheet mx-auto">
        {Array.from({ length: pages }, (_, p) => (
          <div key={p} className="print-page">
            {slots
              .slice(p * PUZZLES_PER_PAGE, (p + 1) * PUZZLES_PER_PAGE)
              .map((s, i) => {
                const index = p * PUZZLES_PER_PAGE + i
                const busy = s.status !== 'ready'
                const hasPuzzle = 'puzzle' in s
                const cellClass =
                  'puzzle-cell' +
                  (busy
                    ? ' puzzle-cell-is-busy'
                    : ' puzzle-cell-ready')
                return (
                  <div key={index} className={cellClass}>
                    {hasPuzzle && (
                      <>
                        <PuzzleView
                          puzzle={s.puzzle}
                          highlight={s.highlight}
                        />
                        <div
                          className={
                            'puzzle-aux' +
                            (busy ? ' puzzle-aux-busy' : '')
                          }
                        >
                          <span className="puzzle-solution">
                            <span className="puzzle-solution-label">
                              bonus word
                            </span>
                            <span className="solution-word">
                              {s.puzzle.solution}
                            </span>
                          </span>
                          {s.status === 'pending' && (
                            <span className="puzzle-aux-status">
                              {s.label} — regenerating…
                            </span>
                          )}
                          {s.status === 'ready' && (
                            <button
                              onClick={() => regenerate(index)}
                              className="regen-btn"
                            >
                              ↻ Regenerate
                            </button>
                          )}
                          {s.status === 'error' && (
                            <button
                              onClick={() => regenerate(index)}
                              className="regen-btn"
                            >
                              ↻ Retry
                            </button>
                          )}
                        </div>
                        {s.status === 'error' && (
                          <p className="puzzle-error-msg">{s.error}</p>
                        )}
                      </>
                    )}

                    {s.status === 'pending' && !hasPuzzle && (
                      <div className="puzzle-state puzzle-state-full">
                        <span className="puzzle-state-label">
                          {s.label}
                        </span>
                        <span>generating…</span>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </main>
  )
}

function toNum(value: string | null, fallback: number): number {
  const v = Number(value)
  return Number.isFinite(v) && value !== null && value !== ''
    ? Math.round(v)
    : fallback
}
