import React from "react";

export function StatCard({ title, value, icon, isProgress }) {
  return (
    <div className="bg-[#0D1126] p-7 rounded-3xl border border-white/5 flex flex-col justify-between h-[160px] text-left">
      <div className="flex justify-between items-center">
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-extrabold tracking-tight mt-2">{value}</p>
      {isProgress && (
        <div className="w-full bg-[#161B33] rounded-full h-1.5 mt-3">
          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '68%' }} />
        </div>
      )}
    </div>
  );
}

export function FeatureCard({ title, desc }) {
  return (
    <div className="bg-[#0D1126] border border-white/5 p-12 rounded-3xl text-left">
      <h3 className="text-2xl font-bold mb-5">{title}</h3>
      <p className="text-white/40 text-sm">{desc}</p>
    </div>
  );
}

export function FooterTitle({ title }) {
  return <h5 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5 text-left">{title}</h5>;
}