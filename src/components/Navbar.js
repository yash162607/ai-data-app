import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">DataAI</span>
        </Link>
      </div>
    </nav>
  )
}