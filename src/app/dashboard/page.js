'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import UploadSection from '../../components/UploadSection'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, saveProject, deleteProject } = useAuth()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentData, setCurrentData] = useState(null)

  useEffect(function() {
    if (!user) router.push('/auth')
  }, [user, router])

  function handleProcessData(file, projectName) {
    setIsProcessing(true)
    var reader = new FileReader()
    reader.onload = function(e) {
      var text = e.target.result || ''
      if (!text) { alert('File is empty!'); setIsProcessing(false); return }
      text = text.replace(/^\uFEFF/, '')
      var currency = '$'
      if (text.indexOf('₹') > -1) currency = '₹'
      
      var lines = text.split('\n')
      var items = []
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim()
        if (!line) continue
        var parts = line.split(/[\t,;]+/)
        if (parts.length < 2) continue
        var amount = 0, name = 'Item', category = 'General'
        for (var j = 0; j < parts.length; j++) {
          var val = parts[j].trim()
          var num = val.replace(/[^0-9.]/g, '')
          if (num && num !== '.') {
            var parsed = parseFloat(num)
            if (parsed > 0 && parsed < 10000000) { amount = parsed
              if (j === 0) name = parts[0].trim()
              if (j === 1) category = parts[1].trim()
            }
          }
        }
        if (amount > 0) items.push({id: items.length + 1, name: name, amount: amount, category: category, date: new Date().toISOString().split('T')[0]})
      }
      if (items.length === 0) { alert('No valid data!'); setIsProcessing(false); return }
      var total = items.reduce(function(s, i) { return s + i.amount }, 0)
      var cats = {}
      items.forEach(function(i) { var c = i.category; if (!cats[c]) cats[c] = 0; cats[c] += i.amount })
      var topCat = 'General', maxV = 0
      Object.keys(cats).forEach(function(c) { if (cats[c] > maxV) { maxV = cats[c]; topCat = c } })
      var avg = items.length > 0 ? total / items.length : 0
      
      var data = { name: projectName, items: items, insights: { total: total, topCategory: topCat, avgPerItem: avg, highestExpense: maxV, categoryCount: Object.keys(cats).length, totalItems: items.length }, currency: currency }
      saveProject(data)
      setCurrentData(data)
      setIsProcessing(false)
      setShowResults(true)
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleGoHome() { router.push('/') }
  function handleDelete() { if (currentData && confirm('Delete?')) { if (currentData.id) deleteProject(currentData.id); router.push('/') } }
  function handleShare() {
    if (!currentData) return
    var data = { n: currentData.name, t: Math.round(currentData.insights.total), c: currentData.currency, k: currentData.insights.topCategory, a: Math.round(currentData.insights.avgPerItem), cnt: currentData.items.length }
    var link = window.location.origin + '/s/' + btoa(JSON.stringify(data)).replace(/=/g, '')
    var choice = prompt('Share: 1=Link, 2=WhatsApp, 3=Telegram')
    if (choice === '1') { navigator.clipboard.writeText(link); alert('Copied!'); }
    else if (choice === '2') window.open('https://wa.me/?text=' + encodeURIComponent(link), '_blank')
    else if (choice === '3') window.open('https://t.me/share/url?url=' + link, '_blank')
  }

  if (!user) return null
  
  if (showResults && currentData) {
    var chartData = {}
    currentData.items.forEach(function(i) { var c = i.category; if (!chartData[c]) chartData[c] = 0; chartData[c] += i.amount })
    var keys = Object.keys(chartData)
    var totalA = currentData.insights.total
    var maxV = Math.max.apply(null, Object.values(chartData))
    var pieCols = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
    var barCols = ['from-blue-500', 'from-green-500', 'from-purple-500', 'from-orange-500', 'from-red-500']

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span className="text-white font-semibold">👤 {user.name}</span>
            <button onClick={logout} className="text-white/70 hover:text-white">🚪</button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={handleGoHome} className="px-6 py-3 rounded-xl bg-gray-700 text-white">🏠 Home</button>
          <button onClick={function() { setShowResults(false); setCurrentData(null) }} className="px-6 py-3 rounded-xl bg-blue-500 text-white">➕ New</button>
          <button onClick={handleShare} className="px-6 py-3 rounded-xl bg-green-500 text-white">📤 Share</button>
          <button onClick={handleDelete} className="px-6 py-3 rounded-xl bg-red-500 text-white">🗑️</button>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-5xl font-bold text-white text-center mb-2">{currentData.name}</h2>
          <p className="text-purple-300 text-center mb-8">Analysis Report</p>
          
          {/* SUMMARY */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500 p-6 rounded-2xl text-center"><p className="text-4xl font-bold text-white">{currentData.currency}{currentData.insights.total}</p><p className="text-blue-200">Total</p></div>
              <div className="bg-red-500 p-6 rounded-2xl text-center"><p className="text-4xl font-bold text-white">{currentData.insights.topCategory}</p><p className="text-red-200">Biggest</p></div>
              <div className="bg-green-500 p-6 rounded-2xl text-center"><p className="text-4xl font-bold text-white">{currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p><p className="text-green-200">Save</p></div>
              <div className="bg-purple-500 p-6 rounded-2xl text-center"><p className="text-4xl font-bold text-white">{currentData.items.length}</p><p className="text-purple-200">Items</p></div>
            </div>
          </div>
          
          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Pie Chart</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {keys.map(function(k, i) { var v = chartData[k], p = totalA > 0 ? (v / totalA) * 100 : 0, c = pieCols[i % pieCols.length], s = Math.max(70, Math.min(140, p + 20)); return <div key={k} className="text-center"><div className={c + ' rounded-full flex items-center justify-center text-white font-bold'} style={{width: s + 'px', height: s + 'px'}}>{p.toFixed(0)}%</div><p className="mt-2 text-white">{k}</p><p className="text-purple-300">{currentData.currency}{v}</p></div> })}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Bar Chart</h3>
              <div className="space-y-4">
                {keys.map(function(k, i) { var v = chartData[k], p = maxV > 0 ? (v / maxV) * 100 : 0, c = barCols[i % barCols.length]; return <div key={k}><div className="flex justify-between"><span className="text-white">{k}</span><span className="text-purple-300">{currentData.currency}{v}</span></div><div className="w-full bg-white/20 rounded-full h-6"><div className={'bg-gradient-to-r ' + c + ' h-6 rounded-full'} style={{width: p + '%'}}></div></div></div> })}
              </div>
            </div>
          </div>
          
          {/* ADVICE */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-500/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-400 mb-4 text-center">What to Do</h3>
              <ul className="text-white space-y-2"><li>✔ Track daily expenses</li><li>✔ Set monthly budget</li><li>✔ Review categories</li><li>✔ Save 20% income</li><li>✔ Compare prices</li></ul>
            </div>
            <div className="bg-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4 text-center">What Not to Do</h3>
              <ul className="text-white space-y-2"><li>✘ Overspend on {currentData.insights.topCategory}</li><li>✘ Buy unnecessary</li><li>✘ Ignore expenses</li><li>✘ Spend more than earn</li></ul>
            </div>
          </div>
          
          {/* ACTION PLAN */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Action Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-500/30 p-4 rounded-xl"><h4 className="font-bold text-blue-400 mb-2 text-center">This Week</h4><ul className="text-white text-sm"><li>Track daily</li><li>Reduce 10%</li></ul></div>
              <div className="bg-purple-500/30 p-4 rounded-xl"><h4 className="font-bold text-purple-400 mb-2 text-center">This Month</h4><ul className="text-white text-sm"><li>Stay under budget</li><li>Set goal</li></ul></div>
              <div className="bg-green-500/30 p-4 rounded-xl"><h4 className="font-bold text-green-400 mb-2 text-center">This Quarter</h4><ul className="text-white text-sm"><li>Reduce costs</li><li>Increase savings</li></ul></div>
            </div>
          </div>
          
          {/* RECOMMENDATION */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Recommendation</h3>
            <div className="text-white space-y-2"><p>Total: {currentData.currency}{currentData.insights.total}</p><p>Biggest: {currentData.insights.topCategory}</p><p>Average: {currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p><p>Save 15%: {currentData.currency}{(currentData.insights.highestExpense * 0.15).toFixed(0)}</p></div>
          </div>
          
          {/* TABLE */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">All Transactions</h3>
            <table className="w-full"><thead className="bg-white/20 text-white"><tr><th className="p-3">#</th><th className="p-3 text-left">Item</th><th className="p-3 text-left">Category</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>
              {currentData.items.map(function(item, i) { return <tr key={item.id} className="border-b border-white/10"><td className="p-3 text-white text-center">{i + 1}</td><td className="p-3 text-white">{item.name}</td><td className="p-3 text-white">{item.category}</td><td className="p-3 text-white text-right">{currentData.currency}{item.amount}</td></tr> })}
            </tbody></table>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="bg-white shadow-sm py-3"><div className="max-w-7xl mx-auto px-4 flex justify-between items-center"><span className="font-medium">{user.name}</span><button onClick={logout}>Logout</button></div></div>
      <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
      <div className="text-center py-8"><button onClick={handleGoHome} className="bg-gray-200 px-6 py-3 rounded-lg">Home</button></div>
      <Footer />
    </main>
  )
}