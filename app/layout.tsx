'use client';

import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

function WalletAdapter({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [], []);
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC || '', []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Sporky</title>
        <meta name="description" content="Launch and trade memecoins on Solana" />
        <link rel="icon" href="/Arena (27).png" />
        <meta property="og:title" content="Sporky" />
        <meta property="og:description" content="Launch and trade memecoins on Solana" />
        <meta property="og:image" content="/Arena (27).png" />
      </head>
      <body className="antialiased">
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            appearance: {
              walletChainType: 'solana-only',
              walletList: ['phantom']
            },
            externalWallets: {
              solana: {
                connectors: toSolanaWalletConnectors({
                  shouldAutoConnect: true,
                }),
              },
            },
          }}
        >
          <WalletAdapter>
            <Navbar />
            <Sidebar />
            {children}
          </WalletAdapter>
        </PrivyProvider>
      </body>
    </html>
  );
}
