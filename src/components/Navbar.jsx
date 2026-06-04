"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="bg-slate-800 p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-cyan-400">
        📊 AI Data Analyzer
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:text-cyan-400">
              Dashboard
            </Link>
            <Link href="/upload" className="hover:text-cyan-400">
              Upload
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hover:text-cyan-400">
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-cyan-500 px-4 py-2 rounded hover:bg-cyan-600"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}