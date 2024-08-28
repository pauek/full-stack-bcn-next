import mdx from "@next/mdx"
import { env } from "./lib/env.mjs" // <--- IMPORTANT: Validate variables at build time
import chalk from "chalk"

const withMDX = mdx({
  // no options
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: env.R2_PUBLIC_HOSTNAME,
        port: "",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
}

// The "phase-production-build" is called two times, so we avoid printing the message twice
console.log(`TURSO_URL = ${chalk.green(env.TURSO_URL)}\n`)

const makeNextConfig = async (phase, { defaultConfig }) => {
  const config = { ...nextConfig }

  if (process.env.NODE_ENV === "development" && env.BACKEND !== "files") {
    console.warn(`Warning: you are doing development with BACKEND !== "files"!`)
  }

  return withMDX(config)
}

export default makeNextConfig
