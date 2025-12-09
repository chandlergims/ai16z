'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { SignOut, UserCircle, Wallet, CaretDown, CaretUp, Plus, Smiley, SquaresFour, Info } from 'phosphor-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import HowItWorksModal from '@/components/HowItWorksModal';

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

export default function Navbar() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(0);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const walletAddress = user?.wallet?.address;
  
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchBalance = async () => {
      try {
        const pubkey = new PublicKey(walletAddress);
        const lamports = await connection.getBalance(pubkey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };
    
    fetchBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);
  
  return (
    <div className="w-full sticky top-0 z-50">
      {/* Beta Banner */}
      <div className="w-full py-1 overflow-hidden font-bold text-xs" style={{ backgroundColor: '#fbbf24', color: '#000' }}>
        <div className="flex animate-scroll-left">
          <div className="flex whitespace-nowrap">
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
          </div>
          <div className="flex whitespace-nowrap">
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
            <span className="px-8">Agent Submissions are now open</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>
      
      <nav className="w-full" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between relative">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <img 
                  src="/Arena (27).png" 
                  alt="Arena" 
                  className="h-8 w-auto select-none"
                />
              </Link>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="font-bold text-sm cursor-pointer transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  border: 'none'
                }}
              >
                [ how it works ]
              </button>
            </div>
            <div className="flex items-center space-x-4 justify-end">
              {!ready ? (
                <div className="px-3 py-1.5 bg-gray-200 rounded-lg w-32 h-8 animate-pulse"></div>
              ) : authenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    <span>{walletAddress && shortenAddress(walletAddress)}</span>
                    {dropdownOpen ? (
                      <CaretUp size={14} weight="bold" />
                    ) : (
                      <CaretDown size={14} weight="bold" />
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 rounded-lg overflow-hidden z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <img src="/solana-sol-logo-png_seeklogo-423095.png" alt="SOL" className="w-3 h-3" />
                        <p className="text-xs font-semibold text-white">{`${(balance || 0).toFixed(2)} SOL`}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <UserCircle size={14} weight="regular" className="text-gray-400" />
                        <p className="text-xs font-semibold text-white">Profile</p>
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-white cursor-pointer transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <SignOut size={14} weight="regular" className="text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={login}
                  className="px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
    </div>
  );
}
