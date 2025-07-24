"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { data: session, status } = useSession();
  console.log(session);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="bg-gray-800 text-white text-2xl py-5 px-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image
            src="/smccd-logo-white.svg"
            alt="SMCCD Logo"
            width={250}
            height={150}
            className="pr-4 border-r-2 border-white"
            priority
          />
          <div className="text-3xl font-bold">Faculty Doorcard</div>
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="text-sm">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
