import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail, User, ShieldCheck, Database, ArrowRight, Anchor, Globe2 } from 'lucide-react';
import { UserRole } from '../types/maritime';

export const LoginForm: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemoAdmin, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@pelayaran-maritimx.co.id');
  const [password, setPassword] = useState('AdminMaritim2026!');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('super_admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, name || email.split('@')[0], role);
      } else {
        await loginWithEmail(email, password, role);
      }
    } catch {
      // Error handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdmin = async (presetRole: UserRole = 'super_admin') => {
    setIsSubmitting(true);
    try {
      await loginAsDemoAdmin(presetRole);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserEmailLogin = async () => {
    setEmail('zhwppyaaa@gmail.com');
    setPassword('Maritim2026#Secure');
    setIsSubmitting(true);
    try {
      await loginWithEmail('zhwppyaaa@gmail.com', 'Maritim2026#Secure', 'super_admin');
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Oceanic maritime backdrop gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-xl shadow-sky-600/30 mb-4 ring-4 ring-sky-500/20">
            <Ship className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Maritim<span className="text-sky-400">X</span> Logistics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sistem Informasi Manajemen Perusahaan Pelayaran Terpadu
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Real Database Sync (Firestore & Multi-Cloud)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Globe2 className="w-3 h-3" />
              Multi-Akun Realtime
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-800/70 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearError();
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk (Admin Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearError();
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Petugas Baru
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Petugas / Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bpk. Bambang Sutrisno"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username / Email Petugas
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pelayaran-maritimx.co.id"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Min. 6 Karakter</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hak Akses / Peran (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="super_admin">Super Admin Pelayaran (Full Akses CRUD)</option>
                <option value="ops_manager">Manajer Operasional & Voyage</option>
                <option value="dispatcher">Petugas Dispatcher & Manifest Pelabuhan</option>
                <option value="finance">Petugas Keuangan & Freight</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Daftarkan Akun Petugas' : 'Masuk ke Sistem Pelayaran'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-2.5 text-center">
              Akses Cepat (Otomatis Terverifikasi):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdmin('super_admin')}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Masuk Sebagai Super Admin
              </button>
              <button
                type="button"
                onClick={handleUserEmailLogin}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                Akun Pemilik (zhwppyaaa)
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => loginWithGoogle(role)}
                disabled={isSubmitting}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Masuk Menggunakan Google Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Database & Security Architecture Footer Note */}
        <div className="mt-4 text-center flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            Cloud Database Enterprise (Firestore / Multi-Cloud)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            RBAC & Audit Trail Active
          </span>
        </div>
      </div>
    </div>
  );
};
