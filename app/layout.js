import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CashZen",
  description: "Track expenses. Set goals. Own your finances.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClerkProvider>
          {/* header */}
          <Header />
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Toaster richColors/>
          {/* footer */}
          <footer className="bg-blue-50 py-10">
            <div className="container mx-auto px-10 text-center text-sm text-black-500">
              <p>
                Made with ❤️ by <a href="https://github.com/Denil05">Denil</a>
              </p>
              <p>
                &copy; 2025 CashZen. All rights reserved.
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
