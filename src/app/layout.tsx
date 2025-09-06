import type { Metadata } from "next";
import RootProviders from "@/components/container/RootProvider";
import { MediaProvider } from "@/context/MediaContext";
import { Poppins } from "next/font/google";
import "@/styles/global.css"

// Usamos next/font/google para Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anilist",
  description: "My Anilist clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <RootProviders>
          <MediaProvider>{children}</MediaProvider>
        </RootProviders>
      </body>
    </html>
  );
}
