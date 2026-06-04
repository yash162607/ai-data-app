'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import UploadSection from '../../components/UploadSection'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, saveProject } = useAuth()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentData, setCurrentData] = useState(null)

  useEffect(function() {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  function handleProcessData(file, projectName) {
    setIsProcessing(true)
    
    var reader = new FileReader()
    reader.onload = function(e) {
      try {
        var text = e.target.result
        if (!text) {
          alert('File is empty!')
          setIsProcessing(false)
          return
        }
        
        text = text.replace(/^\uFEFF/, '')
        
        var currency = '$'
        if (text.indexOf('₹') > -1) {
          currency = '₹'
        }
        
        var lines = text.split('\n')
        var items = []
        
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim()
          if (!line) continue
          
          var parts = line.split(/[\t,;]+/)
          if (parts.length < 2) continue
          
          var amount = 0
          var name = 'Item'
          var category = 'General'
          
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
          
          if (amount > 0) {
            items.push({
              id: items.length + 1,
              name: name,
              amount: amount,
              category: category,
              date: '2024-01-01'
            })
          }
        }
        
        if (items.length === 0) {
          alert('No valid data found!')
          setIsProcessing(false)
          return
        }
        
        var total = 0
        for (var k = 0; k < items.length; k++) {
          total = total + items[k].amount
        }
        
        var categories = {}
        for (var m = 0; m < items.length; m++) {
          var cat = items[m].category
          if (!categories[cat]) categories[cat] = 0
          categories[cat] = categories[cat] + items[m].amount
        }
        
        var topCategory = 'General'
        var maxVal = 0
        var catKeys = Object.keys(categories)
        for (var n = 0; n < catKeys.length; n++) {
          if (categories[catKeys[n]] > maxVal) {
            maxVal = categories[catKeys[n]]
            topCategory = catKeys[n]
          }
        }
        
        var avgPerItem = items.length > 0 ? total / items.length : 0
        
        var data = {
          name: projectName,
          items: items,
          insights: {
            total: total,
            topCategory: topCategory,
            avgPerItem: avgPerItem,
            highestExpense: maxVal,
            categoryCount: catKeys.length,
            totalItems: items.length
          },
          currency: currency
        }
        
        setCurrentData(data)
        saveProject(data)
        setIsProcessing(false)
        setShowResults(true)
      } catch (err) {
        alert('Error: ' + err.message)
        setIsProcessing(false)
      }
    }
    
    reader.onerror = function() {
      alert('Cannot read file!')
      setIsProcessing(false)
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  function handleGoHome() {
    router.push('/')
  }

  function handleNewAnalysis() {
    setShowResults(false)
    setCurrentData(null)
  }

  if (!user) {
    return null
  }

  if (showResults && currentData) {
    var chartData = {}
    for (var c = 0; c < currentData.items.length; c++) {
      var cat = currentData.items[c].category
      if (!chartData[cat]) chartData[cat] = 0
      chartData[cat] = chartData[cat] + currentData.items[c].amount
    }
    
    var chartKeys = Object.keys(chartData)
    var totalAmount = currentData.insights.total
    var maxValue = 0
    for (var mv = 0; mv < chartKeys.length; mv++) {
      if (chartData[chartKeys[mv]] > maxValue) maxValue = chartData[chartKeys[mv]]
    }
    
    var pieColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
    var barColors = ['from-blue-500', 'from-green-500', 'from-purple-500', 'from-orange-500', 'from-red-500']

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span className="text-white font-semibold">Welcome, {user.name}</span>
            <button onClick={logout} className="text-white/70 hover:text-white">Logout</button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={handleGoHome} className="px-6 py-3 rounded-xl bg-gray-700 text-white">Home</button>
          <button onClick={handleNewAnalysis} className="px-6 py-3 rounded-xl bg-blue-500 text-white">New Analysis</button>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-white text-center mb-2">{currentData.name}</h2>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-600 p-6 rounded-2xl text-center">
                <p className="text-3xl font-bold text-white">{currentData.currency}{currentData.insights.total}</p>
                <p className="text-blue-200">Total</p>
              </div>
              <div className="bg-red-600 p-6 rounded-2xl text-center">
                <p className="text-3xl font-bold text-white">{currentData.insights.topCategory}</p>
                <p className="text-red-200">Biggest</p>
              </div>
              <div className="bg-green-600 p-6 rounded-2xl text-center">
                <p className="text-3xl font-bold text-white">{currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p>
                <p className="text-green-200">Average</p>
              </div>
              <div className="bg-purple-600 p-6 rounded-2xl text-center">
                <p className="text-3xl font-bold text-white">{currentData.insights.totalItems}</p>
                <p className="text-purple-200">Items</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Pie Chart</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {chartKeys.map(function(key, index) {
                  var value = chartData[key]
                  var percent = totalAmount > 0 ? (value / totalAmount) * 100 : 0
                  var color = pieColors[index % pieColors.length]
                  var size = Math.max(70, Math.min(140, percent + 20))
                  return (
                    <div key={key} className="text-center">
                      <div className={color + ' rounded-full flex items-center justify-center text-white font-bold'} style={{width: size + 'px', height: size + 'px'}}>
                        {percent.toFixed(0)}%
                      </div>
                      <p className="mt-2 text-white">{key}</p>
                      <p className="text-purple-300">{currentData.currency}{value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Bar Chart</h3>
              <div className="space-y-4">
                {chartKeys.map(function(key, index) {
                  var value = chartData[key]
                  var percent = maxValue > 0 ? (value / maxValue) * 100 : 0
                  var color = barColors[index % barColors.length]
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-white">{key}</span>
                        <span className="text-purple-300">{currentData.currency}{value}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-6">
                        <div className={'bg-gradient-to-r ' + color + ' h-6 rounded-full'} style={{width: percent + '%'}}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-500/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-400 mb-4 text-center">What to Do</h3>
              <ul className="text-white space-y-2">
                <li>Track daily expenses</li>
                <li>Set monthly budget</li>
                <li>Save 20% income</li>
              </ul>
            </div>
            <div className="bg-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4 text-center">What Not to Do</h3>
              <ul className="text-white space-y-2">
                <li>Overspend on {currentData.insights.topCategory}</li>
                <li>Ignore expenses</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Action Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-500/30 p-4 rounded-xl">
                <h4 className="font-bold text-blue-400 mb-2 text-center">This Week</h4>
                <p className="text-white text-sm">Track daily</p>
              </div>
              <div className="bg-purple-500/30 p-4 rounded-xl">
                <h4 className="font-bold text-purple-400 mb-2 text-center">This Month</h4>
                <p className="text-white text-sm">Stay under budget</p>
              </div>
              <div className="bg-green-500/30 p-4 rounded-xl">
                <h4 className="font-bold text-green-400 mb-2 text-center">This Quarter</h4>
                <p className="text-white text-sm">Save more</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Recommendation</h3>
            <div className="text-white space-y-2">
              <p>Total: {currentData.currency}{currentData.insights.total}</p>
              <p>Biggest: {currentData.insights.topCategory}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">All Transactions</h3>
            <table className="w-full">
              <thead className="bg-white/20 text-white">
                <tr>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentData.items.map(function(item, index) {
                  return (
                    <tr key={item.id} className="border-b border-white/10">
                      <td className="p-3 text-white text-center">{index + 1}</td>
                      <td className="p-3 text-white">{item.name}</td>
                      <td className="p-3 text-white">{item.category}</td>
                      <td className="p-3 text-white text-right">{currentData.currency}{item.amount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="bg-white shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-medium">Welcome, {user.name}</span>
          <button onClick={logout} className="text-gray-600">Logout</button>
        </div>
      </div>
      
      <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
      
      <div className="text-center py-8">
        <button onClick={handleGoHome} className="bg-gray-200 px-6 py-3 rounded-lg">Back to Home</button>
      </div>
      
      <Footer />
    </main>
  )
}