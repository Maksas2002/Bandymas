import React, { useState, useEffect } from "react";
import { API_URL } from "../../constants";
import { getAuthHeaders } from "../../utils/auth"; // Svarbu!

export function TransactionModal({ isOpen, onClose, type, categories, userId, onSave }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: getAuthHeaders(), // Naudojame saugius headerius
      body: JSON.stringify({ user_id: userId, category_id: categoryId, title, amount: parseFloat(amount), type })
    });
    if (res.ok) { setTitle(""); setAmount(""); setCategoryId(""); onSave(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
      <div className="bg-[#0D1126] w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-white">Add {type === 'income' ? 'Income' : 'Expense'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-[#161B33] p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" required />
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (€)" className="w-full bg-[#161B33] p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" required />
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-[#161B33] p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" required>
            <option value="">Choose category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 text-white/40 font-bold">Cancel</button>
            <button type="submit" className={`flex-1 py-4 rounded-xl font-bold text-white ${type === 'income' ? 'bg-green-600' : 'bg-blue-600'}`}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BudgetModal({ isOpen, onClose, categories, userId, onSave }) {
  const [selectedCat, setSelectedCat] = useState("");
  const [amount, setAmount] = useState("");
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedCat || !amount) return alert("Fill all fields");
    const res = await fetch(`${API_URL}/budgets`, {
      method: "POST",
      headers: getAuthHeaders(), // Naudojame saugius headerius
      body: JSON.stringify({ user_id: userId, category_id: selectedCat, limit_amount: amount })
    });
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
      <div className="bg-[#0D1126] w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-white">Set Budget Limit</h3>
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full bg-[#161B33] p-4 rounded-xl border border-white/5 outline-none mb-4 text-white">
          <option value="">Select Category</option>
          {categories.filter(c => c.type === 'expense').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Limit (€)" className="w-full bg-[#161B33] p-4 rounded-xl border border-white/5 outline-none mb-6 text-white" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 text-white/40 font-bold">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 py-4 rounded-xl font-bold text-white">Save</button>
        </div>
      </div>
    </div>
  );
}