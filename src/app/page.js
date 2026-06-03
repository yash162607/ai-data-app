'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Dashboard from '../components/Dashboard'

export default function Home() {
  const router = useRouter()
  const { user, getUserProjects, logout, deleteProject, refresh, isLoaded } = useAuth()
  
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [shareSuccess, setShareSuccess] = useState('')

  useEffect(function() {
    if (isLoaded && user) {
      setProjects(getUserProjects())
    }
  }, [user, isLoaded])

  var hasProjects = projects && projects.length > 0

  var handleStart = function() {
    if (user) router.push('/dashboard')
    else router.push('/auth')
  }

  var handleLogout = function() {
    logout()
    router.push('/')
  }

  var handleViewAnalysis = function(project) {
    setSelectedProject(project)
    setShowFullAnalysis(true)
  }

  var handleGoBack = function() {
    setShowFullAnalysis(false)
    setSelectedProject(null)
    setDeleteConfirm(null)
  }

  function handleDeleteClick(id) {
    setDeleteConfirm(id)
  }

  var confirmDelete = function(id) {
    deleteProject(id)
    setDeleteConfirm(null)
    setProjects(getUserProjects())
    if (selectedProject && selectedProject.id === id) {
      setShowFullAnalysis(false)
      setSelectedProject(null)
    }
  }

  // Create short share link - encode minimal data directly in URL
  function createShareLink(project) {
    // Minimal data - only essential info
    var minData = {
      n: project.name.substring(0, 20), // name (max 20 chars)
      t: Math.round(project.insights.total), // total
      c: project.currency, // currency
      k: project.insights.topCategory.substring(0, 15), // top category
      a: Math.round(project.insights.avgPerItem), // average
      i: project.items.slice(0, 5).map(function(item) { // first 5 items
        return { n: item.name.substring(0, 15), a: item.amount }
      })
    }
    
    // Encode with minimal base64
    var encoded = btoa(JSON.stringify(minData))
    // Remove extra chars
    encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    return window.location.origin + '/s/' + encoded
  }

  function getShareMessage(project) {
    return '📊 ' + project.name + '\n💰 Total: ' + project.currency + project.insights.total + '\n📈 Top: ' + project.insights.topCategory + '\n📊 Items: ' + project.items.length
  }

  function copyLink() {
    var link = createShareLink(selectedProject)
    navigator.clipboard.writeText(link)
    setShareSuccess('Link copied!')
    setTimeout(function() { setShareSuccess('') }, 2000)
  }

  function shareWhatsApp() {
    var link = createShareLink(selectedProject)
    var msg = getShareMessage(selectedProject) + '\n\n🔗 ' + link
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank')
    setShareSuccess('WhatsApp opened!')
    setTimeout(function() { setShareSuccess('') }, 2000)
  }

  function shareTelegram() {
    var link = createShareLink(selectedProject)
    var msg = getShareMessage(selectedProject) + '\n\n' + link
    window.open('https://t.me/share/url?text=' + encodeURIComponent(msg), '_blank')
    setShareSuccess('Telegram opened!')
    setTimeout(function() { setShareSuccess('') }, 2000)
  }

  function shareCopy() {
    var msg = getShareMessage(selectedProject) + '\n\nLink: ' + createShareLink(selectedProject)
    navigator.clipboard.writeText(msg)
    setShareSuccess('Copied!')
    setTimeout(function() { setShareSuccess('') }, 2000)
  }

  function handleRefresh() {
    refresh()
    setProjects(getUserProjects())
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString()
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  // Full Analysis with Share
  if (showFullAnalysis && selectedProject) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button onClick={handleGoBack} className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold mb-4">
            ← Back
          </button>
          
          {shareSuccess && (
            <span className="bg-green-500 text-white px-4 py-2 rounded-lg ml-4">{shareSuccess}</span>
          )}
          
          <button onClick={copyLink} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
            {shareSuccess === 'Link copied!' ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          
          <button onClick={shareWhatsApp} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
            💬 WhatsApp
          </button>
          
          <button onClick={shareTelegram} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
            ✈️ Telegram
          </button>
          
          <button onClick={shareCopy} className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
            📋 Copy All
          </button>
          
          {deleteConfirm !== selectedProject.id && (
            <button onClick={function() { handleDeleteClick(selectedProject.id) }} className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
              🗑️ Delete
            </button>
          )}
          
          {deleteConfirm === selectedProject.id && (
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="mb-2">Delete "{selectedProject.name}"?</p>
              <button onClick={function() { setDeleteConfirm(null) }} className="px-4 py-2 bg-gray-200 rounded-lg mr-2">Cancel</button>
              <button onClick={function() { confirmDelete(selectedProject.id) }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
            </div>
          )}
        </div>
        
        <Dashboard data={selectedProject} />
      </main>
    )
  }

  // Home View
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {user && (
        <div className="absolute top-4 right-4 z-50">
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
            <span className="font-medium">{user.name}</span>
          </button>
        </div>
      )}
      
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-8">
            <span className="text-sm text-blue-600 font-medium">AI-Powered Data Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Turn Data Into <br />
            <span className="gradient-text">Actionable Insights</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Upload any file and let our AI transform it into structured data.
          </p>
          
          <button onClick={handleStart} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-lg">
            {user ? 'Go to Dashboard' : 'Start'}
          </button>
        </div>
      </section>
      
      {user && hasProjects && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Your Projects</h2>
            
            <div className="space-y-4">
              {projects.map(function(project) {
                return (
                  <div key={project.id} className="bg-white rounded-2xl p-6 shadow-lg">
                    {deleteConfirm === project.id && (
                      <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center justify-between">
                        <span>Delete "{project.name}"?</span>
                        <div className="flex gap-2">
                          <button onClick={function() { setDeleteConfirm(null) }} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                          <button onClick={function() { confirmDelete(project.id) }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(project.savedAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={function() { handleViewAnalysis(project) }} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">View</button>
                        <button onClick={function() { handleDeleteClick(project.id) }} className="p-2 bg-red-100 rounded-lg">🗑️</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xl font-bold text-blue-500">{project.currency}{project.insights.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xl font-bold text-green-500">{project.insights.topCategory}</p>
                        <p className="text-xs text-gray-500">Top</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xl font-bold text-purple-500">{project.currency}{project.insights.avgPerItem.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">Avg</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xl font-bold text-orange-500">{project.items.length}</p>
                        <p className="text-xs text-gray-500">Items</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </main>
  )
}