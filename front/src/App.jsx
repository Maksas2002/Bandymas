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

  useEffect(() => {
    const initApp = async () => {
      const token = getToken();
      
      // 1. Jei tokeno nėra, iškart baigiame krovimą ir rodome Landing
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 2. Bandome gauti vartotoją, bet pasiruošiame klaidai
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        // 3. Jei serveris randa vartotoją (200 OK)
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setView("dashboard");
        } else {
          // 4. Jei gauname 404 ar kitą klaidą - tiesiog išvalome sesiją
          console.warn("Sesija negalioja arba maršrutas nerastas (404)");
          removeToken();
          setView("landing");
        }
      } catch (err) {
        // 5. Jei serveris išvis neatsako (tinklo klaida)
        console.error("Tinklo klaida:", err);
        setView("landing");
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // LOADING būsena, kad nebūtų tuščias ekranas
  if (loading) {
    return (
      <div className="min-h-screen bg-[#03061C] flex items-center justify-center">
        <div className="text-white opacity-20 animate-pulse font-bold tracking-widest">
          NEST IS LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03061C] text-white">
      {/* Rodome LandingPage tik jei esame toje būsenoje */}
      {view === "landing" && (
        <LandingPage 
          onGetStarted={() => setView("auth")} 
          onLogin={() => setView("auth")} 
        />
      )}

      {/* Rodome AuthPage */}
      {view === "auth" && (
        <AuthPage 
          onAuthSuccess={(u) => { setUser(u); setView("dashboard"); }} 
          onBack={() => setView("landing")} 
          initialMode="login"
        />
      )}

      {/* Rodome Dashboard tik jei TURIME vartotoją (apsauga nuo 'id' klaidos) */}
      {view === "dashboard" && user && (
        user.role === "admin" 
          ? <AdminPanel user={user} onLogout={() => { removeToken(); setUser(null); setView("landing"); }} />
          : <UserDashboard user={user} onLogout={() => { removeToken(); setUser(null); setView("landing"); }} />
      )}
    </div>
  );
}