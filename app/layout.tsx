import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import RootClient from "./RootClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIdentity } from "@/features/backoffice/cms/actions/identity.action";


export async function generateMetadata(): Promise<Metadata> {
  try {
    const identity = await getIdentity();
    const title = identity?.name || "RealState Platform";
    return {
      title,
    };
  } catch (error) {
    console.error("Error fetching identity for metadata:", error);
    return {
      title: "RealState Platform",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <head>
        {/* Material Symbols fonts loaded with font-display: block in globals.css */}
        {/* Preload removed - not needed for pages that don't use icons (e.g., /portal auth) */}
      </head>
      <body>
        <ClientProviders session={session}>
          <RootClient>
            {children}
          </RootClient>
        </ClientProviders>
      </body>
    </html>
  );
}
