const mdx = require("@next/mdx");
const { yellow } = require("colorette");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants.js");

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
        hostname: process.env.R2_PUBLIC_HOSTNAME,
        port: "",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
};

module.exports = async (phase, { defaultConfig }) => {
  const config = { ...nextConfig };
  const DB_URL = process.env.DB_URL || "files";

  let backend;
  switch (DB_URL) {
    case "files":
      backend = "<< FILES >>";
      break;
    default: {
      const { hostname } = new URL(DB_URL);
      backend = `DB: ${hostname}`;
    }
  }

  switch (phase) {
    case PHASE_DEVELOPMENT_SERVER:
      console.info(`--> Dev server [${yellow(backend)}]`);
      break;
    case PHASE_PRODUCTION_BUILD:
      console.info(`--> Production build [${yellow(backend)}]`);
      break;
  }

  return withMDX(config);
};
