"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function Upload() {
  const { user, loading } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const analyzeData = (data) => {
    // Calculate totals, averages, etc.
    let totalSpent = 0;
    const expenses = {};
    const transactions = [];

    data.forEach((row) => {
      const amount = parseFloat(row.Amount || row.amount || row.AMOUNT || 0);
      const description = row.Description || row.description || row.Description || "Unknown";
      const category = row.Category || row.category || "Other";

      if (!isNaN(amount)) {
        totalSpent += Math.abs(amount);
        expenses[category] = (expenses[category] || 0) + Math.abs(amount);
        transactions.push({ description, amount, category });
      }
    });

    const avgCost = data.length > 0 ? totalSpent / data.length : 0;
    const biggestExpense = Object.entries(expenses).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSpent: totalSpent.toFixed(2),
      avgCost: avgCost.toFixed(2),
      biggestExpense: biggestExpense ? { category: biggestExpense[0], amount: biggestExpense[1].toFixed(2) } : null,
      expenses: Object.entries(expenses).map(([category, amount]) => ({
        category,
        amount: amount.toFixed(2),
      })),
      transactions: transactions.slice(0, 50),
      advice: generateAdvice(totalSpent, avgCost),
      actionPlan: generateActionPlan(totalSpent),
    };
  };

  const generateAdvice = (total, avg) => {
    const advice = [];
    if (total > 10000) advice.push("⚠️ Your expenses are high. Consider reducing discretionary spending.");
    if (avg > 1000) advice.push("💡 Average cost is high. Look for cheaper alternatives.");
    advice.push("✅ Track your expenses weekly to stay on budget.");
    advice.push("💰 Save at least 20% of your income for emergencies.");
    return advice;
  };

  const generateActionPlan = (total) => ({
    weekly: ["Review all subscriptions", "Set a weekly budget limit"],
    monthly: ["Analyze spending patterns", "Cut non-essential expenses"],
    quarterly: ["Review financial goals", "Adjust budget if needed"],
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const analysis = analyzeData(jsonData);

        // Save to Firebase
        const docRef = await addDoc(collection(db, "users", user.uid, "analyses"), {
          fileName: fileName || "Untitled",
          originalFileName: file.name,
          analysis: analysis,
          createdAt: serverTimestamp(),
        });

        setUploading(false);
        router.push(`/dashboard/${docRef.id}`);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <div className="bg-slate-800 p-8 rounded-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Data</h1>
        
        <div className="mb-6">
          <label className="block mb-2">File Name (optional)</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter a name for your analysis"
            className="w-full p-3 bg-slate-700 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Upload Excel/CSV File</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="w-full p-3 bg-slate-700 rounded"
          />
        </div>

        <p className="text-gray-400 mb-4">
          Your file should have columns like: Amount, Description, Category
        </p>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-cyan-500 py-3 rounded hover:bg-cyan-600 disabled:bg-gray-500"
        >
          {uploading ? "Analyzing..." : "Start Analysis"}
        </button>
      </div>
    </div>
  );
}