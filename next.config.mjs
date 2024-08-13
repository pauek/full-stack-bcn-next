import mdx from "@next/mdx"
import { env } from "./lib/env.mjs" // <--- IMPORTANT: Validate variables at build time

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

export default async (phase, { defaultConfig }) => {
  const config = { ...nextConfig }

  console.log(`-----------------------------------`)
  console.log("PHASE:      ", phase)
  console.log("BACKEND:    ", env.BACKEND)
  console.log("TURSO_URL:  ", env.TURSO_URL)
  console.log(`-----------------------------------`)

  return withMDX(config)
}
