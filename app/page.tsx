'use client';

import { useEffect, useState } from 'react';
import { getAllCoins } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import { TelegramLogo, CopySimple, Globe, ChartLineUp, Lightning, MagnifyingGlass } from 'phosphor-react';

type SortOption = 'marketCap' | 'new';
type CategoryOption = 'all' | 'agents' | 'memes';

export default function Home() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [category, setCategory] = useState<CategoryOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const data = await getAllCoins();
        setCoins(data);
      } catch (error) {
        console.error('Error loading coins:', error);
      }
    };

    loadCoins();
  }, []);

  // Filter and sort coins - optimized with top 50 limit
  const filteredCoins = [...coins]
    .filter(coin => {
      // Filter by active status
      if (coin.status !== 'active') return false;
      
      // Category filter
      if (category === 'all') return true;
      if (category === 'agents') return coin.category === 'agent';
      if (category === 'memes') return coin.category === 'meme';
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          // Sort by market cap descending
          return (b.marketCap || 0) - (a.marketCap || 0);
        case 'new':
          // Sort by creation time descending (most recent first)
          return (b.createdAt || 0) - (a.createdAt || 0);
        default:
          return 0;
      }
    })
    .slice(0, 50); // Limit to top 50 for performance

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/coin/${searchQuery.trim()}`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <main className="w-full pt-10 md:pl-[180px]">
        {/* Outer wrapper - centered */}
        <div className="flex justify-center mt-4 pb-12 px-4 md:px-0">
          {/* Inner wrapper - controls max width */}
          <div className="flex flex-col gap-4 justify-center w-full max-w-4xl">
            {/* Hero Banner */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                <span className="text-white">The Agent Layer for the </span>
                <span className="text-yellow-400">Prediction Economy</span>
              </h1>
              <p className="text-base text-gray-400">
                Discover, launch, and trade the agent layer powering the prediction economy
              </p>
            </div>

            {/* Filter Tabs and Search */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('marketCap')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all select-none"
                style={{
                  backgroundColor: sortBy === 'marketCap' ? '#3b82f6' : '#1a1a1a',
                  color: sortBy === 'marketCap' ? 'white' : '#d1d5db',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChartLineUp size={14} weight="regular" />
                Market cap
              </button>
              <button
                onClick={() => setSortBy('new')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all select-none"
                style={{
                  backgroundColor: sortBy === 'new' ? '#3b82f6' : '#1a1a1a',
                  color: sortBy === 'new' ? 'white' : '#d1d5db',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Lightning size={14} weight="regular" />
                New
              </button>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by contract address..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none text-white placeholder-gray-500 placeholder:font-bold w-64"
                style={{ backgroundColor: '#1a1a1a', border: 'none' }}
              />
              <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </form>
            </div>

            {/* Sliding Toggle Switch - All / Agents / Memes */}
            <div className="relative flex w-full rounded-md py-0.5 overflow-hidden mt-2" style={{ backgroundColor: '#1a1a1a' }}>
              {/* Sliding Indicator */}
              <span 
                aria-hidden="true" 
                className="absolute inset-y-0 w-1/3 m-0.5 rounded transition-transform duration-200 ease-out"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  transform: category === 'all' ? 'translateX(0)' : category === 'agents' ? 'translateX(100%)' : 'translateX(200%)'
                }}
              ></span>
              
              {/* All Button */}
              <button
                onClick={() => setCategory('all')}
                className="relative z-10 w-1/3 flex justify-center py-1.5 rounded-md focus:outline-none transition-colors duration-200 font-bold text-sm cursor-pointer"
                style={{
                  color: category === 'all' ? 'white' : '#9ca3af'
                }}
              >
                All
              </button>
              
              {/* Agents Button */}
              <button
                onClick={() => setCategory('agents')}
                className="relative z-10 w-1/3 flex justify-center py-1.5 rounded-md focus:outline-none transition-colors duration-200 font-bold text-sm cursor-pointer"
                style={{
                  color: category === 'agents' ? 'white' : '#9ca3af'
                }}
              >
                Agents
              </button>
              
              {/* Memes Button */}
              <button
                onClick={() => setCategory('memes')}
                className="relative z-10 w-1/3 flex justify-center py-1.5 rounded-md focus:outline-none transition-colors duration-200 font-bold text-sm cursor-pointer"
                style={{
                  color: category === 'memes' ? 'white' : '#9ca3af'
                }}
              >
                Memes
              </button>
            </div>

            {filteredCoins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <h3 className="text-xl font-bold text-white mb-2">No coins yet</h3>
                <p className="text-gray-400">Be the first to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCoins.map((coin, index) => (
              <div 
                key={coin.id}
                className="flex flex-col"
              >
                {/* Creator Info */}
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <span>created by</span>
                  <span className="text-blue-400">
                    {coin.createdBy ? `${coin.createdBy.slice(0, 4)}...${coin.createdBy.slice(-4)}` : 'unknown'}
                  </span>
                </div>

                {/* Card */}
                <div 
                  className="relative overflow-hidden cursor-pointer group h-[220px] flex flex-col"
                  onClick={() => window.location.href = `/coin/${coin.contractAddress}`}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none'
                  }}
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 z-10 pointer-events-none"></div>
                  
                  {/* Image Section - Much Smaller */}
                  <div className="relative w-full h-24 overflow-hidden flex-shrink-0">
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Info Section - Much Smaller */}
                  <div className="p-1.5 flex-1 flex flex-col" style={{ backgroundColor: 'transparent' }}>
                    <h3 className="text-white font-bold text-sm mb-0">{coin.name}</h3>
                    <p className="text-gray-400 text-xs mb-1">{coin.ticker}</p>
                    <p className={`text-xs font-semibold mb-2 ${
                      (coin.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${(coin.marketCap || 0) >= 1000000 
                        ? `${((coin.marketCap || 0) / 1000000).toFixed(1)}M`
                        : `${((coin.marketCap || 0) / 1000).toFixed(1)}K`} mcap
                    </p>
                    
                    {/* Description */}
                    {coin.description && (
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                        {coin.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
