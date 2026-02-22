'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-email/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.accessToken) {
        // 使用AuthContext登录
        login(data.data?.accessToken, data.data?.user?.username || formData.username);
        // 注册成功，跳转到个人中心
        router.push('/profile');
      } else {
        setError(data.error || '注册失败，请检查输入信息');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-white to-surface">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="section-label justify-center">Register</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
            注册 LAC
          </h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            加入 LAC 社区，开始你的 AI 学习挖矿之旅
          </p>
        </div>
      </section>

      {/* Register Form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[500px] mx-auto px-6">
          <div className="card p-12">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-4xl mx-auto mb-8">
              👋
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-navy mb-3">
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none transition-all duration-200"
                  placeholder="请输入用户名（2-20个字符）"
                  minLength={2}
                  maxLength={20}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-navy mb-3">
                  邮箱地址
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none transition-all duration-200"
                  placeholder="请输入您的邮箱地址"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-navy mb-3">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none transition-all duration-200"
                  placeholder="请输入密码（至少6位）"
                  minLength={6}
                />
                <div className="text-xs text-gray-400 mt-2">
                  密码至少包含6个字符
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg"
              >
                {loading ? '注册中...' : '创建账户'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                已有账户？{' '}
                <Link href="/login" className="text-gold hover:text-gold-light font-semibold">
                  立即登录
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-gray-400 text-center">
              注册即表示同意我们的{' '}
              <Link href="/terms" className="text-gold hover:text-gold-light">
                服务条款
              </Link>{' '}
              和{' '}
              <Link href="/privacy" className="text-gold hover:text-gold-light">
                隐私政策
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}