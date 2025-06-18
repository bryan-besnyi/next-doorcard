import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/AuthProvider";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Faculty Doorcard App",
  description: "Create and manage faculty doorcards",
};

const Navbar = () => {
  return <div className="bg-gray-800 text-white text-2xl p-5">Navbar</div>;
};

const Footer = () => {
  return <div className="bg-gray-800 text-white text-2xl p-5">Footer</div>;
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background`}>
        <AuthProvider>
          <div className="h-full bg-gray-50 flex flex-col">
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
