import type { Metadata } from "next";
import RootProviders from "@/components/container/RootProvider";
import { MediaProvider } from "@/context/MediaContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext"; 
import { AuthProvider } from "@/context/AuthContext";
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
          <AuthProvider>
            <MediaProvider>
              <UserPreferencesProvider>
                {children}
              </UserPreferencesProvider>
            </MediaProvider>
          </AuthProvider>
        </RootProviders>
      </body>
    </html>
  );
}