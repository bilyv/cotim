"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import confetti from "canvas-confetti";

export function RegisterForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { signIn } = useAuthActions();
  const updateUserProfile = useMutation(api.auth.updateUserProfile);
  const [step, setStep] = useState(1); // 1: name, 2: email, 3: password, 4: success
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
      setError("");
    } else {
      setError("Please enter your name");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setStep(3);
      setError("");
    } else {
      setError("Please enter a valid email address");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      // First, sign up the user
      await signIn("password", { 
        flow: "signUp",
        email,
        password
      });
      
      // Then, update the user's name
      await updateUserProfile({ name });
      
      // Show success step
      setStep(4);
      
      // Trigger confetti animation
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#7C3AED', '#2563EB', '#0EA5E9']
      });
    } catch (error: any) {
      let toastTitle = "";
      if (error.message?.includes("User already exists")) {
        toastTitle = "An account with this email already exists. Please sign in instead.";
      } else {
        toastTitle = "Could not sign up. Please try again.";
      }
      setError(toastTitle);
      setSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    // This will automatically redirect to the dashboard since the user is now authenticated
    window.location.reload();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-600 text-sm mt-1">Join us to get started</p>
        </div>

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleNameSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="John Doe"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-slate-800 ml-2">What's your email?</h3>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-slate-800 ml-2">Create password</h3>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            
            <p className="text-xs text-slate-500">
              Password must be at least 8 characters long
            </p>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Account Created!</h3>
            <p className="text-slate-600 text-sm mb-6">
              Welcome aboard, {name}! Your account has been successfully created.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}