/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  // pdf-parse pulls in pdfjs-dist, which doesn't bundle cleanly through webpack
  // into the server-actions runtime — load it natively via require() instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};
export default nextConfig;
