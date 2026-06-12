import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*; connect-src 'self' https://discord.com https://*.sanity.io https://api.razorpay.com; font-src 'self' data:; media-src 'self'; object-src 'none'; frame-src 'self' https://www.google.com https://www.google.co.in https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
