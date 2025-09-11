/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
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
        // --- Patrón para el bucket de perfiles ---
        {
          protocol: "https",
          hostname: "pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev",
        },
        // --- Patrón para el nuevo bucket de covers ---
        {
          protocol: "https",
          hostname: "pub-055d6b8ce9d54aa7ae23cf1ae2e84130.r2.dev",
        },
      ],
    },
};

export default nextConfig;