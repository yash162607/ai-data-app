"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      setError("Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-slate-700 border-none outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-700 border-none outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 py-3 rounded hover:bg-cyan-600"
          >
            Login
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogle}
            className="w-full bg-white text-black py-3 rounded hover:bg-gray-200"
          >
            Continue with Google
          </button>
        </div>
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-cyan-400">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}