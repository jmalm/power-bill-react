import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Required for static HTML export, which GitHub Pages needs.
  // This will generate an 'out' directory with static HTML, CSS, and JS.
  output: 'export',

  // Optional: If your GitHub Pages URL is like https://<username>.github.io/<repo-name>/
  // you need to set a basePath. Replace 'power-bill-react' with your actual repository name.
  // If your site is hosted at the root (e.g., https://username.github.io), you might not need this.
  // This ensures all internal links and routing work correctly when deployed to a subpath.
  basePath: isProd ? '/power-bill-react' : '', // <-- IMPORTANT: Replace 'power-bill-react' with your GitHub repository name

  // Optional: This is crucial for correctly loading assets (JS, CSS, images)
  // when your site is hosted on a subpath like GitHub Pages.
  // It ensures that paths to these assets are prefixed correctly.
  // assetPrefix: isProd ? '/power-bill-react/' : '', // <-- IMPORTANT: Replace 'power-bill-react' with your GitHub repository name

  // You can add other Next.js configurations here if needed
  // For example, if you use next/image with static export, you might need to unoptimize images:
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
