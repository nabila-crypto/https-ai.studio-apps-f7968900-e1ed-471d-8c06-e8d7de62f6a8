import React from 'react';
import {
  Ship,
  Anchor,
  Compass,
  PackageCheck,
  TrendingUp,
  Activity,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import {
  Vessel,
  Port,
  Voyage,
  Booking,
  AuditLog,
} from '../types/maritime';

interface Props {
  vessels: Vessel[];
  ports: Port[];
  voyages: Voyage[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  setActiveView: (view: string) => void;
  onOpenCreateVessel: () => void;
  onOpenCreateVoyage: () => void;
  onOpenCreateBooking: () => void;
}

export const DashboardView: React.FC<Props> = ({
  vessels,
  ports,
  voyages,
  bookings,
  auditLogs,
  setActiveView,
  onOpenCreateVessel,
  onOpenCreateVoyage,
  onOpenCreateBooking,
}) => {
  const sailingVessels = vessels.filter((v) => v.status === 'sailing').length;
  const activeVoyages = voyages.filter((v) => v.status === 'in_transit');
  const totalTons = bookings.reduce((sum, b) => sum + (b.grossWeightTons || 0), 0);
  const totalFreightRevenue = bookings.reduce((sum, b) => sum + (b.freightPriceIdr || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/80 to-slate-900 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Fleet & Logistics Operations System</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Pusat Kendali Pelayaran & Manifest Nasional
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Memantau operasional armada kapal, rute berlayar antar pelabuhan, kargo B/L kontainer, serta status kelaiklautan secara online dan realtime.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateVoyage}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Jadwal Voyage Baru</span>
            </button>
            <button
              onClick={onOpenCreateBooking}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Input Manifest B/L</span>
            </button>
            <button
              onClick={onOpenCreateVessel}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors"
            >
              <Ship className="w-4 h-4 text-sky-400" />
              <span>Tambah Kapal</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Armada Kapal</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{vessels.length}</span>
            <span className="text-xs text-emerald-400 font-medium">
              ({sailingVessels} Sedang Berlayar)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Kapal Aktif Terverifikasi</span>
            <button
              onClick={() => setActiveView('vessels')}
              className="text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Voyage & Rute Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{voyages.length}</span>
            <span className="text-xs text-sky-400 font-medium">
              ({activeVoyages.length} In Transit)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Rute Antar Pelabuhan</span>
            <button
              onClick={() => setActiveView('voyages')}
              className="text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Jadwal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Kargo Manifest</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {totalTons.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400">Tonase</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{bookings.length} Order Bill of Lading</span>
            <button
              onClick={() => setActiveView('bookings')}
              className="text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Manifest</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Estimasi Freight Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white truncate block">
              {formatRupiah(totalFreightRevenue)}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Transaksi Tercatat</span>
            <button
              onClick={() => setActiveView('reports')}
              className="text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Laporan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Voyages vs Realtime Sync Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Voyages (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Pelayaran Aktif & Monitoring Posisi Laut</span>
              </h2>
              <p className="text-xs text-slate-400">
                Status perjalanan dan perkiraan waktu tiba armada
              </p>
            </div>
            <button
              onClick={() => setActiveView('voyages')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Lihat Semua ({voyages.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">No. Voyage / Kapal</th>
                  <th className="pb-3 font-semibold">Rute Pelayaran</th>
                  <th className="pb-3 font-semibold">Status & Koordinat</th>
                  <th className="pb-3 font-semibold">ETD / ETA</th>
                  <th className="pb-3 font-semibold text-right">Muatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {voyages.slice(0, 5).map((voy) => (
                  <tr key={voy.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-white">{voy.voyageNumber}</div>
                      <div className="text-[11px] text-slate-400">{voy.vesselName}</div>
                    </td>
                    <td className="py-3 pr-2">
                      <div className="text-slate-200 font-medium truncate max-w-[170px]">
                        {voy.originPortName.split('(')[0]}
                      </div>
                      <div className="text-sky-400 text-[11px]">
                        ➔ {voy.destinationPortName.split('(')[0]}
                      </div>
                    </td>
                    <td className="py-3 pr-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                          voy.status === 'in_transit'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : voy.status === 'scheduled'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : voy.status === 'berthed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {voy.status === 'in_transit'
                          ? '🚢 In Transit'
                          : voy.status === 'scheduled'
                          ? '⏳ Terjadwal'
                          : voy.status === 'berthed'
                          ? '⚓ Sandar'
                          : voy.status}
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {voy.currentCoordinates || '-'}
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-slate-300 text-[11px]">
                      <div>Tiba: {voy.eta ? voy.eta.replace('T', ' ') : '-'}</div>
                      <div className="text-slate-400">Kapten: {voy.captainName || '-'}</div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="font-semibold text-white">{voy.cargoLoadPercent || 0}%</div>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 ml-auto mt-1 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${voy.cargoLoadPercent || 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {voyages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Belum ada data voyage. Buat jadwal pelayaran pertama Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Multi-User Audit Activity Feed (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white">Live Multi-User Sync</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Realtime
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Perubahan data langsung muncul di seluruh akun yang sedang login tanpa reload.
          </p>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      log.action === 'CREATE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : log.action === 'UPDATE'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {log.action} • {log.module}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="font-medium text-slate-200 truncate">
                  {log.targetTitle}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Oleh: <span className="text-slate-300">{log.userEmail}</span>
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                Belum ada aktivitas. Coba tambah atau ubah data untuk melihat live sync log.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
