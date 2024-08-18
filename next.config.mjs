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

const makeNextConfig = async (phase, { defaultConfig }) => {
  const config = { ...nextConfig }

  if (process.env.NODE_ENV === "development" && env.BACKEND !== "files") {
    console.error(`Don't do development with BACKEND != "files"!`)
    process.exit(1)
  }

  return withMDX(config)
}

export default makeNextConfig