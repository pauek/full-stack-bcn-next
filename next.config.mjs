import mdx from "@next/mdx";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";

const withMDX = mdx({});

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
        protocol: "http",
        hostname: "localhost",
        port: "3333",
      },
    ],
  },
  poweredByHeader: false,
};

export default async (phase, { defaultConfig }) => {
  const config = { ...nextConfig };
  switch (phase) {
    case PHASE_DEVELOPMENT_SERVER: 
      console.info("--> Dev server <--");
      break;
    case PHASE_PRODUCTION_BUILD:
      console.info("--> Production build <--");
      break;
  }
  return withMDX(config);
};
