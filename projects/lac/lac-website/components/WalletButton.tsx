'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';

interface WalletButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WalletButton({ className = '', size = 'md' }: WalletButtonProps) {
  const { publicKey, connecting, connected, disconnect } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleClick = () => {
    if (connected && publicKey) {
      setShowDropdown(!showDropdown);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  if (connecting) {
    return (
      <button disabled className={`btn btn-primary ${sizeClasses[size]} ${className}`}>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        连接中...
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        className={`btn ${connected ? 'btn-secondary border-gold text-gold hover:bg-gold hover:text-white' : 'btn-primary'} ${sizeClasses[size]} ${className}`}
      >
        {connected && publicKey ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {formatAddress(publicKey.toString())}
          </>
        ) : (
          <>
            💰 连接钱包
          </>
        )}
      </button>
      
      {/* Dropdown menu */}
      {showDropdown && connected && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
            {publicKey && formatAddress(publicKey.toString())}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicKey?.toString() || '');
              setShowDropdown(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            📋 复制地址
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            🔌 断开连接
          </button>
        </div>
      )}
      
      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}