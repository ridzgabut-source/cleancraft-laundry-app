import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Envelope, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cleancraft.id');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await mockApi.adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@cleancraft.id');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 font-bold">
            <Sparkle weight="fill" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Portal Admin Outlet
          </h1>
          <p className="text-xs text-slate-400">
            CleanCraft Laundry Studio — Single Outlet Management
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Email Administrator
            </label>
            <div className="relative">
              <Envelope weight="bold" className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cleancraft.id"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock weight="bold" className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Akun demo siap pakai:</span>
            <button
              type="button"
              onClick={fillDemo}
              className="font-mono text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
              admin@cleancraft.id
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tactile-btn w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Masuk ke Sistem...' : 'Masuk ke Dashboard'}</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Kembali ke Website Pelanggan
          </Link>
        </div>
      </div>
    </div>
  );
};
