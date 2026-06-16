import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail, // Imported for password reset functionality
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Database, Mail, Lock, ShoppingBag, Phone } from "lucide-react";

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dataSellingName, setDataSellingName] = useState(""); // New State hook for storefront branding
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for successful password resets
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // Enforce entry for data selling name on signup
        if (!dataSellingName.trim() || phoneNumber.trim().length < 10) {
          throw new Error(
            "Please specify a valid Data-Selling Name or Phone Number for your workspace.",
          );
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        await setDoc(doc(db, "echoagents", user.uid), {
          agentId: user.uid,
          email: user.email,
          dataSellingName: dataSellingName.trim(), // Composed storefront name saved here
          createdAt: new Date().toISOString(),
          walletBalance: 0.0,
          withdrawableEarnings: 0.0,
          isRegistered: false,
          isActiveAgent: true,
          phone: phoneNumber.trim(),
          

          // Package Matrices
          mtnPackages: {
            "1gb": {
              size: "1GB",
              costPrice: 4.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "2gb": {
              size: "2GB",
              costPrice: 8.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "3gb": {
              size: "3GB",
              costPrice: 12.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "4gb": {
              size: "4GB",
              costPrice: 16.7,
              agentPrice: 0.0,
              isActive: true,
            },
            "5gb": {
              size: "5GB",
              costPrice: 20.6,
              agentPrice: 0.0,
              isActive: true,
            },
            "6gb": {
              size: "6GB",
              costPrice: 25.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "7gb": {
              size: "7GB",
              costPrice: 28.7,
              agentPrice: 0.0,
              isActive: true,
            },
            "8gb": {
              size: "8GB",
              costPrice: 33.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "10gb": {
              size: "10GB",
              costPrice: 40.3,
              agentPrice: 0.0,
              isActive: true,
            },
            "15gb": {
              size: "15GB",
              costPrice: 58.3,
              agentPrice: 0.0,
              isActive: true,
            },
            "20gb": {
              size: "20GB",
              costPrice: 78.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "25gb": {
              size: "25GB",
              costPrice: 98.7,
              agentPrice: 0.0,
              isActive: true,
            },
            "30gb": {
              size: "30GB",
              costPrice: 118.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "40gb": {
              size: "40GB",
              costPrice: 154.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "50gb": {
              size: "50GB",
              costPrice: 193.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "100gb": {
              size: "100GB",
              costPrice: 377.0,
              agentPrice: 0.0,
              isActive: true,
            },
          },
          vodafonePackages: {
            "5gb": {
              size: "5GB",
              costPrice: 22.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "10gb": {
              size: "10GB",
              costPrice: 43.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "15gb": {
              size: "15GB",
              costPrice: 59.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "20gb": {
              size: "20GB",
              costPrice: 79.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "25gb": {
              size: "25GB",
              costPrice: 98.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "30gb": {
              size: "30GB",
              costPrice: 115.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "35gb": {
              size: "35GB",
              costPrice: 135.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "40gb": {
              size: "40GB",
              costPrice: 149.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "45gb": {
              size: "45GB",
              costPrice: 172.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "50gb": {
              size: "50GB",
              costPrice: 183.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "100gb": {
              size: "100GB",
              costPrice: 361.0,
              agentPrice: 0.0,
              isActive: true,
            },
          },
          airteltigoPackages: {
            "1gb": {
              size: "1GB",
              costPrice: 4.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "2gb": {
              size: "2GB",
              costPrice: 8.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "3gb": {
              size: "3GB",
              costPrice: 12.5,
              agentPrice: 0.0,
              isActive: true,
            },
            "4gb": {
              size: "4GB",
              costPrice: 16.7,
              agentPrice: 0.0,
              isActive: true,
            },
            "5gb": {
              size: "5GB",
              costPrice: 22.6,
              agentPrice: 0.0,
              isActive: true,
            },
            "6gb": {
              size: "6GB",
              costPrice: 25.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "7gb": {
              size: "7GB",
              costPrice: 29.7,
              agentPrice: 0.0,
              isActive: true,
            },
            "8gb": {
              size: "8GB",
              costPrice: 33.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "10gb": {
              size: "10GB",
              costPrice: 42.3,
              agentPrice: 0.0,
              isActive: true,
            },
            "15gb": {
              size: "15GB",
              costPrice: 46.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "20gb": {
              size: "20GB",
              costPrice: 56.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "25gb": {
              size: "25GB",
              costPrice: 62.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "30gb": {
              size: "30GB",
              costPrice: 67.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "40gb": {
              size: "40GB",
              costPrice: 82.0,
              agentPrice: 0.0,
              isActive: true,
            },
            "50gb": {
              size: "50GB",
              costPrice: 96.0,
              agentPrice: 0.0,
              isActive: true,
            },
          },
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  // Handler for password reset dispatch
  const handleForgotPassword = async () => {
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError(
        "Please enter your email address to receive a password reset link.",
      );
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset link sent securely! Check your inbox.");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6 font-sans relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div
            className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 mb-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Database className="text-emerald-400 h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === "login"
              ? "Sign In to Echodata"
              : "Register Agent Profile"}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-mono">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-mono">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* CONDITIONALLY RENDER DATA SELLING NAME FIELD ONLY ON SIGNUP */}
          {mode === "signup" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Data-Selling Brand Name
              </label>
              <div className="relative">
                <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                <input
                  type="text"
                  required
                  value={dataSellingName}
                  onChange={(e) => setDataSellingName(e.target.value)}
                  placeholder="e.g. Speedlink Data Hub"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* PHONE NUMBER FIELD (Renders on Signup) */}
          {mode === "signup" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                <input
                  type="tel"
                  required={mode === "signup"}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0549876543"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="email"
                required={mode === "signup" || !loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-xs font-semibold text-emerald-400 hover:underline hover:text-emerald-300 transition-colors bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="password"
                required={mode !== "forgot-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading
              ? "Authorizing Secure Node..."
              : mode === "login"
                ? "Authenticate Dashboard"
                : "Initialize Profile Matrix"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "login" ? (
            <p>
              New to the workspace?{" "}
              <Link
                to="/signup"
                className="text-emerald-400 font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          ) : (
            <p>
              Already an approved node?{" "}
              <Link
                to="/login"
                className="text-emerald-400 font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
