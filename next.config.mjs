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
  staticPageGenerationTimeout: 600,
};

export default async (phase, { defaultConfig }) => {
  const config = { ...nextConfig };
  const { DATABASE_URL: dbUrl } = process.env;
  switch (phase) {
    case PHASE_DEVELOPMENT_SERVER: 
      console.info(`--> Dev server [${dbUrl}] <--`);
      break;
    case PHASE_PRODUCTION_BUILD:
      console.info(`--> Production build [${dbUrl}] <--`);
      break;
  }
  return withMDX(config);
};
