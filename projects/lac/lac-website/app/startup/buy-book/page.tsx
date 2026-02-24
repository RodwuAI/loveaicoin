'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function BuyBookPage() {
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Link href="/startup/ai-book-1-10" className="text-gold hover:text-gold-light text-sm font-medium mb-6 inline-block">
            ← 返回书籍详情
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-navy mb-4">
            购买《1+10：AI时代的一人公司实战》
          </h1>
          <p className="text-gray-500 text-lg">扫码支付，开启你的AI创业之旅</p>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-16">
        <div className="max-w-[520px] mx-auto px-6">
          {/* Book Info Card */}
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-5xl">📚</div>
              <div className="flex-1">
                <h3 className="font-bold text-navy text-lg">1+10：AI时代的一人公司实战</h3>
                <p className="text-gray-500 text-sm mt-1">215页 · 完整实战指南</p>
              </div>
              <div className="text-3xl font-black text-gold">¥99</div>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setPayMethod('wechat')}
              className={`flex-1 py-4 rounded-2xl font-bold text-center transition-all ${
                payMethod === 'wechat'
                  ? 'bg-[#07C160] text-white shadow-lg shadow-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl mr-2">💬</span>微信支付
            </button>
            <button
              onClick={() => setPayMethod('alipay')}
              className={`flex-1 py-4 rounded-2xl font-bold text-center transition-all ${
                payMethod === 'alipay'
                  ? 'bg-[#1677FF] text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl mr-2">💰</span>支付宝
            </button>
          </div>

          {/* QR Code */}
          <div className="card p-8 text-center">
            <div className={`inline-block p-4 rounded-2xl mb-6 ${
              payMethod === 'wechat' ? 'bg-[#07C160]/10' : 'bg-[#1677FF]/10'
            }`}>
              <Image
                src={payMethod === 'wechat' ? '/wechat-pay.jpg' : '/alipay.jpg'}
                alt={payMethod === 'wechat' ? '微信收款码' : '支付宝收款码'}
                width={280}
                height={280}
                className="rounded-xl"
              />
            </div>

            <p className={`text-lg font-bold mb-2 ${
              payMethod === 'wechat' ? 'text-[#07C160]' : 'text-[#1677FF]'
            }`}>
              {payMethod === 'wechat' ? '请使用微信扫码支付' : '请使用支付宝扫码支付'}
            </p>
            <p className="text-gray-400 text-sm mb-6">支付金额：¥99</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-amber-800 text-sm font-medium mb-2">📋 支付后请注意：</p>
              <ol className="text-amber-700 text-sm space-y-1.5">
                <li>1. 扫码支付 <strong>¥99</strong></li>
                <li>2. 支付时请备注您的 <strong>邮箱地址</strong></li>
                <li>3. 我们将在24小时内发送电子版到您的邮箱</li>
                <li>4. 如需印刷版，请在备注中注明收货地址</li>
              </ol>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-xs text-gray-500">即时发货</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-xs text-gray-500">安全支付</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💎</div>
              <div className="text-xs text-gray-500">购书送LAC</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
