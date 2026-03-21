import React, { useState, useEffect } from "react";
import { API_URL } from "../constants";
import { setToken } from "../utils/auth"; // Pridėk šį importą viršuje

export default function AuthPage({ onAuthSuccess, onBack, initialMode }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => { setIsLogin(initialMode === "login"); }, [initialMode]);

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
      // PERDUODAME VISĄ OBJEKTĄ Į APP.JSX
      onAuthSuccess(data.user); 
    } else {
      alert(data.message || "Klaida prisijungiant");
    }
  } catch (err) {
    alert("Serverio klaida");
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#03061C] p-6">
      <div className="w-full max-w-[420px] space-y-8 bg-[#0D1126] p-12 rounded-3xl border border-white/5 shadow-2xl text-left text-white">
        <h2 className="text-4xl font-bold tracking-tight text-center">{isLogin ? "Sign In" : "Sign Up"}</h2>
        <div className="space-y-5">
          {!isLogin && (
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Full Name" 
              className="w-full bg-[#161B33] p-4 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition text-white" 
            />
          )}
          <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email Address" 
            className="w-full bg-[#161B33] p-4 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition text-white" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            className="w-full bg-[#161B33] p-4 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition text-white" 
          />
          <button 
            onClick={handleSubmit} 
            className="w-full bg-[#4169E1] py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/20 text-white"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
          <div className="text-center space-y-3">
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 text-sm hover:underline">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            <br />
            <button onClick={onBack} className="text-white/20 text-xs hover:text-white transition">Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}