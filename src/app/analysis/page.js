"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Chart from "chart.js/auto";

export default function Analysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentAnalysis");
    if (stored) {
      setAnalysis(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (analysis && !loading) {
      setTimeout(() => createCharts(), 100);
    }
  }, [analysis, loading]);

  const createCharts = () => {
    const pieCtx = document.getElementById("pieChart");
    if (pieCtx && analysis?.expenses) {
      new Chart(pieCtx, {
        type: "doughnut",
        data: {
          labels: analysis.expenses.map((e) => e.category),
          datasets: [{
            data: analysis.expenses.map((e) => e.amount),
            backgroundColor: ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#6366f1"],
          }],
        },
        options: { responsive: true, plugins: { legend: { position: "bottom", labels: { color: "white" } } } },
      });
    }

    const lineCtx = document.getElementById("lineChart");
    if (lineCtx && analysis?.expenses) {
      new Chart(lineCtx, {
        type: "bar",
        data: {
          labels: analysis.expenses.map((e) => e.category),
          datasets: [{ label: "Expenses", data: analysis.expenses.map((e) => e.amount), backgroundColor: "#06b6d4" }],
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: "white" } } },
          scales: {
            y: { ticks: { color: "white" }, grid: { color: "#334155" } },
            x: { ticks: { color: "white" }, grid: { color: "#334155" } },
          },
        },
      });
    }
  };

  const shareToWhatsApp = () => {
    if (!analysis) return;
    const text = `Total: $${analysis.totalSpent}, Avg: $${analysis.avgCost}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToEmail = () => {
    if (!analysis) return;
    window.location.href = `mailto:?subject=AI Analysis&body=Total: $${analysis.totalSpent}`;
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!analysis) return <div className="text-center p-10"><p>No analysis found</p><Link href="/dashboard" className="text-cyan-400">Go to Dashboard</Link></div>;

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <Link href="/dashboard" className="bg-cyan-500 px-4 py-2 rounded">Back</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-gray-400">Total</h3><p className="text-3xl text-cyan-400">${analysis.totalSpent}</p></div>
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-gray-400">Biggest</h3><p>{analysis.biggestExpense?.category}</p><p className="text-cyan-400">${analysis.biggestExpense?.amount}</p></div>
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-gray-400">Average</h3><p className="text-3xl text-cyan-400">${analysis.avgCost}</p></div>
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-gray-400">Transactions</h3><p className="text-3xl text-cyan-400">{analysis.transactions?.length}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-xl font-bold mb-4">Pie Chart</h3><canvas id="pieChart"></canvas></div>
        <div className="bg-slate-800 p-6 rounded-lg"><h3 className="text-xl font-bold mb-4">Bar Chart</h3><canvas id="lineChart"></canvas></div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">Advice</h3>
        <ul>{analysis.advice?.map((item, i) => (<li key={i}>{item}</li>))}</ul>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">Share</h3>
        <div className="flex gap-4">
          <button onClick={shareToWhatsApp} className="bg-green-500 px-6 py-3 rounded">WhatsApp</button>
          <button onClick={shareToEmail} className="bg-red-500 px-6 py-3 rounded">Email</button>
        </div>
      </div>
    </div>
  );
}