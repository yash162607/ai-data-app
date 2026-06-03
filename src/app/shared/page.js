'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function SharedPage() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    var slug = params.slug
    
    if (slug) {
      try {
        var decoded = JSON.parse(atob(slug))
        
        // Show ONLY summary
        setData({
          name: decoded.n || 'Shared',
          currency: decoded.c || '$',
          insights: {
            total: decoded.t || 0,
            topCategory: decoded.k || 'N/A',
            avgPerItem: decoded.a || 0,
            highestExpense: decoded.a || 0,
            recommendation: 'Track your expenses to save money!'
          },
          items: []
        })
      } catch (e) {
        setError(true)
      }
    } else {
      setError(true)
    }
    
    setLoading(false)
  }, [params.slug])

  if (loading) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></main>

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto p-20 text-center">
          <h1 className="text-2xl font-bold mb-4">❌ Invalid Link</h1>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg">Go to Home</Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="bg-green-50 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-700 font-bold text-xl">📤 {data.name}</p>
          <p className="text-green-600">Shared Analysis</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-2xl text-center">
            <p className="text-4xl font-bold">{data.currency}{data.insights.total}</p>
            <p className="text-sm opacity-80">Total</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-2xl text-center">
            <p className="text-4xl font-bold">{data.insights.topCategory}</p>
            <p className="text-sm opacity-80">Top Category</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-2xl text-center">
            <p className="text-4xl font-bold">{data.currency}{data.insights.avgPerItem}</p>
            <p className="text-sm opacity-80">Average</p>
          </div>
          <div className="bg-orange-500 text-white p-6 rounded-2xl text-center">
            <p className="text-4xl font-bold">{data.insights.cnt || '-'}</p>
            <p className="text-sm opacity-80">Items</p>
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-8">{data.insights.recommendation}</p>
        
        <div className="text-center">
          <Link href="/" className="bg-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-xl">
            Create Your Own Analysis
          </Link>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}