import mdx from "@next/mdx";

const withMDX = mdx({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  images: {
    domains: [
      "localhost",
      "content.full-stack-bcn.dev",
    ]
  }
};

export default withMDX(nextConfig);
