/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["s4.anilist.co", "mangadex.org"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "media.kitsu.app",
        },
      ],
    },
};

export default nextConfig;


