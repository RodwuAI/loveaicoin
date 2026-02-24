import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/Toast';
import { WalletContextProvider } from '@/lib/wallet-context';

export const metadata: Metadata = {
  title: 'LAC — 来自AI的第一封邀请函',
  description: 'Love AI Coin — 首个以AI教育为核心挖矿机制的Web3项目。学习即挖矿，拥抱即未来。Learn to Mine, Embrace the Future.',
  keywords: ['LAC', 'Love AI Coin', 'Web3', 'AI Education', 'Learn to Earn', 'Solana', '挖矿', 'AI学习'],
  authors: [{ name: 'LAC Team' }],
  openGraph: {
    title: 'LAC — 来自AI的第一封邀请函',
    description: '首个以AI教育为核心挖矿机制的Web3项目。学习即挖矿，拥抱即未来。',
    url: 'https://loveaicoin.com',
    siteName: 'Love AI Coin',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/logo.png', width: 448, height: 450, alt: 'LAC Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'LAC — 来自AI的第一封邀请函',
    description: '首个以AI教育为核心挖矿机制的Web3项目。学习即挖矿，拥抱即未来。',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://loveaicoin.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <WalletContextProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
