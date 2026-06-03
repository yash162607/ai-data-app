import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Badge - fades in */}
        <div className="animate-fade-in mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm text-blue-600 font-medium">AI-Powered Data Analysis</span>
          </div>
        </div>
        
        {/* Title - slides up */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          Turn Data Into <br />
          <span className="gradient-text">Actionable Insights</span>
        </h1>
        
        {/* Description */}
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Upload any file and let our AI transform it into structured data.
        </p>
        
        {/* Button - lifts on hover */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link 
            href="/auth"
            className="btn-animate bg-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-lg inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}