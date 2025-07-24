import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import type { ReactNode } from "react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Faculty Doorcard App",
  description: "Create and manage faculty doorcards",
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-800 text-white p-5">
      <div className="text-center text-gray-300">
        <p>© {currentYear} San Mateo County Community College District</p>
        <p className="mt-2">
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Faculty Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <AuthProvider>
          <div className="min-h-full bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
              <div className="my-10 bg-white rounded-lg shadow-md p-4 flex-grow flex flex-col">
                {children}
              </div>
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
