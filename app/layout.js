import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CashZen",
  description: "Track expenses. Set goals. Own your finances.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`} suppressHydrationWarning>
        <ThemeProvider>
          <ClerkProvider>
            {/* header */}
            <Header />
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
            <Toaster richColors/>
            {/* footer */}
            <footer className="bg-blue-50 dark:bg-gray-800 py-10">
              <div className="container mx-auto px-10 text-center text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Made with ❤️ by <a href="https://github.com/Denil05" className="hover:underline">Denil</a>
                </p>
                <p>
                  &copy; 2025 CashZen. All rights reserved.
                </p>
              </div>
            </footer>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
