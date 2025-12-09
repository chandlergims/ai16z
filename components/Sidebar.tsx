'use client';

import { Compass, Plus, CaretDown, SignOut } from 'phosphor-react';
import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, authenticated, user, logout } = usePrivy();
  const [showDropdown, setShowDropdown] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  
  const isActive = (path: string) => pathname === path;
  
  const walletAddress = user?.wallet?.address || '';
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return;
      
      try {
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || '');
        const publicKey = new PublicKey(walletAddress);
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(0);
      }
    };
    
    if (authenticated && walletAddress) {
      fetchBalance();
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [authenticated, walletAddress]);
  
  return (
    <aside className="hidden md:block fixed left-0 top-20 w-[240px] pr-3">
      <div className="rounded-r-xl p-2 flex flex-col gap-0.5" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderLeft: 'none' }}>
        {/* Discover Button */}
        <button 
          onClick={() => router.push('/')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm cursor-pointer ${
            isActive('/') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10'
          }`}>
          <Compass size={16} weight="regular" />
          <span className="font-bold">Discover</span>
        </button>
        
        {/* Launch Button */}
        <button 
          onClick={() => router.push('/launch')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm cursor-pointer ${
            isActive('/launch') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10'
          }`}>
          <Plus size={16} weight="regular" />
          <span className="font-bold">Launch</span>
        </button>
        
        {/* Meme Launch Button */}
        <button 
          onClick={() => router.push('/create')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm cursor-pointer ${
            isActive('/create') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10'
          }`}>
          <Plus size={16} weight="regular" />
          <span className="font-bold">Meme Launch</span>
        </button>
        
        <div className="mt-1 pt-1 border-t border-[#2a2a2a]">
          {!authenticated && (
            <p className="text-xs text-gray-500 mb-1 px-1 text-center">Please connect your wallet.</p>
          )}
          {authenticated && (
            <div className="text-xs text-gray-400 mb-1 px-1 flex justify-between">
              <span className="font-bold">Balance:</span>
              <span className="font-bold text-white">{balance.toFixed(2)} SOL</span>
            </div>
          )}
          {/* Connect Wallet */}
          {!authenticated ? (
            <button 
              onClick={login}
              className="w-full px-3 py-1.5 rounded-lg font-medium text-xs text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#3b82f6' }}>
              Connect Wallet
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-3 py-1.5 rounded-lg font-medium text-xs text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center justify-between">
                <span>{shortAddress}</span>
                <CaretDown size={12} weight="bold" className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 w-full mt-1 rounded-lg overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-red-400 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                    <SignOut size={14} weight="regular" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
