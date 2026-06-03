'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import UploadSection from '../../components/UploadSection'
import Footer from '../../components/Footer'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, saveProject, getUserProjects } = useAuth()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentData, setCurrentData] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(function() {
    if (!user) {
      router.push('/auth')
    } else {
      setProjects(getUserProjects())
    }
  }, [user, router, getUserProjects])

  function handleProcessData(file, projectName) {
    setIsProcessing(true)
    
    var reader = new FileReader()
    
    reader.onload = function(e) {
      var text = e.target.result
      
      if (!text) {
        alert('File is empty!')
        setIsProcessing(false)
        return
      }
      
      text = text.replace(/^\uFEFF/, '')
      
      var currency = '$'
      if (text.indexOf('₹') > -1) currency = '₹'
      else if (text.indexOf('€') > -1) currency = '€'
      else if (text.indexOf('£') > -1) currency = '£'
      
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
            date: new Date().toISOString().split('T')[0]
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
      
      var projectData = {
        name: projectName,
        items: items,
        insights: {
          total: total,
          topCategory: topCategory,
          avgPerItem: avgPerItem,
          highestExpense: maxVal,
          recommendation: 'Your biggest expense is ' + topCategory
        },
        currency: currency
      }
      
      saveProject(projectData)
      setCurrentData(projectData)
      setProjects(getUserProjects())
      setIsProcessing(false)
      setShowResults(true)
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

  // Full Results View with Charts
  if (showResults && currentData) {
    var chartData = {}
    for (var c = 0; c < currentData.items.length; c++) {
      var cat = currentData.items[c].category
      if (!chartData[cat]) chartData[cat] = 0
      chartData[cat] = chartData[cat] + currentData.items[c].amount
    }
    
    var chartKeys = Object.keys(chartData)
    var maxChart = 0
    for (var ck = 0; ck < chartKeys.length; ck++) {
      if (chartData[chartKeys[ck]] > maxChart) maxChart = chartData[chartKeys[ck]]
    }

    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="bg-white shadow-sm py-3">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span className="font-medium">Welcome, {user.name}</span>
            <button onClick={logout} className="text-gray-600 text-sm">Logout</button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button onClick={handleGoHome} className="bg-gray-800 text-white px-6 py-3 rounded-lg mr-4">Back</button>
          <button onClick={handleNewAnalysis} className="bg-blue-500 text-white px-6 py-3 rounded-lg">New Upload</button>
        </div>
        
        {/* Quick Overview */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">{currentData.name}</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.currency}{currentData.insights.total}</p>
              <p className="text-sm opacity-80">Total</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.insights.topCategory}</p>
              <p className="text-sm opacity-80">Top Category</p>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.currency}{currentData.insights.avgPerItem.toFixed(0)}</p>
              <p className="text-sm opacity-80">Average</p>
            </div>
            <div className="bg-orange-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.items.length}</p>
              <p className="text-sm opacity-80">Items</p>
            </div>
          </div>
          
          {/* Visual Chart (Bar) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {chartKeys.map(function(key) {
                var value = chartData[key]
                var percent = maxChart > 0 ? (value / maxChart) * 100 : 0
                var colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500']
                var color = colors[chartKeys.indexOf(key) % colors.length]
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{key}</span>
                      <span>{currentData.currency}{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className={color + ' h-4 rounded-full'} style={{ width: percent + '%' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Advice */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Recommendation</h3>
            <p className="text-gray-600">{currentData.insights.recommendation}</p>
          </div>
          
          {/* All Transactions Table */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">All Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Item</th>
                    <th className="text-left py-3">Category</th>
                    <th className="text-right py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.items.map(function(item) {
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.name}</td>
                        <td className="py-3">{item.category}</td>
                        <td className="py-3 text-right">{currentData.currency}{item.amount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    )
  }

  // Upload View
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="bg-white shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-medium">Welcome, {user.name}</span>
          <div className="flex gap-4">
            <button onClick={handleGoHome} className="text-blue-500 text-sm">Home</button>
            <button onClick={logout} className="text-gray-600 text-sm">Logout</button>
          </div>
        </div>
      </div>
      
      <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
      
      <div className="text-center py-8">
        <button onClick={handleGoHome} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg">
          Back to Home
        </button>
      </div>
      
      <Footer />
    </main>
  )
}