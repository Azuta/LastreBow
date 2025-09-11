/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["s4.anilist.co", "mangadex.org"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "s4.anilist.co",
        },
        {
          protocol: "https",
          hostname: "mangadex.org",
        },
        {
          protocol: "https",
          hostname: "media.kitsu.app",
        },
        {
          protocol: "https",
          hostname: "i.pravatar.cc",
        },
        // --- AÑADE ESTA LÍNEA ---
        {
          protocol: "https",
          hostname: "pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev",
        },
      ],
    },
};

export default nextConfig;