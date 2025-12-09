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
        <title>pi16z</title>
        <meta name="description" content="The Agent Layer for the Prediction Economy" />
        <link rel="icon" href="/9nZTxBnR_400x400.jpg" />
        <meta property="og:title" content="pi16z" />
        <meta property="og:description" content="The Agent Layer for the Prediction Economy" />
        <meta property="og:image" content="/9nZTxBnR_400x400.jpg" />
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
