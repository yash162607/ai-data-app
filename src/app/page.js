import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
      <h1 className="text-6xl font-bold mb-6">
        <span className="text-cyan-400">AI</span> Data Analysis
      </h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">
        Upload your financial data and get instant AI-powered insights,
        visual charts, and personalized advice to manage your money better.
      </p>
      <Link
        href="/auth/signup"
        className="bg-cyan-500 text-white px-8 py-4 text-xl rounded-lg hover:bg-cyan-600 transition"
      >
        Get Started Free →
      </Link>

      <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-bold mb-2">Smart Analysis</h3>
          <p className="text-gray-400">AI instantly analyzes your data</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Visual Charts</h3>
          <p className="text-gray-400">Pie charts, line graphs and more</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-bold mb-2">Action Plans</h3>
          <p className="text-gray-400">Weekly, monthly recommendations</p>
        </div>
      </div>
    </div>
  );
}