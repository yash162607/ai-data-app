import UploadSection from '../../components/UploadSection'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!user) router.push('/auth')
  }, [user])

  function processFile(file, name) {
    setProcessing(true)
    const reader = new FileReader()
    reader.onload = function(e) {
      const text = e.target.result.replace(/^\uFEFF/, '')
      if (!text) { setProcessing(false); alert('Empty!'); return }
      
      const currency = text.includes('₹') ? '₹' : '$'
      const items = []
      text.split('\n').forEach(line => {
        const parts = line.trim().split(/[\t,;]+/)
        if (parts.length >= 2) {
          const num = parts[parts.length - 1].replace(/[^0-9.]/g, '')
          const amt = parseFloat(num)
          if (amt > 0) {
            items.push({ id: items.length + 1, name: parts[0], category: parts[1] || 'General', amount: amt })
          }
        }
      })

      if (items.length === 0) { setProcessing(false); alert('No data!'); return }
      
      const total = items.reduce((s, i) => s + i.amount, 0)
      const catTotals = {}
      items.forEach(i => { catTotals[i.category] = (catTotals[i.category] || 0) + i.amount })
      const topCat = Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b, 'General')
      
      setData({ name, items, total, topCategory: topCat, avg: total / items.length, currency })
      setProcessing(false)
      setResults(true)
    }
    reader.readAsText(file, 'UTF-8')
  }

  if (!user) return null

  if (results && data) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="p-8 text-white">
          <div className="flex gap-4 mb-8">
            <button onClick={() => router.push('/')} className="bg-gray-700 px-4 py-2 rounded">Home</button>
            <button onClick={() => { setResults(false); setData(null) }} className="bg-blue-600 px-4 py-2 rounded">New</button>
          </div>
          <h1 className="text-3xl text-center mb-6">{data.name}</h1>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-600 p-4 rounded text-center"><div className="text-2xl">{data.currency}{data.total}</div><div>Total</div></div>
            <div className="bg-red-600 p-4 rounded text-center"><div className="text-2xl">{data.topCategory}</div><div>Top</div></div>
            <div className="bg-green-600 p-4 rounded text-center"><div className="text-2xl">{data.currency}{data.avg.toFixed(0)}</div><div>Avg</div></div>
            <div className="bg-purple-600 p-4 rounded text-center"><div className="text-2xl">{data.items.length}</div><div>Items</div></div>
          </div>
          <table className="w-full bg-slate-800">
            <thead className="bg-slate-700"><tr><th className="p-2">#</th><th className="p-2">Item</th><th className="p-2">Category</th><th className="p-2">Amount</th></tr></thead>
            <tbody>{data.items.map((item, i) => <tr key={item.id} className="border-t border-slate-700"><td className="p-2">{i + 1}</td><td className="p-2">{item.name}</td><td className="p-2">{item.category}</td><td className="p-2">{data.currency}{item.amount}</td></tr>)}</tbody>
          </table>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4 flex justify-between bg-white shadow"><span>{user.name}</span><button onClick={logout}>Logout</button></div>
      <UploadSection onProcessData={processFile} isProcessing={processing} />
      <div className="p-8 text-center"><button onClick={() => router.push('/')} className="bg-gray-200 px-6 py-3 rounded">Home</button></div>
      <Footer />
    </div>
  )
}