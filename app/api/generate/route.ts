import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { generate } from '@/lib/generator2'
import { LANGS, type GenerationOptions, type Lang } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

type WordBank = {
  words: string[]
  count: number
  lengths: Record<string, string[]>
}

type RequestBody = {
  lang?: string
  count?: number
  options?: Partial<GenerationOptions>
}

const MAX_PUZZLES = 100

const bankCache = new Map<Lang, Promise<WordBank>>()

function getBank(lang: Lang): Promise<WordBank> {
  const cached = bankCache.get(lang)
  if (cached) return cached

  const load = (async (): Promise<WordBank> => {
    const file = path.join(
      process.cwd(),
      'public',
      'data',
      `words_${lang}.json`,
    )
    const raw = await fs.readFile(file, 'utf8')
    let bank: unknown
    try {
      bank = JSON.parse(raw)
    } catch (cause) {
      throw new Error(`word bank '${lang}' is not valid JSON: ${String(cause)}`)
    }
    const candidate = bank as WordBank
    if (!Array.isArray(candidate.words) || candidate.words.length === 0) {
      throw new Error(`word bank '${lang}' is empty — run \`npm run words\``)
    }
    return candidate
  })()
  bankCache.set(lang, load)

  load.catch(() => bankCache.delete(lang))
  return load
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(v)))

function sanitizeOptions(
  options: Partial<GenerationOptions> | undefined,
): GenerationOptions {
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback

  const minLength = clamp(num(options?.minLength, 3), 2, 20)
  const maxLength = Math.max(
    clamp(num(options?.maxLength, 6), 2, 20),
    minLength,
  )

  return {
    diagonals: options?.diagonals !== false,
    height: 9,
    width: 13,
    numberOfWords: clamp(num(options?.numberOfWords, 250), 10, 2000),
    minLength,
    maxLength,
    effort: clamp(num(options?.effort, 40000), 1000, 1_000_000),
  }
}

export async function POST(req: Request) {
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const lang = body.lang as Lang
  if (!(LANGS as readonly string[]).includes(lang)) {
    return NextResponse.json(
      {
        error: `unsupported lang '${String(body.lang)}' — expected one of ${LANGS.join(', ')}`,
      },
      { status: 400 },
    )
  }

  const count = clamp(num(body.count, 3), 1, MAX_PUZZLES)
  const options = sanitizeOptions(body.options)

  const startedAt = Date.now()
  const bank = await getBank(lang)

  const puzzles = []
  for (let i = 0; i < count; i++) {
    // Sequential: generation is CPU-bound on a single thread anyway.
    puzzles.push(generate(bank, options))
  }

  return NextResponse.json({
    puzzles,
    ms: Date.now() - startedAt,
  })
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}
