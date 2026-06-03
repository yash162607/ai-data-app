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
        var text = e.target.result
        
        // Debug: log first 500 chars
        console.log('Raw text:', text.substring(0, 500))
        
        if (!text) {
          alert('File is empty!')
          setIsProcessing(false)
          return
        }
        
        // Simple clean - just remove BOM and normalize lines
        text = text.replace(/^\uFEFF/, '')
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        
        // Detect currency
        var currency = '$'
        if (text.includes('₹') || text.includes('INR')) currency = '₹'
        else if (text.includes('€')) currency = '€'
        else if (text.includes('£')) currency = '£'
        
        // Split by new lines
        var lines = text.split('\n').filter(function(l) { return l.trim() })
        
        console.log('Lines found:', lines.length)
        console.log('First 3 lines:', lines.slice(0, 3))
        
        var items = []
        
        // Find header line index
        var headerIndex = 0
        for (var h = 0; h < Math.min(5, lines.length); h++) {
          if (lines[h].toLowerCase().includes('amount') || lines[h].toLowerCase().includes('total') || lines[h].toLowerCase().includes('price') || lines[h].toLowerCase().includes('cost')) {
            headerIndex = h
            break
          }
        }
        
        // Process each line from header
        for (var i = headerIndex + 1; i < lines.length; i++) {
          var line = lines[i].trim()
          if (!line || line.length < 2) continue
          
          // Split by any delimiter
          var parts = line.split(/[\t,;|]+/).filter(function(p) { return p.trim() })
          
          console.log('Line', i, ':', parts)
          
          if (parts.length < 2) continue
          
          // Find amount - look for number in any column
          var amount = 0
          var name = 'Item'
          var category = 'General'
          
          for (var j = 0; j < parts.length; j++) {
            var val = parts[j].trim()
            
            // Skip if it's a date
            if (val.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/)) continue
            
            // Get number
            var num = val.replace(/[^0-9.]/g, '')
            if (num && num.length > 0 && num !== '.') {
              var parsed = parseFloat(num)
              if (parsed > 0 && parsed < 10000000) {  // Reasonable amount
                amount = parsed
                // Use first column as name
                if (j === 0 && parts[0]) name = parts[0].trim()
                // Use second column as category if it's text
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
        
        console.log('Items found:', items.length)
        
        if (items.length === 0) {
          alert('No valid data! Make sure your file has numbers for amounts. Try checking Browser Console (F12) for debug info.')
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

  if (!user) return null

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
      
      {!showResults ? (
        <div>
          <UploadSection onProcessData={handleProcessData} isProcessing={isProcessing} />
          <div className="text-center py-8">
            <button onClick={handleGoHome} className="bg-gray-200 px-6 py-3 rounded-lg">Back to Home</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-8 flex gap-4">
            <button onClick={handleGoHome} className="bg-gray-800 text-white px-6 py-3 rounded-lg">Back</button>
            <button onClick={handleNewAnalysis} className="bg-blue-500 text-white px-6 py-3 rounded-lg">New Upload</button>
          </div>
          <DashboardView data={currentData} />
        </div>
      )}
      <Footer />
    </main>
  )
}