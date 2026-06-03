'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  const router = useRouter()
  const { user, getUserProjects, logout, refresh, isLoaded } = useAuth()
  
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

  useEffect(function() {
    function handleFocus() {
      refresh()
      if (user) {
        setProjects(getUserProjects())
      }
    }
    window.addEventListener('focus', handleFocus)
    return function() {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const hasProjects = projects && projects.length > 0

  function handleStart() {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  function handleViewAnalysis(project) {
    setSelectedProject(project)
    setShowFullAnalysis(true)
  }

  function handleGoBack() {
    setShowFullAnalysis(false)
    setSelectedProject(null)
    setDeleteConfirm(null)
  }

  function handleDeleteClick(projectId) {
    setDeleteConfirm(projectId)
  }

  function confirmDelete(projectId) {
    const { deleteProject } = useAuth ? require('../context/auth').useAuth() : { deleteProject: () => {} }
    deleteProject(projectId)
    setDeleteConfirm(null)
    setProjects(getUserProjects())
    
    if (selectedProject && selectedProject.id === projectId) {
      setShowFullAnalysis(false)
      setSelectedProject(null)
    }
  }

  function createShareLink(project) {
    const minData = {
      n: project.name,
      t: Math.round(project.insights.total),
      c: project.currency,
      k: project.insights.topCategory,
      a: Math.round(project.insights.avgPerItem),
      cnt: project.items.length
    }
    
    const encoded = btoa(JSON.stringify(minData))
    return window.location.origin + '/s/' + encoded.replace(/=/g, '')
  }

  function handleCopyLink(project) {
    navigator.clipboard.writeText(createShareLink(project))
    setShareSuccess('Link copied!')
    setTimeout(function() { setShareSuccess('') }, 2000)
  }

  function handleRefresh() {
    refresh()
    setProjects(getUserProjects())
  }

  function formatDate(isoString) {
    const date = new Date(isoString)
    return date.toLocaleDateString()
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  if (showFullAnalysis && selectedProject) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button onClick={handleGoBack} className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold mb-4">
            ← Back to Projects
          </button>
          
          {shareSuccess && (
            <span className="bg-green-500 text-white px-4 py-2 rounded-lg ml-4">{shareSuccess}</span>
          )}
          
          <button onClick={function() { handleCopyLink(selectedProject) }} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold mb-4 ml-4">
            🔗 Share
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
        
        {/* Project Results */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">{selectedProject.name}</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{selectedProject.currency}{selectedProject.insights.total}</p>
              <p className="text-sm opacity-80">Total</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{selectedProject.insights.topCategory}</p>
              <p className="text-sm opacity-80">Top</p>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{selectedProject.currency}{selectedProject.insights.avgPerItem.toFixed(0)}</p>
              <p className="text-sm opacity-80">Average</p>
            </div>
            <div className="bg-orange-500 text-white p-6 rounded-xl text-center">
              <p className="text-3xl font-bold">{selectedProject.items.length}</p>
              <p className="text-sm opacity-80">Items</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">All Items</h3>
            <div className="space-y-2">
              {selectedProject.items.map(function(item) {
                return (
                  <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{item.name}</span>
                    <span>{item.category}</span>
                    <span className="font-bold">{selectedProject.currency}{item.amount}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    )
  }

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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Your Projects</h2>
              <button onClick={handleRefresh} className="p-2 bg-gray-100 rounded-lg">
                🔄
              </button>
            </div>
            
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