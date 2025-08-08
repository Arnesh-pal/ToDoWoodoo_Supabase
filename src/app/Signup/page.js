// src/app/Signup/page.js

"use client";
import { useState } from "react";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client"; // Import the Supabase client helper

export default function Signup() {
  // Add state for the user's name
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Use a single state for all messages (error or success)
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Instantiate the Supabase client
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // This is the new Supabase signup logic
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store extra user data like their name in 'user_metadata'
        data: {
          name: name,
        },
        // Set the URL to redirect to after the user confirms their email
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage("Account created! Please check your email to verify your account.");
      setIsError(false);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <FaUserPlus className="mx-auto text-primary text-4xl mb-2" />
          <h1 className="text-3xl font-bold text-foreground">
            Create an Account
          </h1>
          <p className="text-muted-foreground">Start organizing your life, one task at a time.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            className="w-full p-3 bg-muted text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="Password (min. 6 characters)"
            required
            minLength={6}
            className="w-full p-3 bg-muted text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full p-3 bg-muted text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && (
            <p className={`text-sm text-center p-2 rounded-md ${isError ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account?{" "}
          <Link href="/Login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}