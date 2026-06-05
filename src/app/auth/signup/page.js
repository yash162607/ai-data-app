"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("user", email);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignup} className="bg-slate-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full p-2 mb-2 bg-slate-700 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full p-2 mb-4 bg-slate-700 rounded" />
        <button type="submit" className="bg-cyan-500 w-full py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}