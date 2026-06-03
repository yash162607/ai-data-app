import { Upload, BarChart3, Lightbulb, Shield, Clock, Zap } from 'lucide-react'

export default function Features() {
  const features = [
    { icon: Upload, title: 'Easy Upload', description: 'Simply drag and drop your files', color: 'bg-blue-500' },
    { icon: BarChart3, title: 'Visual Charts', description: 'Beautiful charts showing your data', color: 'bg-green-500' },
    { icon: Lightbulb, title: 'Smart Advice', description: 'AI recommendations on what to do', color: 'bg-yellow-500' },
    { icon: Shield, title: 'Secure Data', description: 'Data stored safely', color: 'bg-red-500' },
    { icon: Clock, title: 'Save Time', description: 'Get instant analysis', color: 'bg-purple-500' },
    { icon: Zap, title: 'Always Available', description: 'Access anywhere', color: 'bg-orange-500' },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center animate-fade-in">Why Choose Us?</h2>
        <p className="text-xl text-gray-600 text-center mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Powerful features to help your business grow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(function(feature, index) {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="card-animate bg-white rounded-2xl p-6 shadow-lg"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}