import mdx from "@next/mdx";

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
        hostname: "*.full-stack-bcn.dev",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3333",
      },
    ],
  },
  poweredByHeader: false,
};

export default withMDX(nextConfig);
