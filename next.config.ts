import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles this automatically, but explicit for clarity
  output: undefined, // default, Vercel auto-detects

  // Allow Supabase domain for any future image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goozqjcucymhosdgleho.supabase.co",
      },
    ],
  },
};

export default nextConfig;
