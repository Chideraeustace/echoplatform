import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  SmartphoneNfc,
  ArrowRight,
  Database,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* NAVBAR */}
      <header className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md bg-[#0b0f19]/70 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white cursor-pointer">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <Database className="text-emerald-400 h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Echo<span className="text-emerald-400 font-extrabold">data</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/50 transition-all"
          >
            Agent Portal
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg transition-all"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* HERO */}
      <main className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ghana's Leading Data Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
            Monetize & Source <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              Verified Insights.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
            Echodata bridges the gap between enterprise demands and localized
            mapping. Deploy structured data pipelines, or register as a local
            agent to stream data bundles instantly.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-700/60 shadow-xl transition-all group"
            >
              Explore Dataset Hub{" "}
              <ArrowRight className="text-emerald-400 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Join as an Agent
            </button>
          </div>
          <div className="pt-6 flex items-center gap-6 text-xs font-mono text-slate-500 border-t border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Wallet className="text-emerald-500/70 h-3.5 w-3.5" /> MTN MoMo /
              Telecel
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-500/70 h-3.5 w-3.5" /> DPC
              Compliant
            </span>
          </div>
        </div>

        {/* METRICS PREVIEW */}
        <div className="relative w-full max-w-[500px] justify-self-center md:justify-self-end">
          <div className="absolute top-10 right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 block"></span>
              </div>
              <div className="text-[11px] font-mono tracking-wider text-slate-400 bg-slate-950 px-3 py-1 rounded-md border border-slate-800/60">
                echodata_node_accra // live
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  Agent Volume
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-emerald-400">
                    GHS
                  </span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    14,840.00
                  </span>
                </div>
              </div>
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5 flex items-center justify-between">
                <div className="text-xs font-medium text-slate-300">
                  Live API Requests
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md">
                  +2.4% <TrendingUp className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- PLATFORM FEATURES --- */}
      <section
        id="features"
        className="bg-[#070a12] border-t border-slate-900 py-24"
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl hover:border-slate-700/60 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Vetted Agent Nodes
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vetted background data streams compliant with Ghana Data
              Protection guidelines.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl hover:border-slate-700/60 transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Instant Delivery Loops
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Buyers instantly unlock datasets and pipeline webhooks via
              continuous secure encryption updates.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl hover:border-slate-700/60 transition-all">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <SmartphoneNfc className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Direct MoMo Settlements
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engineered specifically for quick ecosystem delivery options
              connecting to your local wallets.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 bg-[#070a12] py-8 text-center text-xs font-mono text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Echodata Technologies. Scaled in
          Ghana.
        </p>
      </footer>
    </div>
  );
}
