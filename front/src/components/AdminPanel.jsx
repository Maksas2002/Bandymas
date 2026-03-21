import React, { useState, useEffect } from "react";
import { API_URL } from "../constants";
import { getAuthHeaders } from "../utils/auth";

export default function AdminPanel({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/categories`, { 
        headers: getAuthHeaders() 
      });
      if (res.ok) {
        const data = await res.json();
        // Užtikriname, kad turime masyvą, net jei serveris grąžintų klaidą
        setCategories(Array.isArray(data) ? data : []); 
      }
    } catch (e) {
      console.error("Klaida kraunant kategorijas:", e);
      setCategories([]); // Jei klaida, nustatome tuščią sąrašą
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const addCat = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, type })
      });
      if (res.ok) {
        setName("");
        fetchCats();
      }
    } catch (e) {
      alert("Nepavyko pridėti kategorijos");
    }
  };

  const deleteCat = async (id) => {
    if (!id) return; // Apsauga, jei id netyčia būtų undefined
    if (!window.confirm("Ar tikrai norite ištrinti šią kategoriją?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { 
        method: "DELETE", 
        headers: getAuthHeaders() 
      });
      if (res.ok) fetchCats();
    } catch (e) {
      alert("Klaida trinant");
    }
  };

  return (
    <div className="min-h-screen bg-[#03061C] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Viršutinė juosta */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-[#0D1126] p-6 rounded-3xl border border-white/5 shadow-2xl gap-4">
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-white">ADMIN <span className="text-blue-500">PANEL</span></h1>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Logged in as: {user?.username || 'Administrator'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-red-500/10 text-red-500 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 transition border border-red-500/20"
          >
            LOGOUT
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Kairė pusė: Pridėjimo forma */}
          <section className="lg:col-span-1">
            <div className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 shadow-xl text-left">
              <h2 className="text-lg font-bold mb-6 text-white">Create Category</h2>
              <form onSubmit={addCat} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase mb-2 block">Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Groceries" 
                    className="w-full bg-[#161B33] p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase mb-2 block">Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)} 
                    className="w-full bg-[#161B33] p-4 rounded-xl border border-white/10 outline-none text-white appearance-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 mt-4 text-white"
                >
                  Add Category
                </button>
              </form>
            </div>
          </section>

          {/* Dešinė pusė: Sąrašas su apsauga nuo lūžimo */}
          <section className="lg:col-span-2">
            <div className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 shadow-xl text-left min-h-[400px]">
              <h2 className="text-lg font-bold mb-6 text-white">System Categories</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-white/20 font-bold tracking-widest animate-pulse">
                  LOADING DATA...
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map(c => (
                    // Pridėtos apsaugos c?.id ir c?.name
                    <div key={c?.id || Math.random()} className="bg-[#161B33] p-5 rounded-2xl flex justify-between items-center border border-white/5 group hover:border-white/10 transition">
                      <div>
                        <div className="font-bold text-sm text-white">{c?.name || "Unnamed"}</div>
                        <div className={`text-[10px] uppercase font-black tracking-widest ${c?.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {c?.type || "expense"}
                        </div>
                      </div>
                      <button 
                        onClick={() => c?.id && deleteCat(c.id)} 
                        className="text-white/10 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition"
                        title="Delete category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-white/20 uppercase text-xs font-bold">
                  No categories found. Create your first one.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}