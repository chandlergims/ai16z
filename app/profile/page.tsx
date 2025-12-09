'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { getCoinsByCreator } from '@/lib/services/coinService';
import { getAgentSubmissionsByWallet, AgentSubmission } from '@/lib/services/agentService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';

type Tab = 'submissions' | 'approved';

export default function Profile() {
  const { user, authenticated } = usePrivy();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [submissions, setSubmissions] = useState<AgentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('submissions');
  
  const walletAddress = user?.wallet?.address;

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [coinsData, submissionsData] = await Promise.all([
          getCoinsByCreator(walletAddress),
          getAgentSubmissionsByWallet(walletAddress)
        ]);
        setCoins(coinsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authenticated && walletAddress) {
      loadData();
    } else if (authenticated && !walletAddress) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [authenticated, walletAddress]);

  const renderSkeleton = () => (
    <>
      {/* Table Header */}
      <div className="px-6 py-3">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Name
          </div>
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            GitHub / Link
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
            Status
          </div>
        </div>
      </div>
      
      {/* Skeleton Rows */}
      <div className="space-y-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                <div className="min-w-0 space-y-2">
                  <div className="h-3.5 w-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                  <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-12 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-20 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="h-3.5 w-10 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <main className="mx-auto max-w-3xl px-6 py-8">
          {/* Unified Profile Card */}
          <div className="rounded-lg overflow-hidden">
            {/* Profile Header */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                  <div className="h-3 w-48 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="flex">
                <button className="flex-1 px-4 py-3 text-sm font-bold text-white" style={{ borderBottom: '2px solid #3b82f6' }}>
                  Submissions
                </button>
                <button className="flex-1 px-4 py-3 text-sm font-bold text-gray-500">
                  Approved
                </button>
              </div>
            </div>

            {/* Tab Content with Connect Wallet Overlay */}
            <div className="min-h-[400px] relative">
              {renderSkeleton()}
              
              {/* Connect Wallet Overlay */}
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(10, 10, 10, 0.8)' }}>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h1>
                  <p className="text-gray-400">You need to connect your wallet to view your profile.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Unified Profile Card */}
        <div className="rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: '#3b82f6' }}>
                {walletAddress?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white mb-0.5">
                  {shortenAddress(walletAddress || '')}
                </h1>
                <p className="text-xs text-gray-500 font-mono truncate">{walletAddress}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex">
              <button
                onClick={() => setActiveTab('submissions')}
                className="flex-1 px-4 py-3 text-sm font-bold cursor-pointer transition-colors"
                style={activeTab === 'submissions' ? { color: '#fff', borderBottom: '2px solid #3b82f6' } : { color: '#9ca3af' }}
              >
                Submissions
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className="flex-1 px-4 py-3 text-sm font-bold cursor-pointer transition-colors"
                style={activeTab === 'approved' ? { color: '#fff', borderBottom: '2px solid #3b82f6' } : { color: '#9ca3af' }}
              >
                Approved
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'submissions' && (
              <>
                {loading ? (
                  renderSkeleton()
                ) : submissions.length === 0 && coins.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  <>
                    {/* Table Header */}
                    <div className="px-6 py-3">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Name
                        </div>
                        <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          GitHub / Link
                        </div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                          Status
                        </div>
                      </div>
                    </div>
                    
                    {/* Submissions and Coins List */}
                    <div className="max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarColor: '#374151 transparent' }}>
                      {/* Agent Submissions */}
                      {submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="block px-6 py-4 transition-colors"
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-6 flex items-center gap-3">
                              {submission.imageUrl ? (
                                <img 
                                  src={submission.imageUrl} 
                                  alt={submission.name}
                                  className="w-11 h-11 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#3b82f6' }}>
                                  {submission.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white">{submission.name}</div>
                                <div className="text-xs text-gray-500 truncate">Agent • {submission.language}</div>
                              </div>
                            </div>
                            <div className="col-span-4 text-left">
                              <a
                                href={submission.githubRepo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-gray-300 truncate block"
                              >
                                {submission.githubRepo}
                              </a>
                            </div>
                            <div className="col-span-2 text-right">
                              <span
                                className="text-xs font-bold px-2 py-1 rounded"
                                style={{
                                  backgroundColor: submission.status === 'approved' ? '#10b981' : submission.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                  color: 'white'
                                }}
                              >
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Coins */}
                      {coins.map((coin) => (
                        <Link
                          key={coin.id}
                          href={`/coin/${coin.contractAddress}`}
                          className="block px-6 py-4 transition-colors cursor-pointer"
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-6 flex items-center gap-3">
                              <img 
                                src={coin.image} 
                                alt={coin.name}
                                className="w-11 h-11 rounded-lg object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white">{coin.ticker}</div>
                                <div className="text-xs text-gray-500 truncate">Token • {coin.name}</div>
                              </div>
                            </div>
                            <div className="col-span-4 text-left">
                              <div className="text-xs text-gray-500">
                                {coin.contractAddress?.slice(0, 4)}...{coin.contractAddress?.slice(-4)}
                              </div>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="text-xs font-bold text-white">
                                {coin.verified ? 'Live' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <div className="p-12 text-center">
                <p className="text-gray-500 font-medium">No approved agents yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  Approved agents will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
