'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import UploadSection from '../../components/UploadSection'
import DashboardView from '../../components/Dashboard'
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
  }, [user])

  function handleProcessData(file, projectName) {
    setIsProcessing(true)
    
    var reader = new FileReader()
    
    reader.onload = function(e) {
      var text = e.target.result
      
      // Fix encoding - remove BOM and clean text
      text = text.replace(/^\uFEFF/, '') // Remove BOM
      text = text.replace(/\r/g, '') // Remove carriage returns
      
      // Detect currency
      var currencySymbol = '$'
      if (text.includes('₹') || text.includes('INR')) {
        currencySymbol = '₹'
      } else if (text.includes('€')) {
        currencySymbol = '€'
      } else if (text.includes('£')) {
        currencySymbol = '£'
      }
      
      var lines = text.split('\n').filter(function(line) { return line.trim() })
      var items = []
      
      for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim()
        if (!line) continue
        
        var parts = line.split(',')
        
        if (parts.length < 2) continue
        
        var amount = 0
        var name = 'Item'
        var category = 'General'
        
        // Try to find amount in any column
        for (var j = 0; j < parts.length; j++) {
          var val = parts[j].trim()
          // Look for amount with or without currency symbol
          var match = val.match(/[\$₹€£]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/)
          if (match) {
            var numStr = match[1].replace(/,/g, '')
            amount = parseFloat(numStr)
            if (amount > 0) {
              // Name is usually in first column
              if (parts[0]) name = parts[0].trim()
              // Category can be from product column
              if (parts.length > 2 && parts[2]) category = parts[2].trim()
              break
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
        alert('No valid amounts found! Please check your CSV format.')
        setIsProcessing(false)
        return
      }
      
      // Calculate insights
      var total = items.reduce(function(sum, item) { return sum + item.amount }, 0)
      var categories = [...new Set(items.map(function(item) { return item.category }))]
      var categoryTotals = categories.map(function(cat) { 
        return items.filter(function(item) { return item.category === cat })
          .reduce(function(sum, item) { return sum + item.amount }, 0)
      })
      var topCategoryIndex = categoryTotals.indexOf(Math.max.apply(null, categoryTotals))
      var topCategory = categories[topCategoryIndex] || 'General'
      var avgPerItem = items.length > 0 ? total / items.length : 0
      
      var projectData = {
        name: projectName,
        items: items,
        insights: {
          total: total,
          topCategory: topCategory,
          avgPerItem: avgPerItem,
          highestExpense: items.length > 0 ? Math.max.apply(null, items.map(function(i) { return i.amount })) : 0,
          recommendation: 'Your biggest expense is ' + topCategory
        },
        currency: currencySymbol
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="bg-white shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-medium">Welcome, {user.name}</span>
          <div className="flex gap-4">
            <button onClick={handleGoHome} className="text-blue-500 hover:text-blue-700 text-sm">
              Home
            </button>
            <button onClick={logout} className="text-gray-600 hover:text-gray-800 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {!showResults ? (
        <div>
          <UploadSection 
            onProcessData={handleProcessData} 
            isProcessing={isProcessing} 
          />
          
          <div className="text-center py-8">
            <button 
              onClick={handleGoHome}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-8 flex gap-4">
            <button 
              onClick={handleGoHome}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ← Back to Home
            </button>
            <button 
              onClick={handleNewAnalysis}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + New Upload
            </button>
          </div>
          <DashboardView data={currentData} />
        </div>
      )}
      
      <Footer />
    </main>
  )
}