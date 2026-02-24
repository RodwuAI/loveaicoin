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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '邮箱格式不正确';
    }
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6位';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
        login(data.data?.accessToken, data.data?.user?.username || '用户', data.data?.user?.id);
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

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-email/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetMessage(data.message || '验证码已发送');
        setResetStep('code');
      } else {
        setResetError(data.error || '发送失败');
      }
    } catch (err) {
      setResetError('网络错误，请稍后重试');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-email/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetMessage('密码重置成功！请使用新密码登录');
        setTimeout(() => {
          setShowResetPassword(false);
          setResetStep('email');
          setResetEmail('');
          setResetCode('');
          setNewPassword('');
          setResetMessage('');
        }, 2000);
      } else {
        setResetError(data.error || '重置失败');
      }
    } catch (err) {
      setResetError('网络错误，请稍后重试');
    } finally {
      setResetLoading(false);
    }
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
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-400' : 'border-[#E8EAF0]'} focus:border-gold focus:ring focus:ring-gold/20 outline-none transition-all duration-200`}
                  placeholder="请输入您的邮箱地址"
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-navy mb-3">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-400' : 'border-[#E8EAF0]'} focus:border-gold focus:ring focus:ring-gold/20 outline-none transition-all duration-200`}
                  placeholder="请输入您的密码"
                />
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
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

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-gold hover:text-gold-light text-sm font-medium"
              >
                忘记密码？
              </button>
            </div>

            <div className="mt-4 text-center">
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

      {/* 重置密码弹窗 */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-[420px] w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">
                {resetStep === 'email' ? '重置密码' : '输入验证码'}
              </h3>
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetStep('email');
                  setResetError('');
                  setResetMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {resetMessage && (
              <div className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl mb-4">
                {resetMessage}
              </div>
            )}

            {resetError && (
              <div className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">
                {resetError}
              </div>
            )}

            {resetStep === 'email' ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">邮箱地址</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none"
                    placeholder="请输入注册邮箱"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn btn-primary btn-lg"
                >
                  {resetLoading ? '发送中...' : '发送验证码'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">验证码</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] focus:border-gold focus:ring focus:ring-gold/20 outline-none"
                    placeholder="请输入新密码（至少8位）"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn btn-primary btn-lg"
                >
                  {resetLoading ? '重置中...' : '重置密码'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStep('email')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  返回重新发送
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}