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
      try {
        // Get text and clean it properly
        var text = e.target.result
        
        if (!text || text.length === 0) {
          alert('File is empty!')
          setIsProcessing(false)
          return
        }
        
        // Clean the text - remove encoding issues
        text = cleanText(text)
        
        // Detect currency
        var currencySymbol = '$'
        if (text.includes('₹') || text.includes('INR')) {
          currencySymbol = '₹'
        } else if (text.includes('€')) {
          currencySymbol = '€'
        } else if (text.includes('£')) {
          currencySymbol = '£'
        }
        
        // Split into lines
        var lines = text.split('\n')
        
        // Remove empty lines
        lines = lines.filter(function(line) { 
          var trimmed = line.trim()
          return trimmed.length > 0 && !trimmed.startsWith('#')
        })
        
        var items = []
        
        // Process each line (skip header)
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim()
          if (!line || line.length < 2) continue
          
          // Try different delimiters
          var parts = line.split('\t')
          if (parts.length < 2) parts = line.split(',')
          if (parts.length < 2) parts = line.split(';')
          
          if (parts.length < 2) continue
          
          // Find amount
          var amount = 0
          var name = 'Item'
          var category = 'General'
          var date = new Date().toISOString().split('T')[0]
          
          for (var j = 0; j < parts.length; j++) {
            var val = parts[j].trim()
            
            // Check for date
            if (val.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/)) {
              date = val.replace(/\//g, '-')
            }
            // Check for amount
            else if (val.match(/[\$₹€£]?\d+/)) {
              var numStr = val.replace(/[^0-9.]/g, '')
              if (numStr && parseFloat(numStr) > 0) {
                amount = parseFloat(numStr)
              }
            }
          }
          
          if (amount > 0) {
            if (parts[0]) name = parts[0].trim()
            if (parts.length > 2 && parts[1]) category = parts[1].trim()
            
            items.push({
              id: items.length + 1,
              name: name,
              amount: amount,
              category: category,
              date: date
            })
          }
        }
        
        if (items.length === 0) {
          alert('No valid data found! Please check your file format.')
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
        
      } catch (err) {
        alert('Error: ' + err.message)
        setIsProcessing(false)
      }
    }
    
    reader.onerror = function() {
      alert('Error reading file!')
      setIsProcessing(false)
    }
    
    // Read as UTF-8
    reader.readAsText(file, 'UTF-8')
  }

  function cleanText(text) {
    if (!text) return ''
    
    // Remove BOM
    text = text.replace(/^\uFEFF/, '')
    text = text.replace(/^\uFFEF/, '')
    text = text.replace(/^\uFEED/, '')
    
    // Fix line breaks
    text = text.replace(/\r\n/g, '\n')
    text = text.replace(/\r/g, '\n')
    
    // Remove encoding artifacts
    text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    return text
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