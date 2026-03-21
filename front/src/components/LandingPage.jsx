import React from "react";
// Įsitikink, kad šie komponentai eksportuoti iš StatCard.jsx
import { FeatureCard, FooterTitle } from "./ui/StatCard";

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#03061C] text-white">
      {/* Navigacija */}
      <nav className="w-full max-w-7xl flex justify-between items-center p-8">
        <div className="text-2xl font-black tracking-tighter uppercase">
          BUDGET<span className="text-blue-500">NEST</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition"
        >
          Sign In
        </button>
      </nav>

      {/* Hero sekcija */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          Personal Finance Reimagined
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
          TRACK SMARTER.<br />
          <span className="text-blue-600">SAVE HARDER.</span>
        </h1>
        <p className="max-w-xl text-lg text-white/40 mb-10">
          Minimalist interface. Powerful insights. Total control over your wealth.
        </p>
        
        <button 
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition shadow-2xl shadow-blue-500/40 active:scale-95"
        >
          Get Started — It's Free
        </button>
      </main>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-8 pb-20">
        <FeatureCard 
          title="Fast Analytics" 
          desc="Beautifully visualized data of your spending habits." 
        />
        <FeatureCard 
          title="Secure Data" 
          desc="Your financial history is encrypted and private." 
        />
        <FeatureCard 
          title="Smart Limits" 
          desc="Set budgets that actually help you save money." 
        />
      </section>

      {/* FOOTERIS - kurio trūko */}
      <footer className="w-full py-12 border-t border-white/5 flex flex-col items-center bg-[#060A1F]">
        <div className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
          BUDGETNEST © 2026
        </div>
        <div className="flex gap-8 text-white/40 text-xs">
          <span className="hover:text-white cursor-pointer transition">Privacy</span>
          <span className="hover:text-white cursor-pointer transition">Terms</span>
          <span className="hover:text-white cursor-pointer transition">Support</span>
        </div>
      </footer>
    </div>
  );
}