import mdx from "@next/mdx";
import chalk from "chalk";
import { PHASE_PRODUCTION_BUILD, PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

import { env } from "./lib/env.mjs"; // <--- IMPORTANT: Validate variables at build time

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
        protocol: "https",
        hostname: env.R2_PUBLIC_HOSTNAME,
        port: "",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
};

export default async (phase, { defaultConfig }) => {
  const config = { ...nextConfig };
  const dbUrl = env.DB_URL || "files";

  let backend;
  switch (dbUrl) {
    case "files":
      backend = "<< FILES >>";
      break;
    default: {
      const { hostname } = new URL(dbUrl);
      backend = `DB: ${hostname}`;
    }
  }

  switch (phase) {
    case PHASE_DEVELOPMENT_SERVER:
      console.info(`--> Dev server [${chalk.yellow(backend)}]`);
      break;
    case PHASE_PRODUCTION_BUILD:
      console.info(`--> Production build [${chalk.yellow(backend)}]`);
      break;
  }

  return withMDX(config);
};
