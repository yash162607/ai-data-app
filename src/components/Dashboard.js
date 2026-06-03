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
  }, [user, router, getUserProjects])

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
        
        // Clean text
        text = text.replace(/^\uFEFF/, '')
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        
        // Detect currency
        var currency = '$'
        if (text.includes('₹') || text.includes('INR')) currency = '₹'
        else if (text.includes('€')) currency = '€'
        else if (text.includes('£')) currency = '£'
        
        // Split lines
        var lines = text.split('\n').filter(function(l) { return l.trim() })
        
        var items = []
        
        // Process each line
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim()
          if (!line || line.length < 2) continue
          
          // Split by delimiter
          var parts = line.split(/[\t,;|]+/).filter(function(p) { return p.trim() })
          
          if (parts.length < 2) continue
          
          // Find amount
          var amount = 0
          var name = 'Item'
          var category = 'General'
          
          for (var j = 0; j < parts.length; j++) {
            var val = parts[j].trim()
            
            // Skip dates
            if (val.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/)) continue
            
            // Get number
            var num = val.replace(/[^0-9.]/g, '')
            if (num && num.length > 0 && num !== '.') {
              var parsed = parseFloat(num)
              if (parsed > 0 && parsed < 10000000) {
                amount = parsed
                if (j === 0 && parts[0]) name = parts[0].trim()
                if (j === 1 && parts[1]) category = parts[1].trim()
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
        
        // Calculate insights
        var total = items.reduce(function(sum, item) { return sum + item.amount }, 0)
        var categories = []
        var categoryMap = {}
        
        items.forEach(function(item) {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = 0
            categories.push(item.category)
          }
          categoryMap[item.category] += item.amount
        })
        
        var topCategory = categories[0] || 'General'
        var maxAmount = categoryMap[topCategory] || 0
        
        categories.forEach(function(cat) {
          if (categoryMap[cat] > maxAmount) {
            maxAmount = categoryMap[cat]
            topCategory = cat
          }
        })
        
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
          currency: currency
        }
        
        saveProject(projectData)
        setCurrentData(projectData)
        setProjects(getUserProjects())
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
          <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
          <div className="text-center py-8">
            <button onClick={handleGoHome} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold">
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-8 flex gap-4">
            <button onClick={handleGoHome} className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold">
              Back to Home
            </button>
            <button onClick={handleNewAnalysis} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">
              New Upload
            </button>
          </div>
          <DashboardView data={currentData} />
        </div>
      )}
      
      <Footer />
    </main>
  )
}