import React, { useState, useEffect } from "react";
import { API_URL } from "../constants";
import { getAuthHeaders } from "../utils/auth";

export default function AdminPanel({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const fetchCats = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { headers: getAuthHeaders() });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) { setCategories([]); }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, type })
    });
    if (res.ok) { setName(""); fetchCats(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Trinti kategoriją?")) return;
    await fetch(`${API_URL}/categories/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    fetchCats();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 bg-[#0D1126] p-6 rounded-2xl border border-white/5">
        <h1 className="text-xl font-bold">ADMIN: {user?.username}</h1>
        <button onClick={onLogout} className="text-red-500 font-bold">LOGOUT</button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0D1126] p-6 rounded-2xl border border-white/5">
          <h2 className="mb-4 font-bold uppercase text-xs text-blue-400">Pridėti naują</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Pavadinimas" className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10" required />
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#161B33] p-3 rounded-xl border border-white/10">
              <option value="expense">Išlaidos</option>
              <option value="income">Pajamos</option>
            </select>
            <button className="w-full bg-blue-600 py-3 rounded-xl font-bold">Sukurti</button>
          </form>
        </div>

        <div className="bg-[#0D1126] p-6 rounded-2xl border border-white/5">
          <h2 className="mb-4 font-bold uppercase text-xs text-blue-400">Esamos kategorijos</h2>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c?.id} className="bg-[#161B33] p-4 rounded-xl flex justify-between items-center border border-white/5">
                <span>{c?.name} <small className="opacity-30 ml-2">({c?.type})</small></span>
                <button onClick={() => handleDelete(c.id)} className="text-red-500 opacity-50 hover:opacity-100">🗑</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}