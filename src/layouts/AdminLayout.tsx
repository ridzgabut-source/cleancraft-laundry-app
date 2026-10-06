import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminNav } from '../components/admin/AdminNav';
import { mockApi } from '../lib/mockApi';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = mockApi.adminGetAuth();
    if (!auth) {
      // Auto authenticate for instant demo convenience, or navigate to login
      // To ensure smooth first testing, we can check localStorage:
      navigate('/admin/login');
    }
    setCheckingAuth(false);
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Memeriksa sesi admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-100">
      <AdminNav />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
