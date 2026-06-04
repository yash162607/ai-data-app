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
      if (!text) { alert('Empty file!'); setIsProcessing(false); return }
      text = text.replace(/^\uFEFF/, '')
      var currency = '$'
      if (text.indexOf('₹') > -1 || text.indexOf('INR') > -1) currency = '₹'
      else if (text.indexOf('€') > -1) currency = '€'
      else if (text.indexOf('£') > -1) currency = '£'
      
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
            if (parsed > 0 && parsed < 10000000) {
              amount = parsed
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
      
      setCurrentData({ name: projectName, items: items, insights: { total: total, topCategory: topCat, avgPerItem: avg, highestExpense: maxV, categoryCount: Object.keys(cats).length, totalItems: items.length }, currency: currency })
      saveProject(currentData)
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
    else if (choice === '2') window.open('https://wa.me/?text=' + encodeURIComponent('Data: ' + link), '_blank')
    else if (choice === '3') window.open('https://t.me/share/url?url=' + link, '_blank')
  }

  if (!user) return null
  if (showResults && currentData) {
    var chartData = {}
    currentData.items.forEach(function(i) { var c = i.category; if (!chartData[c]) chartData[c] = 0; chartData[c] += i.amount })
    var keys = Object.keys(chartData)
    var totalA = currentData.insights.total
    var maxV = Math.max.apply(null, Object.values(chartData))
    var cols = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500']

    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="bg-white shadow-sm py-3"><div className="max-w-7xl mx-auto px-4 flex justify-between items-center"><span className="font-medium">👤 {user.name}</span><button onClick={logout} className="text-gray-600 text-sm">🚪</button></div></div>
        <div className="max-w-6xl mx-auto px-4 pt-8 flex flex-wrap gap-2 justify-center">
          <button onClick={handleGoHome} className="bg-gray-800 text-white px-6 py-3 rounded-lg">🏠 Home</button>
          <button onClick={function() { setShowResults(false); setCurrentData(null) }} className="bg-blue-500 text-white px-6 py-3 rounded-lg">➕ New</button>
          <button onClick={handleShare} className="bg-green-500 text-white px-6 py-3 rounded-lg">📤 Share</button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-6 py-3 rounded-lg">🗑️</button>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold mb-2 text-center">{currentData.name}</h2>
          <p className="text-center text-gray-500 mb-8">📅 Report</p>
          
          {/* SUMMARY */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">📋 Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500 text-white p-6 rounded-xl text-center"><p className="text-4xl font-bold">💵 {currentData.currency}{currentData.insights.total.toLocaleString()}</p><p className="text-sm opacity-80">Total Spending</p></div>
              <div className="bg-red-500 text-white p-6 rounded-xl text-center"><p className="text-4xl font-bold">{currentData.insights.topCategory}</p><p className="text-sm opacity-80">Biggest</p></div>
              <div className="bg-green-500 text-white p-6 rounded-xl text-center"><p className="text-4xl font-bold">💚 {currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p><p className="text-sm opacity-80">Save</p></div>
              <div className="bg-purple-500 text-white p-6 rounded-xl text-center"><p className="text-4xl font-bold">📝 {currentData.insights.totalItems}</p><p className="text-sm opacity-80">Items</p></div>
            </div>
          </div>
          
          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-center">🥧 Pie Chart (Category)</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {keys.map(function(k, i) {
                  var v = chartData[k], p = totalA > 0 ? (v / totalA) * 100 : 0, c = cols[i % cols.length], s = Math.max(60, Math.min(120, p))
                  return <div key={k} className="text-center"><div className={c + ' rounded-full flex items-center justify-center text-white font-bold'} style={{width: s + 'px', height: s + 'px'}}>{p.toFixed(0)}%</div><p className="mt-2 font-medium">{k}</p><p className="text-sm">{currentData.currency}{v}</p></div>
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-center">📊 Bar Chart</h3>
              <div className="space-y-4">
                {keys.map(function(k, i) {
                  var v = chartData[k], p = maxV > 0 ? (v / maxV) * 100 : 0, c = cols[i % cols.length]
                  return <div key={k}><div className="flex justify-between mb-1"><span className="font-medium">{k}</span><span>{currentData.currency}{v}</span></div><div className="w-full bg-gray-200 rounded-full h-6"><div className={c + ' h-6 rounded-full'} style={{width: p + '%'}}></div></div></div>
                })}
              </div>
            </div>
          </div>
          
          {/* ADVICE */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center">✅ What to Do</h3>
              <ul className="space-y-2"><li>✔ Track daily expenses</li><li>✔ Set monthly budget</li><li>✔ Review categories</li><li>✔ Save 20% income</li><li>✔ Compare prices</li><li>✔ Use discounts</li></ul>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center">❌ What Not to Do</h3>
              <ul className="space-y-2"><li>✘ Overspend on {currentData.insights.topCategory}</li><li>✘ Buy unnecessary</li><li>✘ Ignore expenses</li><li>✘ Spend more than earn</li><li>✘ Forget tracking</li></ul>
            </div>
          </div>
          
          {/* ACTION PLAN */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">🎯 Action Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl"><h4 className="font-bold mb-2 text-center">📅 This Week</h4><ul className="text-sm"><li>Track daily</li><li>Reduce 10%</li><li>Review receipts</li></ul></div>
              <div className="bg-purple-50 p-4 rounded-xl"><h4 className="font-bold mb-2 text-center">📆 This Month</h4><ul className="text-sm"><li>Stay under budget</li><li>Set goal</li><li>Analyze</li></ul></div>
              <div className="bg-green-50 p-4 rounded-xl"><h4 className="font-bold mb-2 text-center">📈 This Quarter</h4><ul className="text-sm"><li>Reduce costs</li><li>Increase savings</li><li>Plan next</li></ul></div>
            </div>
          </div>
          
          {/* RECOMMENDATION */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">💡 Recommendation</h3>
            <div className="space-y-2 text-lg">
              <p>• Total: {currentData.currency}{currentData.insights.total.toLocaleString()}</p>
              <p>• Biggest: {currentData.insights.topCategory} = {currentData.currency}{currentData.insights.highestExpense.toLocaleString()}</p>
              <p>• Average: {currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p>
              <p>• Categories: {currentData.insights.categoryCount}</p>
              <p>• Save 15% = {currentData.currency}{(currentData.insights.highestExpense * 0.15).toFixed(0)}</p>
            </div>
          </div>
          
          {/* TABLE */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">📋 All Transactions</h3>
            <table className="w-full"><thead className="bg-gray-800 text-white"><tr><th className="p-3 text-center">#</th><th className="p-3 text-left">Item</th><th className="p-3 text-left">Category</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>
              {currentData.items.map(function(item, i) {
                return <tr key={item.id} className="border-b"><td className="p-3 text-center">{i + 1}</td><td className="p-3">{item.name}</td><td className="p-3">{item.category}</td><td className="p-3 text-right">{currentData.currency}{item.amount}</td></tr>
              })}
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
      <div className="bg-white shadow-sm py-3"><div className="max-w-7xl mx-auto px-4 flex justify-between items-center"><span className="font-medium">👤 {user.name}</span><button onClick={logout} className="text-gray-600 text-sm">🚪</button></div></div>
      <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
      <div className="text-center py-8"><button onClick={handleGoHome} className="bg-gray-200 px-6 py-3 rounded-lg">← Home</button></div>
      <Footer />
    </main>
  )
}