'use client';

import ImageUpload from '@/components/ImageUpload';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import Modal from '@/components/Modal';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useConnection } from '@solana/wallet-adapter-react';
import { prepareCoinCreation } from '@/lib/services/mintService';
import { createCoinOnMeteora } from '@/lib/services/meteoraService';
import { saveCoin } from '@/lib/services/coinService';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { CaretDown, Coin, Gear } from 'phosphor-react';
import Script from 'next/script';

export default function CreateCoin() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    initialBuyAmount: '',
    xLink: '',
    websiteLink: '',
    telegramLink: '',
    telegramHandle: '',
    githubRepo: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate initialBuyAmount
    if (name === 'initialBuyAmount') {
      const numValue = parseFloat(value);
      if (value !== '' && (numValue < 0.1 || numValue > 5)) {
        return; // Don't update if outside range
      }
    }
    
    // Validate name length (max 32 characters)
    if (name === 'name' && value.length > 32) {
      return;
    }
    
    // Validate ticker length (max 10 characters)
    if (name === 'ticker' && value.length > 10) {
      return;
    }
    
    // Validate description length (max 100 characters)
    if (name === 'description' && value.length > 100) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not authenticated, open Privy login instead of modal
    if (!authenticated) {
      login();
      return;
    }
    
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!authenticated || !formData.image) return;

    try {
      setIsCreating(true);
      
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
      
      console.log('🚀 Signing', validTransactions.length, 'transactions (one at a time, via Privy)');

      const results: { signature: string }[] = [];

      for (let i = 0; i < validTransactions.length; i++) {
        const tx = validTransactions[i];
        console.log(`Signing transaction ${i + 1}/${validTransactions.length}`);

        // 1) Serialize the transaction to bytes
        const serialized = tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        // 2) Let Privy sign AND send it
        const res = await wallet.signAndSendTransaction!({
          chain: 'solana:mainnet',
          transaction: new Uint8Array(serialized),
        });

        // 3) Normalize signature to base58 for confirmTransaction
        const sigBase58 =
          typeof res.signature === 'string'
            ? res.signature
            : bs58.encode(res.signature);

        await connection.confirmTransaction(sigBase58, 'confirmed');
        results.push({ signature: sigBase58 });

        console.log(`Transaction ${i + 1} confirmed:`, sigBase58);
      }

      console.log('✅ All transactions confirmed!');

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
        createdBy: wallet.address, // Store creator's wallet address
        ipfsMetadata: metadataUrl,
        verified: false,
        marketCap: 0,
        holders: 0,
        volume24h: 0,
        priceChange24h: 0,
        category: 'meme', // Tag as meme
      }, 'active'); // Admin creates with 'active' status
      
      window.location.href = `/coin/${meteoraResult.contractAddress}`;

    } catch (error) {
      console.error('❌ Error:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <main className="mx-auto max-w-lg px-6 py-8">
        {/* Header */}
        <h1 className="text-white text-2xl font-bold mb-8 flex items-center gap-3">
          <Coin size={28} weight="bold" />
          Create Meme
        </h1>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <div className="w-28 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-7 h-7 text-gray-600 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-medium text-gray-500">Token Image</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Name and Ticker Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Token / Meme Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Agent Meme"
                maxLength={32}
                required
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                style={{ backgroundColor: '#1a1a1a' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Token Symbol
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-sm">$</span>
                <input
                  type="text"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  placeholder="ABCD"
                  maxLength={10}
                  required
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  style={{ backgroundColor: '#1a1a1a' }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Token Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your meme in 2-3 sentences"
              maxLength={100}
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm leading-relaxed"
              style={{ backgroundColor: '#1a1a1a' }}
            />
          </div>

          {/* Advanced Options */}
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="w-full text-sm text-gray-400 cursor-pointer flex items-center gap-2 hover:text-gray-300 transition-colors py-1"
          >
            <Gear size={16} weight="bold" />
            <span className="font-bold">Advanced Options</span>
            <span className="text-xs font-normal">(optional)</span>
            <CaretDown 
              size={14} 
              weight="bold"
              className={`ml-auto transition-transform ${showOptionalFields ? 'rotate-180' : ''}`}
            />
          </button>

          {showOptionalFields && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">X / Twitter</label>
                <input
                  type="url"
                  name="xLink"
                  value={formData.xLink}
                  onChange={handleChange}
                  placeholder="https://x.com/yourtoken"
                  className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: '#1a1a1a' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">Website</label>
                <input
                  type="url"
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleChange}
                  placeholder="https://yourtoken.com"
                  className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: '#1a1a1a' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">Telegram</label>
                <input
                  type="url"
                  name="telegramLink"
                  value={formData.telegramLink}
                  onChange={handleChange}
                  placeholder="https://t.me/yourtoken"
                  className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-600 placeholder:font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: '#1a1a1a' }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white font-bold rounded-lg transition-all hover:opacity-90 cursor-pointer text-sm mt-6"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {authenticated ? 'Create Meme' : 'Sign In to Create Meme'}
          </button>
        </form>

        <Modal 
          isOpen={showModal} 
          onClose={() => !isCreating && setShowModal(false)}
          onSubmit={handleFinalSubmit}
          ticker={formData.ticker}
          isCreating={isCreating}
        >
          {isCreating ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="number"
                  name="initialBuyAmount"
                  value={formData.initialBuyAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.1"
                  max="5"
                  step="0.1"
                  autoComplete="off"
                  className="w-full px-3 py-2 pr-12 rounded-lg text-gray-900 font-semibold placeholder-gray-500 focus:outline-none border-0 text-sm"
                  style={{ backgroundColor: '#ffffff' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-sm">
                  SOL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tip: Buying a small amount helps protect your coin from snipers
              </p>
            </>
          )}
        </Modal>
      </main>
    </div>
  );
}
