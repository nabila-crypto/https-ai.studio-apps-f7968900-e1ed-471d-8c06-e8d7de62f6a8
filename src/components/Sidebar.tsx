import React from 'react';
import {
  LayoutDashboard,
  Ship,
  Anchor,
  Users,
  Compass,
  PackageCheck,
  FileCheck2,
  BarChart3,
  Database,
  Radio,
} from 'lucide-react';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  vesselsCount: number;
  portsCount: number;
  crewCount: number;
  voyagesCount: number;
  bookingsCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeView,
  setActiveView,
  vesselsCount,
  portsCount,
  crewCount,
  voyagesCount,
  bookingsCount,
}) => {
  const masterNav = [
    { id: 'vessels', label: 'Armada Kapal', icon: Ship, count: vesselsCount },
    { id: 'ports', label: 'Pelabuhan & Terminal', icon: Anchor, count: portsCount },
    { id: 'crew', label: 'Nahkoda & Kru Pelaut', icon: Users, count: crewCount },
  ];

  const transactionNav = [
    { id: 'voyages', label: 'Jadwal & Rute Voyage', icon: Compass, count: voyagesCount },
    { id: 'bookings', label: 'Manifest & Kargo B/L', icon: PackageCheck, count: bookingsCount },
    { id: 'clearances', label: 'Surat Perintah Berlayar (SPB)', icon: FileCheck2 },
  ];

  const systemNav = [
    { id: 'reports', label: 'Laporan & Rekapitulasi', icon: BarChart3 },
    { id: 'database_bridge', label: 'Koneksi Real Database', icon: Database, badge: 'Multi-Cloud' },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6 flex-1">
        {/* Main Dashboard */}
        <div>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-600/20'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Utama</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Master Data Group */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Master Data Pelayaran
          </div>
          <div className="space-y-1">
            {masterNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaksi Data Group */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Transaksi Data Operasional
          </div>
          <div className="space-y-1">
            {transactionNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Laporan & Sistem Group */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Laporan & Integrasi Cloud
          </div>
          <div className="space-y-1">
            {systemNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Online Sync Footer Indicator */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <div className="truncate">
            <div className="text-[11px] font-semibold text-slate-200">
              Live Cloud Active
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Sinkronisasi data multi-user aktif
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
