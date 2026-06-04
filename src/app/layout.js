import "./globals.css";
import AuthContextProvider from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AI Data Analyzer",
  description: "Upload your data and get AI-powered insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        <AuthContextProvider>
          <Navbar />
          <main className="p-4">{children}</main>
        </AuthContextProvider>
      </body>
    </html>
  );
}