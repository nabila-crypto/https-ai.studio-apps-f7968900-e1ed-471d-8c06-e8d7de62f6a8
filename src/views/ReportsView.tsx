import React, { useState } from 'react';
import { Vessel, Port, Voyage, Booking, Clearance } from '../types/maritime';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  Ship,
  TrendingUp,
  PackageCheck,
  Fuel,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  vessels: Vessel[];
  ports: Port[];
  voyages: Voyage[];
  bookings: Booking[];
  clearances: Clearance[];
}

export const ReportsView: React.FC<Props> = ({
  vessels,
  voyages,
  bookings,
}) => {
  const [reportType, setReportType] = useState<'manifest' | 'voyage' | 'financial'>('financial');
  const [selectedVessel, setSelectedVessel] = useState<string>('all');

  // Filter bookings and voyages based on selected vessel
  const filteredBookings = bookings.filter((b) => {
    if (selectedVessel === 'all') return true;
    const voy = voyages.find((v) => v.id === b.voyageId);
    return voy?.vesselId === selectedVessel;
  });

  const filteredVoyages = voyages.filter((v) => {
    if (selectedVessel === 'all') return true;
    return v.vesselId === selectedVessel;
  });

  // Aggregates
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.freightPriceIdr || 0), 0);
  const totalTons = filteredBookings.reduce((sum, b) => sum + (b.grossWeightTons || 0), 0);
  const totalFuelLiters = filteredVoyages.reduce((sum, v) => sum + (v.fuelConsumptionLiters || 0), 0);
  const paidCount = filteredBookings.filter((b) => b.paymentStatus === 'paid').length;
  const creditCount = filteredBookings.filter((b) => b.paymentStatus === 'credit').length;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];

    if (reportType === 'financial' || reportType === 'manifest') {
      headers = 'No BL,Voyage,Shipper,Consignee,Tipe Kargo,Kontainer,Tonase,Tarif Freight (IDR),Status Bayar,Status Muatan';
      rows = filteredBookings.map((b) =>
        `"${b.blNumber}","${b.voyageNumber}","${b.shipperName}","${b.consigneeName}","${b.cargoType}","${b.containerCount}","${b.grossWeightTons}","${b.freightPriceIdr}","${b.paymentStatus}","${b.bookingStatus}"`
      );
    } else {
      headers = 'No Voyage,Kapal,Asal,Tujuan,ETD,ETA,Status,Muatan %,BBM (Liter),Kapten';
      rows = filteredVoyages.map((v) =>
        `"${v.voyageNumber}","${v.vesselName}","${v.originPortName}","${v.destinationPortName}","${v.etd}","${v.eta}","${v.status}","${v.cargoLoadPercent}","${v.fuelConsumptionLiters}","${v.captainName}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_MaritimX_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Pelaporan & Analitika</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Laporan Operasional & Keuangan Pelayaran
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Rekapitulasi pendapatan freight, tonase kargo, utilisasi armada, dan ekspor dokumen resmi.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Vessel Selector */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Jenis Laporan:</span>
          <button
            onClick={() => setReportType('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              reportType === 'financial'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendapatan Freight
          </button>
          <button
            onClick={() => setReportType('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              reportType === 'manifest'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Manifest Kargo & Tonase
          </button>
          <button
            onClick={() => setReportType('voyage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              reportType === 'voyage'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Utilisasi & BBM Voyage
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Ship className="w-4 h-4 text-sky-400 shrink-0" />
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">Semua Armada Kapal</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Pendapatan Freight</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2 truncate">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {paidCount} Lunas • {creditCount} Kredit Berjalan
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Volume Angkut Kargo</span>
            <PackageCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {totalTons.toLocaleString('id-ID')} Ton
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {filteredBookings.length} order B/L aktif
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimasi Konsumsi Solar BBM</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {totalFuelLiters.toLocaleString('id-ID')} Liter
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bahan Bakar MGO / HFO Pelayaran
          </div>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Official Letterhead (Print-only & Screen) */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 print:border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-xl print:bg-black">
              MX
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white print:text-black uppercase">
                PT. MARITIM NUSANTARA LOGISTICS TBK
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Divisi Operasional Armada & Lalu Lintas Angkutan Laut Nasional
              </p>
              <p className="text-[10px] text-slate-400 print:text-gray-500">
                Gedung Graha Samudera Lt. 8, Tanjung Priok, Jakarta • Telp: (021) 4301-8899
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-gray-700">
            <div>
              <span className="font-semibold">Tanggal Cetak: </span>
              {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-[11px] text-sky-400 font-mono print:text-black">
              Dokumen: RPT-MX-{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
            {reportType === 'financial' && 'Rekapitulasi Keuangan & Ongkos Angkut Freight'}
            {reportType === 'manifest' && 'Rekapitulasi Manifest Kargo & Kontainer B/L'}
            {reportType === 'voyage' && 'Laporan Kinerja & Utilisasi Rute Pelayaran (Voyages)'}
          </h3>
          <p className="text-xs text-slate-400 print:text-gray-600">
            Sumber Data: Database Terintegrasi Cloud Enterprise MaritimX Realtime
          </p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {reportType === 'voyage' ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 print:text-black uppercase font-semibold">
                <tr>
                  <th className="py-2">No. Voyage</th>
                  <th className="py-2">Kapal</th>
                  <th className="py-2">Rute Asal ➔ Tujuan</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Muatan (%)</th>
                  <th className="py-2 text-right">BBM (Liter)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {filteredVoyages.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 font-mono font-bold text-white print:text-black">
                      {v.voyageNumber}
                    </td>
                    <td className="py-2.5 text-slate-200 print:text-black">{v.vesselName}</td>
                    <td className="py-2.5 text-slate-300 print:text-black">
                      {v.originPortName.split('(')[0]} ➔ {v.destinationPortName.split('(')[0]}
                    </td>
                    <td className="py-2.5 uppercase font-medium text-sky-400 print:text-black">
                      {v.status}
                    </td>
                    <td className="py-2.5 font-bold text-slate-100 print:text-black">
                      {v.cargoLoadPercent}%
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-200 print:text-black">
                      {v.fuelConsumptionLiters ? v.fuelConsumptionLiters.toLocaleString('id-ID') : 0} L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 print:text-black uppercase font-semibold">
                <tr>
                  <th className="py-2">No. B/L</th>
                  <th className="py-2">Shipper (Pengirim)</th>
                  <th className="py-2">Consignee (Penerima)</th>
                  <th className="py-2">Tipe Kargo</th>
                  <th className="py-2">Tonase</th>
                  <th className="py-2">Status Bayar</th>
                  <th className="py-2 text-right">Tarif Freight (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5 font-mono font-bold text-sky-400 print:text-black">
                      {b.blNumber}
                    </td>
                    <td className="py-2.5 text-white font-medium print:text-black">
                      {b.shipperName}
                    </td>
                    <td className="py-2.5 text-slate-300 print:text-black">{b.consigneeName}</td>
                    <td className="py-2.5 text-slate-300 print:text-black">{b.cargoType}</td>
                    <td className="py-2.5 font-semibold text-slate-100 print:text-black">
                      {b.grossWeightTons.toLocaleString('id-ID')} Ton
                    </td>
                    <td className="py-2.5">
                      <span className="uppercase text-[11px] font-semibold text-slate-300 print:text-black">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-400 print:text-black font-mono">
                      {formatRupiah(b.freightPriceIdr)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800 print:border-black font-bold text-xs">
                <tr>
                  <td colSpan={4} className="py-3 text-right text-slate-300 print:text-black">
                    TOTAL KESELURUHAN:
                  </td>
                  <td className="py-3 text-white print:text-black">
                    {totalTons.toLocaleString('id-ID')} Ton
                  </td>
                  <td></td>
                  <td className="py-3 text-right text-emerald-400 print:text-black font-mono text-sm">
                    {formatRupiah(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Signature Box (For official printing) */}
        <div className="mt-12 pt-6 border-t border-slate-800 print:border-gray-400 flex justify-between text-xs text-slate-400 print:text-black">
          <div>
            <p>Dipersiapkan Oleh:</p>
            <div className="h-14" />
            <p className="font-bold text-slate-200 print:text-black">Bagian Operasional Pelayaran</p>
            <p className="text-[10px] text-slate-400 print:text-gray-500">PT Maritim Nusantara Logistics</p>
          </div>
          <div className="text-right">
            <p>Mengetahui / Menyetujui:</p>
            <div className="h-14" />
            <p className="font-bold text-slate-200 print:text-black">Direktur Utama Pelayaran</p>
            <p className="text-[10px] text-slate-400 print:text-gray-500">Kantor Pusat Tanjung Priok</p>
          </div>
        </div>
      </div>
    </div>
  );
};
