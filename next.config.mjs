import mdx from "@next/mdx";

const withMDX = mdx({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
};

export default withMDX(nextConfig);
