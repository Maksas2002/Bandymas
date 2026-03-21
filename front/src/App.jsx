import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import UserDashboard from "./components/UserDashboard";
import AdminPanel from "./components/AdminPanel";
import { getToken, removeToken } from "./utils/auth";
import { API_URL } from "./constants";

export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funkcija sesijos patikrinimui
  const checkSession = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        console.log("Sesija aktyvi:", userData);
        setUser(userData);
        setView("dashboard");
      } else {
        removeToken();
        setView("landing");
      }
    } catch (err) {
      console.error("Auth patikros klaida:", err);
      setView("landing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#03061C] flex items-center justify-center text-blue-500 font-bold">
      KRAUNAMA...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#03061C] text-white">
      {view === "landing" && (
        <LandingPage onGetStarted={() => setView("auth")} onLogin={() => setView("auth")} />
      )}

      {view === "auth" && (
        <AuthPage 
          onAuthSuccess={(u) => { 
            console.log("Prisijungta sėkmingai:", u);
            setUser(u); 
            setView("dashboard"); 
          }} 
          onBack={() => setView("landing")} 
        />
      )}

      {/* Labai svarbi apsauga: user && view === "dashboard" */}
      {view === "dashboard" && user && (
        user.role === "admin" 
          ? <AdminPanel user={user} onLogout={() => { removeToken(); setUser(null); setView("landing"); }} />
          : <UserDashboard user={user} onLogout={() => { removeToken(); setUser(null); setView("landing"); }} />
      )}
    </div>
  );
}