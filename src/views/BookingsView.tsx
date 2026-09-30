import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentStatus, CargoType, Voyage } from '../types/maritime';
import { saveBooking, deleteBooking } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  PackageCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Building,
  DollarSign,
  FileText,
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  voyages: Voyage[];
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const BookingsView: React.FC<Props> = ({
  bookings,
  voyages,
  isCreateOpen,
  onCloseCreate,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(isCreateOpen || false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [blNumber, setBlNumber] = useState('');
  const [voyageId, setVoyageId] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('Dry Container 40ft');
  const [containerCount, setContainerCount] = useState<number>(10);
  const [grossWeightTons, setGrossWeightTons] = useState<number>(250);
  const [freightPriceIdr, setFreightPriceIdr] = useState<number>(150000000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('confirmed');

  React.useEffect(() => {
    if (isCreateOpen) {
      openCreateModal();
    }
  }, [isCreateOpen]);

  const openCreateModal = () => {
    setEditingBooking(null);
    setBlNumber('BL-JKT-SUB-' + Math.floor(10000 + Math.random() * 90000));
    setVoyageId(voyages[0]?.id || '');
    setShipperName('');
    setConsigneeName('');
    setCargoType('Dry Container 40ft');
    setContainerCount(12);
    setGrossWeightTons(280);
    setFreightPriceIdr(180000000);
    setPaymentStatus('paid');
    setBookingStatus('confirmed');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setBlNumber(b.blNumber);
    setVoyageId(b.voyageId);
    setShipperName(b.shipperName);
    setConsigneeName(b.consigneeName);
    setCargoType(b.cargoType);
    setContainerCount(b.containerCount);
    setGrossWeightTons(b.grossWeightTons);
    setFreightPriceIdr(b.freightPriceIdr);
    setPaymentStatus(b.paymentStatus);
    setBookingStatus(b.bookingStatus);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blNumber.trim() || !shipperName.trim() || !consigneeName.trim()) return;
    setIsSaving(true);

    const selVoyage = voyages.find((v) => v.id === voyageId);

    try {
      await saveBooking(
        {
          blNumber: blNumber.trim(),
          voyageId,
          voyageNumber: selVoyage?.voyageNumber || 'VYG-2026-001',
          shipperName: shipperName.trim(),
          consigneeName: consigneeName.trim(),
          cargoType,
          containerCount: Number(containerCount),
          grossWeightTons: Number(grossWeightTons),
          freightPriceIdr: Number(freightPriceIdr),
          paymentStatus,
          bookingStatus,
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingBooking?.id,
        currentUser?.email || 'admin'
      );
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteBooking(deleteTarget.id, deleteTarget.blNumber, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.blNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (st: BookingStatus) => {
    switch (st) {
      case 'on_board':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">🚢 On Board (Di Kapal)</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✅ Terkonfirmasi</span>;
      case 'loading':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🏗️ Pemuatan (Loading)</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">📦 Tiba & Diserahkan</span>;
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">Draft</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Dibatalkan</span>;
      default:
        return <span>{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <PackageCheck className="w-4 h-4" />
            <span>Transaksi Manifest</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Manifest Kargo & Bill of Lading (B/L)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Pencatatan order pengiriman kontainer, curah, cairan, shipper, consignee, serta tagihan ongkos angkut (freight).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Input Booking / B/L Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No B/L, shipper, consignee..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          {['all', 'confirmed', 'loading', 'on_board', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. B/L & Voyage</th>
                <th className="py-3.5 px-4">Shipper & Consignee</th>
                <th className="py-3.5 px-4">Tipe Kargo & Kontainer</th>
                <th className="py-3.5 px-4">Tonase / Freight Price</th>
                <th className="py-3.5 px-4">Status & Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-sky-400 text-xs">{b.blNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Voyage: {b.voyageNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white truncate max-w-[190px]">
                      {b.shipperName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[190px]">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>Ke: {b.consigneeName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{b.cargoType}</div>
                    {b.containerCount > 0 ? (
                      <div className="text-[11px] text-sky-400">{b.containerCount} Box Kontainer</div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Curah Lepas</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{b.grossWeightTons.toLocaleString('id-ID')} Ton</div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      {formatRupiah(b.freightPriceIdr)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="mb-1">{getStatusBadge(b.bookingStatus)}</div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                        b.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : b.paymentStatus === 'credit'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}
                    >
                      {b.paymentStatus === 'paid' ? 'LUNAS' : b.paymentStatus === 'credit' ? 'TEMPO / KREDIT' : 'BELUM BAYAR'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit B/L"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus B/L"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data booking manifest kargo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>{editingBooking ? 'Edit Manifest B/L' : 'Input Bill of Lading (B/L) Baru'}</span>
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor B/L <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blNumber}
                    onChange={(e) => setBlNumber(e.target.value)}
                    placeholder="BL-JKT-SUB-8812"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Jadwal Voyage Pelayaran
                  </label>
                  <select
                    value={voyageId}
                    onChange={(e) => setVoyageId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {voyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.voyageNumber} ({v.vesselName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Perusahaan Pengirim (Shipper) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder="PT Indofood CBP Sukses Makmur Tbk"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Perusahaan Penerima (Consignee) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={consigneeName}
                  onChange={(e) => setConsigneeName(e.target.value)}
                  placeholder="PT Makassar Mega Logistik"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipe Kargo
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as CargoType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Dry Container 20ft">Dry Container 20ft</option>
                    <option value="Dry Container 40ft">Dry Container 40ft</option>
                    <option value="Reefer Container">Reefer Container (Pendingin)</option>
                    <option value="Breakbulk / Curah">Breakbulk / Curah</option>
                    <option value="Liquid / BBM">Liquid / BBM Tangki</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Jumlah Box Kontainer
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={containerCount}
                    onChange={(e) => setContainerCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Berat Kotor (Gross Ton)
                  </label>
                  <input
                    type="number"
                    value={grossWeightTons}
                    onChange={(e) => setGrossWeightTons(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tarif Freight (IDR)
                  </label>
                  <input
                    type="number"
                    value={freightPriceIdr}
                    onChange={(e) => setFreightPriceIdr(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="paid">Lunas (Paid)</option>
                    <option value="credit">Tempo / Kredit (Credit)</option>
                    <option value="unpaid">Belum Dibayar (Unpaid)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Muatan
                  </label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Terkonfirmasi (Confirmed)</option>
                    <option value="loading">Pemuatan (Loading)</option>
                    <option value="on_board">On Board (Di Atas Kapal)</option>
                    <option value="delivered">Tiba / Diserahkan</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan B/L'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Data B/L</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus manifest B/L <span className="font-semibold text-white">{deleteTarget.blNumber}</span> ({deleteTarget.shipperName})?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/30"
              >
                {isSaving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
