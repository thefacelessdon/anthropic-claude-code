/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern formats automatically
    formats: ["image/webp", "image/avif"],
    // Max sizes Next.js will generate on-the-fly
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
