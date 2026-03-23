import React, { useState } from "react";
import { API_URL } from "../constants";

export default function AuthPage({ onAuthSuccess, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        onAuthSuccess(data.user);
      } else {
        alert(data.error || "Klaida");
      }
    } catch (err) {
      alert("Serverio klaida");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03061C] p-6">
      <div className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl text-center">
        <h2 className="text-3xl font-black mb-6 italic">{isLogin ? "SIGN IN" : "SIGN UP"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full bg-[#161B33] p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500"
            placeholder="Username" 
            value={formData.username} 
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required 
          />
          {!isLogin && (
            <input 
              className="w-full bg-[#161B33] p-4 rounded-xl border border-white/10 outline-none"
              placeholder="Email" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          )}
          <input 
            className="w-full bg-[#161B33] p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500"
            placeholder="Password" 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button className="w-full bg-blue-600 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20">{isLogin ? "Login" : "Register"}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-xs text-white/30 uppercase tracking-widest hover:text-white transition">
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}