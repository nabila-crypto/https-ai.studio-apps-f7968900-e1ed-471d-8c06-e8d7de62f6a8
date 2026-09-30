import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  LogOut,
  Database,
  Radio,
  ChevronDown,
  UserCheck,
  Server,
} from 'lucide-react';
import { UserRole } from '../types/maritime';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<Props> = ({ setActiveView }) => {
  const { currentUser, logout, switchRole, dbConnected } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'ops_manager':
        return 'Manajer Ops';
      case 'dispatcher':
        return 'Dispatcher';
      case 'finance':
        return 'Keuangan';
      default:
        return 'Admin';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-600/30">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight">
                Maritim<span className="text-sky-400">X</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Logistics OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sistem Manajemen Perusahaan Pelayaran Nasional
            </p>
          </div>
        </div>

        {/* Center: Live Database Connection & Online Sync Status */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setActiveView('database_bridge')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 hover:border-sky-500/50 text-xs transition-colors"
            title="Klik untuk melihat status koneksi multi-database (Firebase, Supabase, Neon)"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium text-slate-200">
              {dbConnected ? 'Firestore Enterprise (Live)' : 'Menghubungkan DB...'}
            </span>
            <span className="text-[10px] text-slate-400">|</span>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-300">Sync Online</span>
          </button>
        </div>

        {/* Right side: User Profile, Role Badge & Logout */}
        <div className="flex items-center space-x-3">
          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold text-sky-300">
                {getRoleLabel(currentUser?.role)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                  Ganti Hak Akses Uji Coba:
                </div>
                {(['super_admin', 'ops_manager', 'dispatcher', 'finance'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      currentUser?.role === r ? 'text-sky-400 font-bold bg-sky-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>{getRoleLabel(r)}</span>
                    {currentUser?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {currentUser?.email}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
