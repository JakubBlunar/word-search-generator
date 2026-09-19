import type { NextConfig } from 'next'

// On Vercel the output must land in the standard `.next` (the platform reads
// it after `next build`). The Docker build also wants `.next` (the Dockerfile
// copies `.next/standalone`). Locally, `dist-next` works around a persistent OS
// lock on `.next` (tsserver / AV holding an empty `.next/build` dir).
const onVercel = process.env.VERCEL || process.env.VERCEL_ENV !== undefined
const distDir = onVercel || process.env.DOCKER_BUILD ? '.next' : 'dist-next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir,
  // Produces .next/standalone for the slim Docker runtime image (Dockerfile).
  output: 'standalone',
  // Don't let the dev server auto-generate AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
}

export default nextConfig
