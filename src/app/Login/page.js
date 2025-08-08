// src/app/Login/page.js

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaTasks } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client"; // Import the Supabase client helper

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Instantiate the Supabase client
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // This is the new Supabase login logic
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase provides user-friendly error messages
      setError(error.message);
    } else {
      // On success, Supabase handles the session.
      // We just need to navigate to the dashboard.
      router.replace("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <FaTasks className="mx-auto text-primary text-4xl mb-2" />
          <h1 className="text-3xl font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Log in to manage your tasks.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 bg-muted text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 bg-muted text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Display error message if it exists */}
          {error && (
            <p className="text-sm text-center text-red-500 bg-red-500/10 p-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          {"Don't have an account? "}
          <Link href="/Signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}