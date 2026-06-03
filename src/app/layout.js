import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../context/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "DataAI",
  description: "AI-Powered Data Analysis",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}