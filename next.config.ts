import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Work around a persistent OS lock on '.next' in this environment (tsserver
  // / AV holding an empty '.next/build' dir). Next is fully distDir-agnostic.
  distDir: 'dist-next',
  // Don't let the dev server auto-generate AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
}

export default nextConfig
