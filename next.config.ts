import type { NextConfig } from 'next'

// On Vercel the output must land in the standard `.next` (the platform reads
// it after `next build`). Locally, `dist-next` works around a persistent OS
// lock on `.next` (tsserver / AV holding an empty `.next/build` dir).
const distDir =
  process.env.VERCEL || process.env.VERCEL_ENV !== undefined ? '.next' : 'dist-next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir,
  // Don't let the dev server auto-generate AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
}

export default nextConfig
