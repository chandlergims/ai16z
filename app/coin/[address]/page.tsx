'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCoinByAddress } from '@/lib/services/coinService';
import { Coin } from '@/types/coin';
import CoinHeader from '@/components/coin/CoinHeader';
import CoinStats from '@/components/coin/CoinStats';
import CoinChart from '@/components/coin/CoinChart';
import CoinDescription from '@/components/coin/CoinDescription';
import CoinFees from '@/components/coin/CoinFees';

export default function CoinPage() {
  const params = useParams();
  const address = params.address as string;
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoin = async () => {
      try {
        const coinData = await getCoinByAddress(address);
        setCoin(coinData);
      } catch (error) {
        console.error('Error loading coin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoin();
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center text-white">Coin not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <CoinHeader
            image={coin.image}
            name={coin.name}
            ticker={coin.ticker}
            xLink={coin.xLink}
            telegramLink={coin.telegramLink}
            websiteLink={coin.websiteLink}
            contractAddress={coin.contractAddress}
          />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <CoinStats
            marketCap={coin.marketCap || 0}
            volume24h={coin.volume24h || 0}
            holders={coin.holders || 0}
            priceChange24h={coin.priceChange24h || 0}
          />
        </div>

        {/* Chart and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - 2/3 width */}
          <div className="lg:col-span-2">
            <CoinChart address={address} />
          </div>

          {/* Details - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            <CoinDescription description={coin.description} />
            <CoinFees createdBy={coin.createdBy} />
          </div>
        </div>
      </main>
    </div>
  );
}
