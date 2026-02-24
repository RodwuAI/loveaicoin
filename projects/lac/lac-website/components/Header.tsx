'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import WalletButton from './WalletButton';

const basePath = '';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/checkin', label: '签到' },
  { href: '/mining/learn', label: '学AI' },
  { href: '/mining/teach', label: '教AI' },
  { href: '/mining/create', label: 'AI创造' },
  { href: '/community', label: '社区' },
  { href: '/startup', label: 'AI公益和创业' },
  { href: '/tokenomics', label: 'AI币' },
];

export default function Header() {
  const { isLoggedIn, username, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#E8EAF0]/60 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="LAC" width={48} height={48} className="h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-navy relative group transition-colors duration-200"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold rounded scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="btn btn-ghost btn-sm opacity-50 cursor-not-allowed" disabled title="多语言即将上线">中 / EN</button>
          <WalletButton size="sm" />
          {loading ? (
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-sm font-medium text-navy hover:text-gold">
                👋 {username}
              </Link>
              <button 
                onClick={logout}
                className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
              >
                退出
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-md">
              登录
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
        >
          <span className={`w-[22px] h-0.5 bg-navy rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-[22px] h-0.5 bg-navy rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-[22px] h-0.5 bg-navy rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E8EAF0] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-gray-600 hover:text-navy py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#E8EAF0] space-y-3">
            <div className="flex gap-3 items-center">
              <button className="btn btn-ghost btn-sm opacity-50 cursor-not-allowed" disabled title="多语言即将上线">中 / EN</button>
              <WalletButton size="sm" className="flex-1" />
            </div>
            <div className="flex gap-3 items-center">
              {loading ? (
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
              ) : isLoggedIn ? (
                <>
                  <Link href="/profile" className="btn btn-ghost btn-sm">
                    👋 {username}
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="btn btn-ghost btn-sm text-red-500"
                  >
                    退出
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm flex-1">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}