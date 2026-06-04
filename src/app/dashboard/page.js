"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [renameId, setRenameId] = useState(null);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (user) {
      fetchAnalyses();
    }
  }, [user, loading]);

  const fetchAnalyses = async () => {
    const q = query(
      collection(db, "users", user.uid, "analyses"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAnalyses(data);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      await deleteDoc(doc(db, "users", user.uid, "analyses", id));
      fetchAnalyses();
    }
  };

  const handleRename = async (id) => {
    if (newName.trim()) {
      await updateDoc(doc(db, "users", user.uid, "analyses", id), {
        fileName: newName,
      });
      setRenameId(null);
      setNewName("");
      fetchAnalyses();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Link
          href="/upload"
          className="bg-cyan-500 px-6 py-3 rounded hover:bg-cyan-600"
        >
          + New Analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center p-10 bg-slate-800 rounded-lg">
          <p className="text-gray-400 mb-4">No analyses yet</p>
          <Link href="/upload" className="text-cyan-400">
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((item) => (
            <div key={item.id} className="bg-slate-800 p-6 rounded-lg">
              {renameId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="w-full p-2 bg-slate-700 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRename(item.id)}
                      className="bg-green-500 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenameId(null)}
                      className="bg-gray-500 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">{item.fileName}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Created: {formatDate(item.createdAt)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/${item.id}`}
                      className="bg-cyan-500 px-4 py-2 rounded hover:bg-cyan-600"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setRenameId(item.id);
                        setNewName(item.fileName);
                      }}
                      className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}