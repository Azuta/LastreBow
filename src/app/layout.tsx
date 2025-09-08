import type { Metadata } from "next";
import RootProviders from "@/components/container/RootProvider";
import { MediaProvider } from "@/context/MediaContext";
// 1. Importa el nuevo proveedor de preferencias
import { UserPreferencesProvider } from "@/context/UserPreferencesContext"; 
import { Poppins } from "next/font/google";
import "@/styles/global.css"

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
          <MediaProvider>
            {/* 2. Envuelve a los hijos con el proveedor */}
            <UserPreferencesProvider>
              {children}
            </UserPreferencesProvider>
          </MediaProvider>
        </RootProviders>
      </body>
    </html>
  );
}
