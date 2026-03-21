import React, { useState, useEffect } from "react";
import { API_URL } from "../constants";
import { getAuthHeaders } from "../utils/auth";

export default function UserDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", category_id: "", date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/categories`, { headers: getAuthHeaders() })
      ]);
      if (tRes.ok) setTransactions(await tRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/transactions/${editingId}` : `${API_URL}/transactions`;
    
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ amount: "", description: "", category_id: "", date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Trinti operaciją?")) {
      await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      fetchData();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-left">
      <header className="flex justify-between items-center mb-8 bg-[#0D1126] p-6 rounded-2xl border border-white/5">
        <h1 className="text-xl font-bold">SVEIKI, {user?.username?.toUpperCase()}</h1>
        <button onClick={onLogout} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-bold">LOGOUT</button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORMA */}
        <div className="lg:col-span-1 bg-[#0D1126] p-6 rounded-3xl border border-white/5 h-fit">
          <h2 className="text-sm font-bold text-blue-400 mb-6 uppercase tracking-widest">{editingId ? 'Redaguoti' : 'Pridėti įrašą'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="number" placeholder="Suma" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10" required />
            <input type="text" placeholder="Aprašymas" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10" required />
            <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10" required>
              <option value="">Pasirinkti kategoriją</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10" required />
            <button className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
              {editingId ? 'Atnaujinti' : 'Išsaugoti'}
            </button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({amount:"", description:"", category_id:"", date: ""})}} className="w-full text-xs opacity-50">Atšaukti</button>}
          </form>
        </div>

        {/* SĄRAŠAS */}
        <div className="lg:col-span-2 bg-[#0D1126] p-6 rounded-3xl border border-white/5">
          <h2 className="text-sm font-bold text-blue-400 mb-6 uppercase tracking-widest">Paskutinės operacijos</h2>
          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map(t => (
              <div key={t?.id} className="bg-[#161B33] p-4 rounded-2xl flex justify-between items-center border border-white/5">
                <div>
                  <div className="font-bold">{t?.description}</div>
                  <div className="text-[10px] opacity-40 uppercase font-black">{t?.category_name} • {t?.date?.split('T')[0]}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${t?.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>{t?.amount} €</span>
                  <button onClick={() => {setEditingId(t.id); setForm({amount: t.amount, description: t.description, category_id: t.category_id, date: t.date?.split('T')[0]})}} className="text-blue-500 text-xs">Redaguoti</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs">Trinti</button>
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20">Nėra jokių įrašų</div>}
          </div>
        </div>
      </div>
    </div>
  );
}