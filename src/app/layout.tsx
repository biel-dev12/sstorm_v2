import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
// import { Separator } from "@/components/ui/separator"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSTORM",
  description: "SSTORM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen bg-background text-foreground">
        <SidebarProvider>
          {/* Sidebar persistente */}
          <AppSidebar />

          {/* Área principal (header + conteúdo) */}
          <SidebarInset className="flex flex-col w-full">
            {/* Header fixo */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                {/* <Separator orientation="vertical" className="h-6" /> */}
  
              </div>
            </header>

            {/* Conteúdo rolável */}
            <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
              {children}
            </main>
            <Toaster richColors position="top-right" /> {/* richColors ativa cores para sucesso/erro */}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
