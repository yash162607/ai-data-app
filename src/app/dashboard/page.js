'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth'
import Navbar from '../../components/Navbar'
import UploadSection from '../../components/UploadSection'
import Footer from '../../components/Footer'

export default function DashboardPage() {
  var router = useRouter()
  var _a = useAuth()
  var user = _a.user
  var logout = _a.logout
  var saveProject = _a.saveProject
  var getUserProjects = _a.getUserProjects
  
  var _b = useState(false)
  var isProcessing = _b[0]
  var setIsProcessing = _b[1]
  var _c = useState(false)
  var showResults = _c[0]
  var setShowResults = _c[1]
  var _d = useState(null)
  var currentData = _d[0]
  var setCurrentData = _d[1]
  var _e = useState([])
  var projects = _e[0]
  var setProjects = _e[1]

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
      
      var total = items.reduce(function(sum, item) { return sum + item.amount }, 0)
      
      var categories = {}
      items.forEach(function(item) {
        var cat = item.category
        if (!categories[cat]) categories[cat] = 0
        categories[cat] = categories[cat] + item.amount
      })
      
      var topCategory = 'General'
      var maxVal = 0
      Object.keys(categories).forEach(function(cat) {
        if (categories[cat] > maxVal) {
          maxVal = categories[cat]
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
    var chartData = {}
    currentData.items.forEach(function(item) {
      var cat = item.category
      if (!chartData[cat]) chartData[cat] = 0
      chartData[cat] = chartData[cat] + item.amount
    })
    
    var chartKeys = Object.keys(chartData)
    var maxChart = 0
    chartKeys.forEach(function(key) {
      if (chartData[key] > maxChart) maxChart = chartData[key]
    })

    return (
      React.createElement('main', { className: 'min-h-screen bg-gradient-to-b from-gray-50 to-white' },
        React.createElement(Navbar, null),
        React.createElement('div', { className: 'bg-white shadow-sm py-3' },
          React.createElement('div', { className: 'max-w-7xl mx-auto px-4 flex justify-between items-center' },
            React.createElement('span', { className: 'font-medium' }, 'Welcome, ', user.name),
            React.createElement('button', { onClick: logout, className: 'text-gray-600 text-sm' }, 'Logout')
          )
        ),
        
        React.createElement('div', { className: 'max-w-6xl mx-auto px-4 pt-8' },
          React.createElement('button', { onClick: handleGoHome, className: 'bg-gray-800 text-white px-6 py-3 rounded-lg mr-4' }, 'Back'),
          React.createElement('button', { onClick: handleNewAnalysis, className: 'bg-blue-500 text-white px-6 py-3 rounded-lg' }, 'New Upload')
        ),
        
        React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-8' },
          React.createElement('h2', { className: 'text-3xl font-bold mb-6' }, currentData.name),
          
          React.createElement('div', { className: 'grid grid-cols-4 gap-4 mb-8' },
            React.createElement('div', { className: 'bg-blue-500 text-white p-6 rounded-xl text-center' },
              React.createElement('p', { className: 'text-3xl font-bold' }, currentData.currency, currentData.insights.total),
              React.createElement('p', { className: 'text-sm opacity-80' }, 'Total')
            ),
            React.createElement('div', { className: 'bg-green-500 text-white p-6 rounded-xl text-center' },
              React.createElement('p', { className: 'text-3xl font-bold' }, currentData.insights.topCategory),
              React.createElement('p', { className: 'text-sm opacity-80' }, 'Top')
            ),
            React.createElement('div', { className: 'bg-purple-500 text-white p-6 rounded-xl text-center' },
              React.createElement('p', { className: 'text-3xl font-bold' }, currentData.currency, currentData.insights.avgPerItem.toFixed(0)),
              React.createElement('p', { className: 'text-sm opacity-80' }, 'Average')
            ),
            React.createElement('div', { className: 'bg-orange-500 text-white p-6 rounded-xl text-center' },
              React.createElement('p', { className: 'text-3xl font-bold' }, currentData.items.length),
              React.createElement('p', { className: 'text-sm opacity-80' }, 'Items')
            )
          ),
          
          React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg mb-8' },
            React.createElement('h3', { className: 'text-xl font-bold mb-4' }, 'Category Breakdown'),
            React.createElement('div', { className: 'space-y-3' },
              chartKeys.map(function(key) {
                var value = chartData[key]
                var percent = maxChart > 0 ? (value / maxChart) * 100 : 0
                var colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
                var color = colors[chartKeys.indexOf(key) % colors.length]
                return (
                  React.createElement('div', { key: key },
                    React.createElement('div', { className: 'flex justify-between mb-1' },
                      React.createElement('span', { className: 'font-medium' }, key),
                      React.createElement('span', null, currentData.currency, value)
                    ),
                    React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-4' },
                      React.createElement('div', { className: color + ' h-4 rounded-full', style: { width: percent + '%' } })
                    )
                  )
                )
              })
            )
          ),
          
          React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg mb-8' },
            React.createElement('h3', { className: 'text-xl font-bold mb-4' }, 'Recommendation'),
            React.createElement('p', { className: 'text-gray-600' }, currentData.insights.recommendation)
          ),
          
          React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg' },
            React.createElement('h3', { className: 'text-xl font-bold mb-4' }, 'All Transactions'),
            React.createElement('div', { className: 'overflow-x-auto' },
              React.createElement('table', { className: 'w-full' },
                React.createElement('thead', null,
                  React.createElement('tr', { className: 'border-b' },
                    React.createElement('th', { className: 'text-left py-3' }, 'Item'),
                    React.createElement('th', { className: 'text-left py-3' }, 'Category'),
                    React.createElement('th', { className: 'text-right py-3' }, 'Amount')
                  )
                ),
                React.createElement('tbody', null,
                  currentData.items.map(function(item) {
                    return (
                      React.createElement('tr', { key: item.id, className: 'border-b' },
                        React.createElement('td', { className: 'py-3' }, item.name),
                        React.createElement('td', { className: 'py-3' }, item.category),
                        React.createElement('td', { className: 'py-3 text-right' }, currentData.currency, item.amount)
                      )
                    )
                  })
                )
              )
            )
          )
        ),
        
        React.createElement(Footer, null)
      )
    )
  }

  return (
    React.createElement('main', { className: 'min-h-screen bg-gradient-to-b from-gray-50 to-white' },
      React.createElement(Navbar, null),
      React.createElement('div', { className: 'bg-white shadow-sm py-3' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 flex justify-between items-center' },
          React.createElement('span', { className: 'font-medium' }, 'Welcome, ', user.name),
          React.createElement('div', { className: 'flex gap-4' },
            React.createElement('button', { onClick: handleGoHome, className: 'text-blue-500 text-sm' }, 'Home'),
            React.createElement('button', { onClick: logout, className: 'text-gray-600 text-sm' }, 'Logout')
          )
        )
      ),
      
      React.createElement(UploadSection, { onProcessData: handleProcessData, isProcessing: isProcessing }),
      
      React.createElement('div', { className: 'text-center py-8' },
        React.createElement('button', { onClick: handleGoHome, className: 'bg-gray-200 text-gray-700 px-6 py-3 rounded-lg' },
          'Back to Home'
        )
      ),
      
      React.createElement(Footer, null)
    )
  )
}