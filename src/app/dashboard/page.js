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
    
    const reader = new FileReader()
    
    reader.onload = function(e) {
      let text = e.target.result
      
      if (!text) {
        alert('File is empty!')
        setIsProcessing(false)
        return
      }
      
      text = text.replace(/^\uFEFF/, '')
      
      let currency = '$'
      if (text.includes('₹') || text.includes('INR')) currency = '₹'
      else if (text.includes('€')) currency = '€'
      else if (text.includes('£')) currency = '£'
      
      const lines = text.split('\n')
      const items = []
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const parts = line.split(/[\t,;]+/)
        if (parts.length < 2) continue
        
        let amount = 0
        let name = 'Item'
        let category = 'General'
        
        for (let j = 0; j < parts.length; j++) {
          const val = parts[j].trim()
          const num = val.replace(/[^0-9.]/g, '')
          if (num && num !== '.') {
            const parsed = parseFloat(num)
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
      
      const total = items.reduce(function(sum, item) { return sum + item.amount }, 0)
      
      const categories = {}
      items.forEach(function(item) {
        const cat = item.category
        if (!categories[cat]) categories[cat] = 0
        categories[cat] = categories[cat] + item.amount
      })
      
      let topCategory = 'General'
      let maxVal = 0
      Object.keys(categories).forEach(function(cat) {
        if (categories[cat] > maxVal) {
          maxVal = categories[cat]
          topCategory = cat
        }
      })
      
      const avgPerItem = items.length > 0 ? total / items.length : 0
      
      const projectData = {
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

  if (showResults && currentData) {
    const chartData = {}
    currentData.items.forEach(function(item) {
      const cat = item.category
      if (!chartData[cat]) chartData[cat] = 0
      chartData[cat] = chartData[cat] + item.amount
    })
    
    const chartKeys = Object.keys(chartData)
    let maxChart = 0
    chartKeys.forEach(function(key) {
      if (chartData[key] > maxChart) maxChart = chartData[key]
    })

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
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">{currentData.name}</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.currency}{currentData.insights.total}</p>
              <p className="text-sm opacity-80">Total</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{currentData.insights.topCategory}</p>
              <p className="text-sm opacity-80">Top</p>
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
          
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {chartKeys.map(function(key) {
                const value = chartData[key]
                const percent = maxChart > 0 ? (value / maxChart) * 100 : 0
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
                const color = colors[chartKeys.indexOf(key) % colors.length]
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
          
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Recommendation</h3>
            <p className="text-gray-600">{currentData.insights.recommendation}</p>
          </div>
          
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