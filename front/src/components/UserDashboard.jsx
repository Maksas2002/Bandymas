import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_URL, DASHBOARD_COLORS } from "../constants";
import { getAuthHeaders } from "../utils/auth";
import { StatCard } from "./ui/StatCard";
import { TransactionRow, BudgetBar } from "./ui/Rows";
import { TransactionModal, BudgetModal } from "./modals/Modals";

export default function UserDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [activeType, setActiveType] = useState("expense");

  const loadData = () => {
    // Naudojame saugius headerius visoms užklausoms
    const headers = getAuthHeaders();

    fetch(`${API_URL}/transactions/${user.id}`, { headers })
      .then(res => res.json())
      .then(setTransactions)
      .catch(err => console.error("Error loading transactions:", err));

    fetch(`${API_URL}/categories`, { headers })
      .then(res => res.json())
      .then(setCategories);

    fetch(`${API_URL}/budgets/${user.id}`, { headers })
      .then(res => res.json())
      .then(setBudgets);
  };

  useEffect(() => { loadData(); }, [user.id]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await fetch(`${API_URL}/transactions/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders() 
      });
      loadData();
    }
  };

  const openAddModal = (type) => {
    setActiveType(type);
    setIsTransactionModalOpen(true);
  };

  // Skaičiavimai dashboardui
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalInc - totalExp;

  const chartData = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    const catName = t.category_name || "General";
    const existing = acc.find(i => i.name === catName);
    if (existing) { existing.value += Number(t.amount); } 
    else { acc.push({ name: catName, value: Number(t.amount) }); }
    return acc;
  }, []);

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-10 text-left">
      <header className="flex justify-between items-center bg-[#0D1126] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">My Dashboard</h1>
          <p className="text-xs text-white/30 uppercase mt-1">Personal Finance Overview</p>
        </div>
        <button onClick={onLogout} className="bg-red-500/10 text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 transition">Log Out</button>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-white">
        <h2 className="text-4xl font-extrabold tracking-tight">Welcome, {user.username}!</h2>
        <div className="flex gap-3">
          <button onClick={() => openAddModal("income")} className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-green-500/20">+ Add Income</button>
          <button onClick={() => openAddModal("expense")} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-blue-500/20">+ Add Expense</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white">
        <StatCard title="Balance" value={`€${balance.toFixed(2)}`} icon="💳" />
        <StatCard title="Income" value={`€${totalInc.toFixed(2)}`} icon="📈" />
        <StatCard title="Expenses" value={`€${totalExp.toFixed(2)}`} icon="📉" />
        <StatCard title="Savings Rate" value={`${totalInc > 0 ? ((balance/totalInc)*100).toFixed(0) : 0}%`} icon="🎯" isProgress />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 shadow-2xl min-h-[400px]">
            <h3 className="text-xl font-bold mb-8 text-white">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.length > 0 ? transactions.map(t => <TransactionRow key={t.id} t={t} onDelete={handleDelete} />) : <p className="text-white/20 italic">No transactions yet.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 shadow-2xl h-[350px]">
            <h3 className="text-xl font-bold mb-4 text-center text-white">Expense Split</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((e, i) => <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#161B33', border: 'none', borderRadius: '12px', color: 'white' }}/>
              </PieChart>
            </ResponsiveContainer>
          </section>

          <section className="bg-[#0D1126] p-8 rounded-3xl border border-white/5 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Budgets</h3>
              <button onClick={() => setIsBudgetModalOpen(true)} className="text-blue-400 text-xs font-bold hover:underline">Settings</button>
            </div>
            <div className="space-y-6">
              {budgets.length > 0 ? budgets.map(b => <BudgetBar key={b.id} {...b} />) : <p className="text-white/20 text-sm">No limits set.</p>}
            </div>
          </section>
        </div>
      </div>

      {/* Modalai naudoja tą pačią loadData funkciją atnaujinimui */}
      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} categories={categories} userId={user.id} onSave={loadData} />
      <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} type={activeType} categories={categories.filter(c => c.type === activeType)} userId={user.id} onSave={loadData} />
    </div>
  );
}