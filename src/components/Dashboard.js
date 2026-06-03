import { DollarSign, PieChart, BarChart3, Lightbulb, Clock, Tag, Target, Zap, CheckCircle, XCircle } from 'lucide-react'
import { Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

export default function Dashboard({ data }) {
  const currency = data.currency || '$'
  const categories = [...new Set(data.items.map(item => item.category))]
  const categoryTotals = categories.map(cat => 
    data.items.filter(item => item.category === cat).reduce((sum, item) => sum + item.amount, 0)
  )

  const categoryData = {
    labels: categories,
    datasets: [{
      data: categoryTotals,
      backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
      borderWidth: 0,
    }]
  }

  const expensesData = {
    labels: data.items.map(item => item.date),
    datasets: [{
      label: 'Spending',
      data: data.items.map(item => item.amount),
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  }

  const highestItem = data.items.reduce((max, item) => item.amount > max.amount ? item : max, data.items[0])

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* QUICK OVERVIEW */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Quick Overview</h2>
            <p className="text-gray-500">Your business at a glance</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-500 rounded-2xl p-6 text-white text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{currency}{data.insights.total.toLocaleString()}</p>
              <p className="text-sm opacity-80">Total Spent</p>
            </div>
            
            <div className="bg-indigo-500 rounded-2xl p-6 text-white text-center">
              <Tag className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{data.insights.topCategory}</p>
              <p className="text-sm opacity-80">Biggest Expense</p>
            </div>
            
            <div className="bg-amber-500 rounded-2xl p-6 text-white text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{currency}{data.insights.avgPerItem.toFixed(0)}</p>
              <p className="text-sm opacity-80">Average Cost</p>
            </div>
            
            <div className="bg-rose-500 rounded-2xl p-6 text-white text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{data.items.length}</p>
              <p className="text-sm opacity-80">Transactions</p>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Visual Charts</h2>
            <p className="text-gray-500">See your spending patterns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Spending by Category</h3>
              <div className="h-64 flex justify-center">
                <Doughnut data={categoryData} options={{ plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Spending Over Time</h3>
              <div className="h-64">
                <Line data={expensesData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
          </div>
        </div>

        {/* ADVICE */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Advice For You</h2>
            <p className="text-gray-500">What you should and should not do</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                <h3 className="text-xl font-bold text-green-700">What To DO</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Set a monthly budget of {currency}{(data.insights.total / 12).toFixed(0)}</p>
                    <p className="text-sm text-gray-600">Limit spending each month</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Track expenses weekly</p>
                    <p className="text-sm text-gray-600">Check spending every week</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Get multiple quotes</p>
                    <p className="text-sm text-gray-600">Compare at least 3 vendors</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <XCircle className="w-8 h-8 text-red-500 mr-2" />
                <h3 className="text-xl font-bold text-red-700">What NOT To DO</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Don't overspend on {data.insights.topCategory}</p>
                    <p className="text-sm text-gray-600">This is {((categoryTotals[0] / data.insights.total) * 100).toFixed(0)}% of total</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Don't make impulsive purchases</p>
                    <p className="text-sm text-gray-600">Wait 24-48 hours before buying</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Don't skip vendor comparison</p>
                    <p className="text-sm text-gray-600">Always check multiple vendors</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ACTION PLAN */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Action Plan</h2>
            <p className="text-gray-500">Steps to improve your business</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-xl mb-4">This Week</h3>
              <ol className="space-y-2">
                <li>1. Review all expenses</li>
                <li>2. List recurring costs</li>
                <li>3. Find duplicates</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <Target className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-bold text-xl mb-4">This Month</h3>
              <ol className="space-y-2">
                <li>1. Set budget limit</li>
                <li>2. Compare vendors</li>
                <li>3. Cut 10% costs</li>
              </ol>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <Zap className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="font-bold text-xl mb-4">This Quarter</h3>
              <ol className="space-y-2">
                <li>1. Negotiate contracts</li>
                <li>2. Switch vendors</li>
                <li>3. Automate tracking</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ALL DATA */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">All Transactions</h2>
            <p className="text-gray-500">Complete breakdown</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="text-left p-3">No.</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 font-bold">{currency}{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Summary</h2>
            <p className="text-gray-300">Overall review</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-gray-300">Total Spending</p>
              <p className="text-4xl font-bold text-yellow-400">{currency}{data.insights.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-300">Biggest Expense</p>
              <p className="text-4xl font-bold text-yellow-400">{currency}{highestItem.amount}</p>
            </div>
            <div>
              <p className="text-gray-300">Save 10%</p>
              <p className="text-4xl font-bold text-green-400">{currency}{(data.insights.total * 0.1).toFixed(0)}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}