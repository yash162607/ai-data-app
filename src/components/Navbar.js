import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          DataAI
        </Link>
      </div>
    </nav>
  )
}