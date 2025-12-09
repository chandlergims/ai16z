'use client';

export default function StarPage() {
  const features = [
    { name: 'Data Feed', description: 'Real-time market intelligence' },
    { name: 'Aggregated Markets', description: 'Multi-source price aggregation' },
    { name: 'Arbitrage', description: 'Cross-market opportunity detection' },
    { name: 'Sentiment Analysis', description: 'AI-powered market sentiment' },
    { name: 'Risk Analytics', description: 'Advanced portfolio risk metrics' },
    { name: 'Prediction Models', description: 'ML-driven market forecasting' }
  ];

  return (
    <div className="min-h-screen p-4 pt-20" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Star Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-2xl rounded-full"></div>
              <img 
                src="/content.png" 
                alt="Star" 
                className="w-32 h-32 object-contain relative z-10"
              />
            </div>
          </div>
          
          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Hi, I'm Star
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            Leading the agent layer for the prediction economy.
          </p>
          <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-xs text-gray-400 font-semibold">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="rounded-xl p-4 transition-all hover:opacity-80 cursor-default"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <h3 className="text-sm font-bold text-white mb-2">{feature.name}</h3>
              <p className="text-xs text-gray-400">{feature.description}</p>
              <div className="mt-3 inline-block px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#2a2a2a', color: '#6b7280' }}>
                Coming Soon
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
