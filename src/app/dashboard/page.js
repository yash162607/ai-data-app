'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import UploadSection from '../../components/UploadSection'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
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
      var text = (e.target.result || '').replace(/^\uFEFF/, '')
      if (!text) { setIsProcessing(false); alert('Empty'); return }
      
      var currency = text.indexOf('₹') > -1 ? '₹' : '$'
      var lines = text.split('\n')
      var items = []
      
      for (var i = 0; i < lines.length; i++) {
        var parts = (lines[i] || '').trim().split(/[\t,;]+/)
        if (parts.length < 2) continue
        for (var j = 0; j < parts.length; j++) {
          var num = (parts[j] || '').replace(/[^0-9.]/g, '')
          if (num && num !== '.') {
            var amt = parseFloat(num)
            if (amt > 0 && amt < 100000) {
              items.push({ id: items.length + 1, name: parts[0] || 'Item', category: parts[1] || 'General', amount: amt })
              break
            }
          }
        }
      }
      
      if (items.length === 0) { setIsProcessing(false); alert('No data'); return }
      
      var total = 0
      for (var k = 0; k < items.length; k++) total += items[k].amount
      
      var catObj = {}
      for (var c = 0; c < items.length; c++) {
        var cat = items[c].category
        catObj[cat] = (catObj[cat] || 0) + items[c].amount
      }
      
      var topCat = 'General'
      var maxV = 0
      Object.keys(catObj).forEach(function(k) { if (catObj[k] > maxV) { maxV = catObj[k]; topCat = k } })
      
      setCurrentData({ name: projectName, items: items, total: total, topCategory: topCat, avg: total / items.length, currency: currency })
      setIsProcessing(false)
      setShowResults(true)
    }
    reader.readAsText(file)
  }

  if (!user) return null

  if (showResults && currentData) {
    var keys = Object.keys(currentData.items.reduce(function(o, i) { o[i.category] = (o[i.category] || 0) + i.amount; return o }, {}))
    var maxV = Math.max.apply(null, keys.map(function(k) { return currentData.items.filter(function(i) { return i.category === k }).reduce(function(s, i) { return s + i.amount }, 0) }))

    return (
      <main className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="p-8">
          <div className="flex gap-4 mb-8 justify-center">
            <button onClick={function() { router.push('/') }} className="px-6 py-3 bg-gray-700 rounded">Home</button>
            <button onClick={function() { setShowResults(false); setCurrentData(null) }} className="px-6 py-3 bg-blue-600 rounded">New</button>
          </div>
          
          <h1 className="text-4xl text-center mb-8">{currentData.name}</h1>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-600 p-6 rounded text-center"><p className="text-3xl">{currentData.currency}{currentData.total}</p><p>Total</p></div>
            <div className="bg-red-600 p-6 rounded text-center"><p className="text-3xl">{currentData.topCategory}</p><p>Top</p></div>
            <div className="bg-green-600 p-6 rounded text-center"><p className="text-3xl">{currentData.currency}{currentData.avg.toFixed(0)}</p><p>Avg</p></div>
            <div className="bg-purple-600 p-6 rounded text-center"><p className="text-3xl">{currentData.items.length}</p><p>Items</p></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 p-6 rounded">
              <h3 className="text-xl mb-4 text-center">Pie</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {keys.map(function(k, i) {
                  var v = currentData.items.filter(function(it) { return it.category === k }).reduce(function(s, it) { return s + it.amount }, 0)
                  var p = (v / currentData.total) * 100
                  return <div key={k} className="text-center p-2"><div className={'rounded-full bg-' + ['blue', 'green', 'purple', 'orange', 'red'][i % 5] + '-500 inline-flex items-center justify-center text-white font-bold'} style={{width: (50 + p) + 'px', height: (50 + p) + 'px'}}>{p.toFixed(0)}%</div><p>{k}</p></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded">
              <h3 className="text-xl mb-4 text-center">Bar</h3>
              {keys.map(function(k, i) {
                var v = currentData.items.filter(function(it) { return it.category === k }).reduce(function(s, it) { return s + it.amount }, 0)
                var p = (v / maxV) * 100
                return <div key={k} className="mb-2"><div className="flex justify-between"><span>{k}</span><span>{currentData.currency}{v}</span></div><div className="h-4 bg-slate-700 rounded"><div className={'h-4 bg-' + ['blue', 'green', 'purple', 'orange', 'red'][i % 5] + '-500 rounded'} style={{width: p + '%'}}></div></div></div>
              })}
            </div>
          </div>
          
          <table className="w-full bg-slate-800">
            <thead className="bg-slate-700"><tr><th>#</th><th>Item</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {currentData.items.map(function(item, i) { return <tr key={item.id}><td>{i + 1}</td><td>{item.name}</td><td>{item.category}</td><td>{currentData.currency}{item.amount}</td></tr> })}
            </tbody>
          </table>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4 flex justify-between"><span>{user.name}</span><button onClick={logout}>Logout</button></div>
      <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
      <div className="p-8 text-center"><button onClick={function() { router.push('/') }} className="bg-gray-300 px-6 py-3 rounded">Home</button></div>
      <Footer />
    </main>
  )
}