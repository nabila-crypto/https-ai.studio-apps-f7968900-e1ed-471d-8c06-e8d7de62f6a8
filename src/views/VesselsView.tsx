import React, { useState } from 'react';
import { Vessel, VesselStatus } from '../types/maritime';
import { saveVessel, deleteVessel } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Trash2,
  Anchor,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  vessels: Vessel[];
}

export const VesselsView: React.FC<Props> = ({ vessels }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vessel | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [type, setType] = useState<Vessel['type']>('Container Ship');
  const [capacityDwt, setCapacityDwt] = useState<number>(25000);
  const [capacityTeu, setCapacityTeu] = useState<number>(1500);
  const [yearBuilt, setYearBuilt] = useState<number>(2018);
  const [flag, setFlag] = useState('Indonesia');
  const [status, setStatus] = useState<VesselStatus>('active');
  const [currentPort, setCurrentPort] = useState('Tanjung Priok, Jakarta');

  const openCreateModal = () => {
    setEditingVessel(null);
    setName('');
    setImoNumber('IMO ' + Math.floor(1000000 + Math.random() * 9000000));
    setType('Container Ship');
    setCapacityDwt(25000);
    setCapacityTeu(1500);
    setYearBuilt(2019);
    setFlag('Indonesia');
    setStatus('active');
    setCurrentPort('Tanjung Priok, Jakarta');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vessel) => {
    setEditingVessel(v);
    setName(v.name);
    setImoNumber(v.imoNumber);
    setType(v.type);
    setCapacityDwt(v.capacityDwt);
    setCapacityTeu(v.capacityTeu);
    setYearBuilt(v.yearBuilt);
    setFlag(v.flag);
    setStatus(v.status);
    setCurrentPort(v.currentPort);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await saveVessel(
        {
          name: name.trim(),
          imoNumber: imoNumber.trim(),
          type,
          capacityDwt: Number(capacityDwt),
          capacityTeu: Number(capacityTeu),
          yearBuilt: Number(yearBuilt),
          flag: flag.trim(),
          status,
          currentPort: currentPort.trim(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingVessel?.id,
        currentUser?.email || 'admin'
      );
      setIsModalOpen(false);
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
      await deleteVessel(deleteTarget.id, deleteTarget.name, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: VesselStatus) => {
    switch (st) {
      case 'sailing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">🚢 Berlayar (Sailing)</span>;
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✅ Aktif Siap Operasi</span>;
      case 'docking':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🛠️ Docking / Perbaikan</span>;
      case 'berthed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">⚓ Sandar Pelabuhan</span>;
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
            <Ship className="w-4 h-4" />
            <span>Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Armada Kapal (Fleet Management)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Data registrasi seluruh kapal niaga, kontainer, tanker, dan tongkang perusahaan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
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
            placeholder="Cari nama kapal, IMO, tipe..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          {['all', 'active', 'sailing', 'berthed', 'docking'].map((st) => (
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

      {/* Vessels Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Kapal & IMO</th>
                <th className="py-3.5 px-4">Tipe & Bendera</th>
                <th className="py-3.5 px-4">Kapasitas (DWT / TEU)</th>
                <th className="py-3.5 px-4">Tahun / Lokasi Saat Ini</th>
                <th className="py-3.5 px-4">Status Operasional</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVessels.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{v.name}</div>
                    <div className="text-[11px] text-sky-400 font-mono">{v.imoNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{v.type}</div>
                    <div className="text-[11px] text-slate-400">Bendera: {v.flag}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">
                      {v.capacityDwt.toLocaleString('id-ID')} DWT
                    </div>
                    {v.capacityTeu > 0 && (
                      <div className="text-[11px] text-slate-400">
                        {v.capacityTeu.toLocaleString('id-ID')} TEUs
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300">Tahun {v.yearBuilt}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Anchor className="w-3 h-3 text-sky-400" />
                      <span>{v.currentPort || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(v.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit Data Kapal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus Kapal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVessels.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data kapal yang cocok.
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
                <Ship className="w-5 h-5 text-sky-400" />
                <span>{editingVessel ? 'Edit Data Kapal' : 'Tambah Kapal Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Kapal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: KM Samudera Raya 08"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor IMO <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    placeholder="IMO 9821400"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipe Kapal
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Container Ship">Container Ship</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Oil Tanker">Oil Tanker</option>
                    <option value="General Cargo">General Cargo</option>
                    <option value="Tug & Barge">Tug & Barge</option>
                    <option value="Passenger / Ferry">Passenger / Ferry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kapasitas Bobot Mati (DWT)
                  </label>
                  <input
                    type="number"
                    value={capacityDwt}
                    onChange={(e) => setCapacityDwt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kapasitas Kontainer (TEU)
                  </label>
                  <input
                    type="number"
                    value={capacityTeu}
                    onChange={(e) => setCapacityTeu(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Negara Bendera
                  </label>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="Indonesia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Kapal
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">Aktif Siap Operasi</option>
                    <option value="sailing">Sedang Berlayar (Sailing)</option>
                    <option value="berthed">Sandar Pelabuhan</option>
                    <option value="docking">Docking / Pemeliharaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Lokasi / Pelabuhan Pangkalan
                  </label>
                  <input
                    type="text"
                    value={currentPort}
                    onChange={(e) => setCurrentPort(e.target.value)}
                    placeholder="Tanjung Priok, Jakarta"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Kapal'}</span>
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
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Kapal</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus kapal <span className="font-semibold text-white">{deleteTarget.name}</span> ({deleteTarget.imoNumber})? Tindakan ini akan tersinkronisasi ke seluruh akun online.
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
                {isSaving ? 'Menghapus...' : 'Ya, Hapus Kapal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
