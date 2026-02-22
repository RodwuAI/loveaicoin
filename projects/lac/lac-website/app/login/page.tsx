'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-email/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.accessToken) {
        // 使用AuthContext登录
        login(data.data?.accessToken, data.data?.user?.username || '用户');
        // 登录成功，跳转到个人中心
        router.push('/profile');
      } else {
        setError(data.error || '登录失败，请检查邮箱和密码');
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
          <span className="section-label justify-center">Login</span>
          <h1 className="text-4xl lg:text-[56px] font-black text-navy leading-[1.1] mb-6 tracking-tight">
            登录 LAC
          </h1>
          <p className="text-lg text-gray-500 max-w-[680px] mx-auto leading-relaxed">
            欢迎回来！继续你的 AI 学习之旅
          </p>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[500px] mx-auto px-6">
          <div className="card p-12">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-4xl mx-auto mb-8">
              🔐
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="请输入您的密码"
                />
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
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                还没有账户？{' '}
                <Link href="/register" className="text-gold hover:text-gold-light font-semibold">
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}