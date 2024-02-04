import mdx from "@next/mdx";
import chalk from "chalk";
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
      {
        protocol: "https",
        hostname: `${process.env.R2_PUBLIC_URL}/**`,
      },
    ],
  },
  poweredByHeader: false,
};

export default async (phase, { defaultConfig }) => {
  const config = { ...nextConfig };
  const { DATABASE_URL: dbUrl } = process.env;
  const location = dbUrl === "files" ? chalk.green("<< FILES >>") : new URL(dbUrl).hostname;
  switch (phase) {
    case PHASE_DEVELOPMENT_SERVER:
      console.info(`--> Dev server [${location}] <--`);
      break;
    case PHASE_PRODUCTION_BUILD:
      console.info(`--> Production build [${location}] <--`);
      break;
  }
  return withMDX(config);
};
