import React from "react";

export function TransactionRow({ t, onDelete }) {
  const isExp = t.type === 'expense';
  return (
    <div className="bg-[#161B33] p-5 rounded-2xl flex justify-between items-center border border-white/5 group text-left transition hover:border-white/10">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isExp ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
          {isExp ? '🛍' : '💰'}
        </div>
        <div>
          <p className="font-semibold text-sm">{t.title}</p>
          <p className="text-[11px] text-white/30 uppercase mt-1">{t.category_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`font-bold ${isExp ? 'text-red-400' : 'text-green-400'}`}>€{t.amount}</span>
        <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 transition px-2">🗑</button>
      </div>
    </div>
  );
}

export function BudgetBar({ category_name, spent, limit_amount }) {
  const percent = limit_amount > 0 ? (spent / limit_amount) * 100 : 0;
  const isOver = Number(spent) > Number(limit_amount);
  return (
    <div className="space-y-3 text-left">
      <div className="flex justify-between items-center text-xs font-medium">
        <span>{category_name}</span>
        <span className={isOver ? 'text-red-400' : 'text-white/50'}>
          €{Number(spent).toFixed(0)} / €{Number(limit_amount).toFixed(0)}
        </span>
      </div>
      <div className="w-full bg-[#161B33] rounded-full h-2.5 overflow-hidden">
        <div className={`h-full ${isOver ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}