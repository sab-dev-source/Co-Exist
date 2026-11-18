import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Three.js WebGL contexts, GSAP ScrollTrigger pins, and Lenis are imperative DOM runtimes;
  // disabling StrictMode prevents double-mounting WebGL canvases in dev.
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
