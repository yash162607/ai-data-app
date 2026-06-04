"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Chart from "chart.js/auto";

export default function Analysis() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const docId = searchParams.get("id");

  useEffect(() => {
    const stored = localStorage.getItem("currentAnalysis");
    if (stored) {
      setAnalysis(JSON.parse(stored));
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (analysis && !loading) {
      setTimeout(() => createCharts(), 100);
    }
  }, [analysis, loading]);

  const createCharts = () => {
    // Pie Chart
    const pieCtx = document.getElementById("pieChart");
    if (pieCtx && analysis.expenses) {
      new Chart(pieCtx, {
        type: "doughnut",
        data: {
          labels: analysis.expenses.map((e) => e.category),
          datasets: [
            {
              data: analysis.expenses.map((e) => e.amount),
              backgroundColor: [
                "#06b6d4",
                "#8b5cf6",
                "#f59e0b",
                "#10b981",
                "#f43f5e",
                "#6366f1",
                "#ec4899",
                "#14b8a6",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom", labels: { color: "white" } },
          },
        },
      });
    }

    // Line Chart
    const lineCtx = document.getElementById("lineChart");
    if (lineCtx && analysis.expenses) {
      new Chart(lineCtx, {
        type: "bar",
        data: {
          labels: analysis.expenses.map((e) => e.category),
          datasets: [
            {
              label: "Expenses by Category",
              data: analysis.expenses.map((e) => e.amount),
              backgroundColor: "#06b6d4",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: "white" } },
          },
          scales: {
            y: { ticks: { color: "white" }, grid: { color: "#334155" } },
            x: { ticks: { color: "white" }, grid: { color: "#334155" } },
          },
        },
      });
    }
  };

  const shareToWhatsApp = () => {
    const text = `📊 AI Data Analysis\n\n💰 Total Spent: $${analysis.totalSpent}\n📊 Average Cost: $${analysis.avgCost}\n🔴 Biggest: ${analysis.biggestExpense?.category} ($${analysis.biggestExpense?.amount})\n📝 Transactions: ${analysis.transactions?.length || 0}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToTelegram = () => {
    const text = `📊 AI Data Analysis\n\nTotal Spent: $${analysis.totalSpent}\nAverage Cost: $${analysis.avgCost}\nBiggest: ${analysis.biggestExpense?.category}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToEmail = () => {
    const subject = "My AI Data Analysis Results";
    const body = `Total Spent: $${analysis.totalSpent}\nAverage Cost: $${analysis.avgCost}\nBiggest Expense: ${analysis.biggestExpense?.category} ($${analysis.biggestExpense?.amount})\n\nTransactions:\n${analysis.transactions?.map(t => `- ${t.description}: $${t.amount}`).join("\n")}`;
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const shareToSMS = () => {
    const text = `AI Analysis: Total $${analysis.totalSpent}, Avg $${analysis.avgCost}, Biggest ${analysis.biggestExpense?.category}`;
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!analysis) {
    return (
      <div className="text-center p-10">
        <p className="mb-4">No analysis found</p>
        <Link href="/dashboard" className="text-cyan-400">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 Analysis Results</h1>
        <Link href="/dashboard" className="bg-cyan-500 px-4 py-2 rounded hover:bg-cyan-600">
          Back to Dashboard
        </Link>
      </div>

      {/* Quick Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Spent</h3>
          <p className="text-3xl font-bold text-cyan-400">${analysis.totalSpent}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Biggest Expense</h3>
          <p className="text-lg font-bold">{analysis.biggestExpense?.category || "N/A"}</p>
          <p className="text-cyan-400">${analysis.biggestExpense?.amount || 0}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Average Cost</h3>
          <p className="text-3xl font-bold text-cyan-400">${analysis.avgCost}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Transactions</h3>
          <p className="text-3xl font-bold text-cyan-400">{analysis.transactions?.length || 0}</p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">🥧 Pie Chart - Expense Distribution</h3>
          <canvas id="pieChart" ref={chartRef}></canvas>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">📊 Bar Chart - By Category</h3>
          <canvas id="lineChart"></canvas>
        </div>
      </div>

      {/* Advice */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">💡 Advice for You</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-red-400 mb-2">❌ What Not to Do</h4>
            <ul className="space-y-2">
              {analysis.advice?.slice(0, 2).map((item, i) => (
                <li key={i} className="text-gray-300 flex items-center gap-2">
                  <span>⛔</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-green-400 mb-2">✅ What to Do</h4>
            <ul className="space-y-2">
              {analysis.advice?.slice(2).map((item, i) => (
                <li key={i} className="text-gray-300 flex items-center gap-2">
                  <span>✅</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">📅 Action Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-bold text-cyan-400 mb-2">This Week</h4>
            <ul className="space-y-2">
              {analysis.actionPlan?.weekly?.map((item, i) => (
                <li key={i} className="text-gray-300">📌 {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-bold text-purple-400 mb-2">This Month</h4>
            <ul className="space-y-2">
              {analysis.actionPlan?.monthly?.map((item, i) => (
                <li key={i} className="text-gray-300">📌 {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-bold text-yellow-400 mb-2">This Quarter</h4>
            <ul className="space-y-2">
              {analysis.actionPlan?.quarterly?.map((item, i) => (
                <li key={i} className="text-gray-300">📌 {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* All Transactions */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">📋 All Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-3 text-left">No.</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {analysis.transactions?.slice(0, 20).map((t, i) => (
                <tr key={i} className="border-b border-slate-700">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3">
                    <span className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-3 text-red-400">${t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">📝 Summary</h3>
        <p className="text-gray-300">
          Based on your data analysis, you spent a total of <span className="text-cyan-400 font-bold">${analysis.totalSpent}</span> across{" "}
          <span className="text-cyan-400 font-bold">{analysis.transactions?.length || 0}</span> transactions.
          Your biggest expense category was <span className="text-red-400 font-bold">{analysis.biggestExpense?.category}</span> costing around{" "}
          <span className="text-red-400 font-bold">${analysis.biggestExpense?.amount}</span>.
          Consider reviewing your {analysis.biggestExpense?.category} spending to optimize your budget.
        </p>
      </div>

      {/* Share Buttons */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">📤 Share Results</h3>
        <div className="flex gap-4 flex-wrap">
          <button onClick={shareToWhatsApp} className="bg-green-500 px-6 py-3 rounded hover:bg-green-600 flex items-center gap-2">
            <span>💬</span> WhatsApp
          </button>
          <button onClick={shareToTelegram} className="bg-blue-500 px-6 py-3 rounded hover:bg-blue-600 flex items-center gap-2">
            <span>✈️</span> Telegram
          </button>
          <button onClick={shareToEmail} className="bg-red-500 px-6 py-3 rounded hover:bg-red-600 flex items-center gap-2">
            <span>📧</span> Email
          </button>
          <button onClick={shareToSMS} className="bg-yellow-500 px-6 py-3 rounded hover:bg-yellow-600 flex items-center gap-2">
            <span>💌</span> Message
          </button>
        </div>
      </div>
    </div>
  );
}