'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getAllCoins } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';
import { Check, TelegramLogo, CopySimple, Globe, Flame, ChartLineUp, Lightning, MagnifyingGlass } from 'phosphor-react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useConnection } from '@solana/wallet-adapter-react';
import { prepareCoinCreation } from '@/lib/services/mintService';
import { createCoinOnMeteora } from '@/lib/services/meteoraService';
import { saveCoin } from '@/lib/services/coinService';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

type SortOption = 'verified' | 'marketCap' | 'new';

export default function Home() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [searchQuery, setSearchQuery] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [createStep, setCreateStep] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    image: null as File | null,
    xLink: '',
    websiteLink: '',
    telegramLink: '',
    initialBuyAmount: '',
  });

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
      // Filter by active status only
      return coin.status === 'active';
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

  const handleTerminalCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const input = terminalInput.trim();
      
      if (createStep === 0) {
        if (input === '/create') {
          if (!authenticated) {
            login();
            return;
          }
          setCurrentPrompt('Enter token name (max 32 characters):');
          setTerminalHistory([]);
          setCreateStep(1);
          setTerminalInput('');
        } else if (input === '/reset') {
          handleReset();
        }
      } else if (createStep === 1) {
        // Name
        if (input.length > 32) {
          setCurrentPrompt('Error: Name too long. Enter token name (max 32 characters):');
          setTerminalInput('');
          return;
        }
        setFormData({ ...formData, name: input });
        setCurrentPrompt('Enter token ticker/symbol (max 10 characters):');
        setCreateStep(2);
        setTerminalInput('');
      } else if (createStep === 2) {
        // Ticker
        if (input.length > 10) {
          setCurrentPrompt('Error: Ticker too long. Enter ticker (max 10 characters):');
          setTerminalInput('');
          return;
        }
        setFormData({ ...formData, ticker: input });
        setCurrentPrompt('Enter description (max 100 characters):');
        setCreateStep(3);
        setTerminalInput('');
      } else if (createStep === 3) {
        // Description
        if (input.length > 100) {
          setCurrentPrompt('Error: Description too long. Enter description (max 100 characters):');
          setTerminalInput('');
          return;
        }
        setFormData({ ...formData, description: input });
        setCurrentPrompt('Upload token image below. Then enter initial buy amount (0.1-5 SOL) or press Enter to skip:');
        setCreateStep(4);
        setTerminalInput('');
      } else if (createStep === 4) {
        // Initial buy amount
        const amount = input ? parseFloat(input) : 0;
        if (input && (isNaN(amount) || amount < 0.1 || amount > 5)) {
          setCurrentPrompt('Error: Amount must be 0.1-5 SOL. Enter amount or press Enter to skip:');
          setTerminalInput('');
          return;
        }
        setFormData({ ...formData, initialBuyAmount: input });
        setCurrentPrompt('Creating your token...');
        setTerminalHistory([]);
        setCreateStep(5);
        setTerminalInput('');
        
        // Start creation process
        await handleTokenCreation();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTokenCreation = async () => {
    if (!authenticated || !formData.image) return;

    try {
      setIsCreating(true);
      setTerminalHistory([...terminalHistory, 'Preparing token metadata...']);
      
      const { mintKeypair, imageUrl, metadataUrl } = await prepareCoinCreation({
        imageFile: formData.image,
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        xLink: formData.xLink,
        websiteLink: formData.websiteLink,
        telegramLink: formData.telegramLink,
      });
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No Solana wallet connected!');
      }
      
      const wallet = wallets[0];
      const walletPublicKey = new PublicKey(wallet.address);
      
      setTerminalHistory([...terminalHistory, 'Creating pool on Meteora...']);
      
      const meteoraResult = await createCoinOnMeteora({
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        imageUrl: metadataUrl,
        initialBuyAmount: formData.initialBuyAmount ? parseFloat(formData.initialBuyAmount) : undefined,
        walletPublicKey: walletPublicKey,
        baseMintKeypair: mintKeypair,
      });

      if (!meteoraResult.success || !meteoraResult.transactions) {
        throw new Error(meteoraResult.error || 'Failed to get Meteora transactions');
      }

      const validTransactions = meteoraResult.transactions.filter((tx) => tx);
      
      setTerminalHistory([...terminalHistory, `Signing ${validTransactions.length} transactions...`]);

      for (let i = 0; i < validTransactions.length; i++) {
        const tx = validTransactions[i];
        
        const serialized = tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        const res = await wallet.signAndSendTransaction!({
          chain: 'solana:mainnet',
          transaction: new Uint8Array(serialized),
        });

        const sigBase58 =
          typeof res.signature === 'string'
            ? res.signature
            : bs58.encode(res.signature);

        await connection.confirmTransaction(sigBase58, 'confirmed');
        setTerminalHistory(prev => [...prev, `✓ Transaction ${i + 1}/${validTransactions.length} confirmed`]);
      }

      setTerminalHistory(prev => [...prev, 'Saving token data...']);

      await saveCoin({
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        image: imageUrl,
        initialBuyAmount: formData.initialBuyAmount,
        xLink: formData.xLink,
        websiteLink: formData.websiteLink,
        telegramLink: formData.telegramLink,
        contractAddress: meteoraResult.contractAddress!,
        createdBy: wallet.address,
        ipfsMetadata: metadataUrl,
        verified: false,
        marketCap: 0,
        holders: 0,
        volume24h: 0,
        priceChange24h: 0,
      }, 'active');
      
      setTerminalHistory(prev => [...prev, '✓ Token created successfully!', `Contract: ${meteoraResult.contractAddress}`, '', 'Redirecting...']);
      
      setTimeout(() => {
        window.location.href = `/coin/${meteoraResult.contractAddress}`;
      }, 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      setTerminalHistory(prev => [...prev, `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setIsCreating(false);
      setCreateStep(0);
    }
  };

  const handleReset = () => {
    setCreateStep(0);
    setFormData({ name: '', ticker: '', description: '', image: null, xLink: '', websiteLink: '', telegramLink: '', initialBuyAmount: '' });
    setCurrentPrompt('');
    setTerminalHistory([]);
    setTerminalInput('');
    setIsCreating(false);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ddcfb9' }}>
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Terminal Section */}
        <div className="max-w-3xl mx-auto mb-12">
          {/* Mascot */}
          <div className="flex justify-center mb-8">
            <img 
              src="/Arena (27).png" 
              alt="Arena Mascot" 
              className="w-32 h-auto"
            />
          </div>

          {/* Terminal Interface */}
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
            {/* Terminal Header */}
            <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d4a574' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#b8966f' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b6f47' }}></div>
              </div>
              <div className="flex-1 text-center text-xs font-mono" style={{ color: '#5a4636' }}>sporky@terminal</div>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', maxHeight: '400px', overflowY: 'auto' }}>
              {/* Show current prompt or terminal history */}
              {createStep === 0 && terminalHistory.length === 0 ? (
                <>
                  <div className="mb-3">
                    <div className="text-sm mb-1 font-bold" style={{ color: '#5a4636' }}>Available commands:</div>
                    <div className="text-xs" style={{ color: '#6d5747' }}>  <span style={{ color: '#8b6f47', fontWeight: 'bold' }}>/create</span> - Launch a new token</div>
                    <div className="text-xs" style={{ color: '#6d5747' }}>  <span style={{ color: '#8b6f47', fontWeight: 'bold' }}>/reset</span> - Reset terminal</div>
                  </div>
                </>
              ) : terminalHistory.length > 0 ? (
                <div className="mb-4 space-y-1">
                  {terminalHistory.map((line, i) => (
                    <div key={i} className="text-sm" style={{ color: line.startsWith('✓') ? '#27ae60' : line.startsWith('✗') || line.startsWith('Error') ? '#e74c3c' : '#5a4636' }}>
                      {line}
                    </div>
                  ))}
                </div>
              ) : currentPrompt ? (
                <div className="mb-4">
                  <div className="text-sm font-bold" style={{ color: currentPrompt.startsWith('Error') ? '#e74c3c' : '#5a4636' }}>
                    {currentPrompt}
                  </div>
                </div>
              ) : null}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 flex items-center gap-3">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="text-xs" style={{ color: '#27ae60' }}>✓ Image uploaded</div>
                </div>
              )}

              {/* Image Upload (only show at step 4) */}
              {createStep === 4 && !formData.image && (
                <div className="mb-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="inline-block px-4 py-2 rounded text-white text-sm font-bold" style={{ backgroundColor: '#8b6f47' }}>
                      Upload Image
                    </div>
                  </label>
                </div>
              )}

              {/* Command Input */}
              {!isCreating && createStep < 5 && (
                <div className="flex items-center">
                  <span className="mr-2 font-bold" style={{ color: '#8b6f47' }}>❯</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalCommand}
                    placeholder={createStep === 0 ? "Type /create to start..." : "Type your answer..."}
                    className="bg-transparent outline-none flex-1 font-mono placeholder-gray-500"
                    style={{ color: '#3a2f26', caretColor: '#8b6f47' }}
                    autoFocus
                    disabled={createStep === 4 && !formData.image}
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Filter Tabs and Search */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('marketCap')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer"
              style={sortBy === 'marketCap' ? { backgroundColor: '#8b6f47', color: 'white' } : { backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#4a4a4a' }}
            >
              <ChartLineUp size={16} weight="regular" />
              Market cap
            </button>
            <button
              onClick={() => setSortBy('new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer"
              style={sortBy === 'new' ? { backgroundColor: '#8b6f47', color: 'white' } : { backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#4a4a4a' }}
            >
              <Lightning size={16} weight="regular" />
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
              className="pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none w-64"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#4a4a4a' }}
            />
            <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          </form>
        </div>

        {filteredCoins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No coins yet</h3>
            <p className="text-gray-600">Be the first to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredCoins.map((coin, index) => (
              <div 
                key={coin.id}
                className="rounded-2xl border border-gray-200 p-3 cursor-pointer aspect-square flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                onClick={() => window.location.href = `/coin/${coin.contractAddress}`}
              >
                {/* Social Icons Top Right */}
                <div className="flex justify-end gap-1 mb-2">
                  {coin.xLink && (
                    <button 
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.xLink, '_blank');
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </button>
                  )}
                  {coin.telegramLink && (
                    <button 
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.telegramLink, '_blank');
                      }}
                    >
                      <TelegramLogo size={14} weight="regular" />
                    </button>
                  )}
                  {coin.websiteLink && (
                    <button 
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.websiteLink, '_blank');
                      }}
                    >
                      <Globe size={14} weight="regular" />
                    </button>
                  )}
                  <button 
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(coin.contractAddress || '');
                    }}
                  >
                    <CopySimple size={14} weight="regular" />
                  </button>
                </div>

                {/* Coin Image */}
                <div className="flex-1 flex items-center justify-center mb-2">
                  <div className="w-20 h-20 rounded-xl overflow-hidden">
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Coin Info */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 truncate">{coin.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{coin.ticker}</p>
                  
                  {/* Stats */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Holders:</span>
                      <span className="font-bold text-gray-900">
                        {(coin.holders || 0) >= 1000 
                          ? `${((coin.holders || 0) / 1000).toFixed(1)}K`
                          : (coin.holders || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">24h Vol:</span>
                      <span className="font-bold text-gray-900">
                        ${(coin.volume24h || 0) >= 1000 
                          ? `${((coin.volume24h || 0) / 1000).toFixed(0)}K`
                          : (coin.volume24h || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">24h Change:</span>
                      <span className={`font-bold ${
                        (coin.priceChange24h || 0) >= 0 ? 'text-green-600' : 'text-pink-600'
                      }`}>
                        {(coin.priceChange24h || 0) >= 0 ? '+' : ''}{(coin.priceChange24h || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Market Cap:</span>
                      <span className="font-bold text-gray-900">
                        ${(coin.marketCap || 0) >= 1000000 
                          ? `${((coin.marketCap || 0) / 1000000).toFixed(2)}M`
                          : `${((coin.marketCap || 0) / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
