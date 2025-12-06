'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { SignOut, UserCircle, Wallet, CaretDown, CaretUp, Plus, Smiley, SquaresFour } from 'phosphor-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

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
    <nav className="w-full sticky top-0 z-50" style={{ backgroundColor: '#ddcfb9' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between relative">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/Arena (27).png" 
                alt="Arena" 
                className="h-12 w-auto select-none"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4 justify-end">
            {!ready ? (
              <div className="px-3 py-1.5 bg-gray-200 rounded-lg w-32 h-8 animate-pulse"></div>
            ) : authenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg font-bold text-sm cursor-pointer"
                  style={{ backgroundColor: '#8b6f47' }}
                >
                  <span>{walletAddress && shortenAddress(walletAddress)}</span>
                  {dropdownOpen ? (
                    <CaretUp size={16} weight="bold" />
                  ) : (
                    <CaretDown size={16} weight="bold" />
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'rgba(139, 111, 71, 0.1)', borderBottom: '1px solid rgba(139, 111, 71, 0.2)' }}>
                      <img src="/solana-sol-logo-png_seeklogo-423095.png" alt="SOL" className="w-4 h-4" />
                      <p className="text-sm font-bold" style={{ color: '#4a4a4a' }}>{`${(balance || 0).toFixed(2)} SOL`}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-3 flex items-center gap-2 cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(139, 111, 71, 0.2)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <UserCircle size={16} weight="regular" style={{ color: '#4a4a4a' }} />
                      <p className="text-sm font-bold" style={{ color: '#4a4a4a' }}>Profile</p>
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-bold cursor-pointer"
                      style={{ color: '#4a4a4a' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <SignOut size={16} weight="regular" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="px-3 py-1.5 text-white rounded-lg font-bold text-sm cursor-pointer"
                style={{ backgroundColor: '#8b6f47' }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
