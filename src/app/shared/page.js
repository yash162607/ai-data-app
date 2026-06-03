'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Dashboard from '../../components/Dashboard'

export default function SharedPage() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    var slug = params.slug
    
    if (slug) {
      try {
        // Decode from URL
        var encoded = slug
        // Add padding if needed
        while (encoded.length % 4) {
          encoded += '='
        }
        // Replace URL-safe chars
        encoded = encoded.replace(/-/g, '+').replace(/_/g, '/')
        
        var decoded = JSON.parse(atob(encoded))
        
        if (decoded) {
          // Convert back to full data
          var fullData = {
            name: decoded.n || 'Shared Data',
            currency: decoded.c || '$',
            insights: {
              total: decoded.t || 0,
              topCategory: decoded.k || 'N/A',
              avgPerItem: decoded.a || 0,
              highestExpense: 0,
              recommendation: 'Track your expenses!'
            },
            items: decoded.i || []
          }
          setData(fullData)
        } else {
          setError(true)
        }
      } catch (e) {
        setError(true)
      }
    } else {
      setError(true)
    }
    
    setLoading(false)
  }, [params.slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto p-20 text-center">
          <h1 className="text-2xl font-bold mb-4">❌ Invalid Link</h1>
          <p className="text-gray-600 mb-8">This link is invalid or expired.</p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg">
            Go to Home
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="bg-green-50 py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-700 font-medium">📤 Shared: {data.name}</p>
        </div>
      </div>
      
      <Dashboard data={data} />
      
      <div className="text-center py-8">
        <Link href="/" className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold">
          Create Your Own
        </Link>
      </div>
      
      <Footer />
    </main>
  )
}