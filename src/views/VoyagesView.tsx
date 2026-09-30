import React, { useState } from 'react';
import { Voyage, VoyageStatus, Vessel, Port } from '../types/maritime';
import { saveVoyage, deleteVoyage } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Fuel,
  Navigation,
} from 'lucide-react';

interface Props {
  voyages: Voyage[];
  vessels: Vessel[];
  ports: Port[];
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const VoyagesView: React.FC<Props> = ({
  voyages,
  vessels,
  ports,
  isCreateOpen,
  onCloseCreate,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(isCreateOpen || false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Voyage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destinationPortId, setDestinationPortId] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [status, setStatus] = useState<VoyageStatus>('scheduled');
  const [cargoLoadPercent, setCargoLoadPercent] = useState<number>(85);
  const [fuelConsumptionLiters, setFuelConsumptionLiters] = useState<number>(45000);
  const [currentCoordinates, setCurrentCoordinates] = useState('');
  const [captainName, setCaptainName] = useState('');

  // Handle external trigger for create
  React.useEffect(() => {
    if (isCreateOpen) {
      openCreateModal();
    }
  }, [isCreateOpen]);

  const openCreateModal = () => {
    setEditingVoyage(null);
    setVoyageNumber('VYG-2026-' + Math.floor(100 + Math.random() * 900));
    setVesselId(vessels[0]?.id || '');
    setOriginPortId(ports[0]?.id || '');
    setDestinationPortId(ports[1]?.id || ports[0]?.id || '');

    const now = new Date();
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    setEtd(now.toISOString().slice(0, 16));
    setEta(future.toISOString().slice(0, 16));

    setStatus('scheduled');
    setCargoLoadPercent(80);
    setFuelConsumptionLiters(42000);
    setCurrentCoordinates('Dermaga Pelabuhan Asal');
    setCaptainName('Capt. Hendra Gunawan, M.Mar');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Voyage) => {
    setEditingVoyage(v);
    setVoyageNumber(v.voyageNumber);
    setVesselId(v.vesselId);
    setOriginPortId(v.originPortId);
    setDestinationPortId(v.destinationPortId);
    setEtd(v.etd);
    setEta(v.eta);
    setStatus(v.status);
    setCargoLoadPercent(v.cargoLoadPercent || 0);
    setFuelConsumptionLiters(v.fuelConsumptionLiters || 0);
    setCurrentCoordinates(v.currentCoordinates || '');
    setCaptainName(v.captainName || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voyageNumber.trim()) return;
    setIsSaving(true);

    const selVessel = vessels.find((v) => v.id === vesselId);
    const selOrigin = ports.find((p) => p.id === originPortId);
    const selDest = ports.find((p) => p.id === destinationPortId);

    try {
      await saveVoyage(
        {
          voyageNumber: voyageNumber.trim(),
          vesselId,
          vesselName: selVessel?.name || 'KM Samudera Nusantara',
          originPortId,
          originPortName: selOrigin ? `${selOrigin.name} (${selOrigin.code})` : 'Tanjung Priok (IDTPP)',
          destinationPortId,
          destinationPortName: selDest ? `${selDest.name} (${selDest.code})` : 'Tanjung Perak (IDSUB)',
          etd,
          eta,
          status,
          cargoLoadPercent: Number(cargoLoadPercent),
          fuelConsumptionLiters: Number(fuelConsumptionLiters),
          currentCoordinates: currentCoordinates.trim(),
          captainName: captainName.trim(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingVoyage?.id,
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
      await deleteVoyage(deleteTarget.id, deleteTarget.voyageNumber, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVoyages = voyages.filter((v) => {
    const matchesSearch =
      v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.originPortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destinationPortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: VoyageStatus) => {
    switch (st) {
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">🚢 In Transit (Laut)</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">⏳ Terjadwal</span>;
      case 'berthed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">⚓ Sandar / Bongkar</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">🏁 Selesai (Completed)</span>;
      case 'delayed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">⚠️ Tertunda (Delayed)</span>;
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
            <Compass className="w-4 h-4" />
            <span>Transaksi Operasional</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Jadwal & Rute Pelayaran (Voyages)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Penjadwalan pelayaran antar pelabuhan, monitoring posisi lintang/bujur, muatan, dan konsumsi BBM.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Voyage Baru</span>
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
            placeholder="Cari no voyage, kapal, rute pelabuhan..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          {['all', 'scheduled', 'in_transit', 'berthed', 'completed'].map((st) => (
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

      {/* Voyages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. Voyage & Kapal</th>
                <th className="py-3.5 px-4">Rute Asal ➔ Tujuan</th>
                <th className="py-3.5 px-4">Waktu ETD & ETA</th>
                <th className="py-3.5 px-4">Status & Koordinat</th>
                <th className="py-3.5 px-4">BBM & Muatan</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVoyages.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sky-400 bg-sky-950/40 border border-sky-800/50 px-2 py-0.5 rounded text-xs">
                      {v.voyageNumber}
                    </span>
                    <div className="font-bold text-white text-sm mt-1">{v.vesselName}</div>
                    <div className="text-[11px] text-slate-400">Kapten: {v.captainName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">
                      {v.originPortName}
                    </div>
                    <div className="text-sky-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{v.destinationPortName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-semibold">ETD: </span>
                      {v.etd ? v.etd.replace('T', ' ') : '-'}
                    </div>
                    <div className="text-slate-300 mt-0.5">
                      <span className="text-emerald-400 font-semibold">ETA: </span>
                      {v.eta ? v.eta.replace('T', ' ') : '-'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="mb-1">{getStatusBadge(v.status)}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{v.currentCoordinates || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      <span>{v.fuelConsumptionLiters ? v.fuelConsumptionLiters.toLocaleString('id-ID') : 0} L</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Muatan: {v.cargoLoadPercent}%</span>
                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${v.cargoLoadPercent || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit Voyage"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus Voyage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVoyages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data pelayaran yang cocok.
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
                <Compass className="w-5 h-5 text-sky-400" />
                <span>{editingVoyage ? 'Edit Jadwal Voyage' : 'Jadwal Voyage Baru'}</span>
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor Voyage <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    placeholder="VYG-2026-045"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pilih Kapal Armada <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pelabuhan Asal Keberangkatan
                  </label>
                  <select
                    value={originPortId}
                    onChange={(e) => setOriginPortId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pelabuhan Tujuan Bongkar
                  </label>
                  <select
                    value={destinationPortId}
                    onChange={(e) => setDestinationPortId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Jadwal Berangkat (ETD)
                  </label>
                  <input
                    type="datetime-local"
                    value={etd}
                    onChange={(e) => setEtd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Perkiraan Tiba (ETA)
                  </label>
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Pelayaran
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VoyageStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="scheduled">Terjadwal (Scheduled)</option>
                    <option value="in_transit">In Transit (Sedang Berlayar)</option>
                    <option value="berthed">Sandar di Pelabuhan</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="delayed">Tertunda (Delayed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Persentase Muatan Kapal (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cargoLoadPercent}
                    onChange={(e) => setCargoLoadPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Estimasi Konsumsi BBM (Liter)
                  </label>
                  <input
                    type="number"
                    value={fuelConsumptionLiters}
                    onChange={(e) => setFuelConsumptionLiters(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nama Nahkoda Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Capt. Hendra Gunawan"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Posisi Koordinat GPS / Navigasi Laut Terkini
                </label>
                <input
                  type="text"
                  value={currentCoordinates}
                  onChange={(e) => setCurrentCoordinates(e.target.value)}
                  placeholder="05°18'S 112°45'E (Perairan Laut Jawa)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Voyage'}</span>
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
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Jadwal Voyage</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus jadwal voyage <span className="font-semibold text-white">{deleteTarget.voyageNumber}</span> ({deleteTarget.vesselName})?
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
