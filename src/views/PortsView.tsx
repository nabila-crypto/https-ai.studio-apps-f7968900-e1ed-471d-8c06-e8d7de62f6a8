import React, { useState } from 'react';
import { Port, PortStatus } from '../types/maritime';
import { savePort, deletePort } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  Anchor,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Building2,
  Waves,
} from 'lucide-react';

interface Props {
  ports: Port[];
}

export const PortsView: React.FC<Props> = ({ ports }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Port | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [berthsCount, setBerthsCount] = useState<number>(10);
  const [maxDraft, setMaxDraft] = useState<number>(12.5);
  const [status, setStatus] = useState<PortStatus>('open');

  const openCreateModal = () => {
    setEditingPort(null);
    setCode('ID' + Math.random().toString(36).substring(2, 5).toUpperCase());
    setName('');
    setCity('');
    setCountry('Indonesia');
    setBerthsCount(14);
    setMaxDraft(12.5);
    setStatus('open');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Port) => {
    setEditingPort(p);
    setCode(p.code);
    setName(p.name);
    setCity(p.city);
    setCountry(p.country);
    setBerthsCount(p.berthsCount);
    setMaxDraft(p.maxDraft);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setIsSaving(true);
    try {
      await savePort(
        {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          city: city.trim(),
          country: country.trim(),
          berthsCount: Number(berthsCount),
          maxDraft: Number(maxDraft),
          status,
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingPort?.id,
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
      await deletePort(deleteTarget.id, deleteTarget.name, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPorts = ports.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: PortStatus) => {
    switch (st) {
      case 'open':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 Terbuka / Normal</span>;
      case 'congested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 Padat (Congested)</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">🔴 Pemeliharaan Alur</span>;
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
            <Anchor className="w-4 h-4" />
            <span>Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Pelabuhan & Terminal Singgah
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Data pelabuhan bongkar muat, dermaga, kedalaman alur navigasi (draft), dan status kepadatan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelabuhan</span>
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
            placeholder="Cari pelabuhan, kode (e.g. IDTPP), kota..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Kondisi:</span>
          {['all', 'open', 'congested', 'maintenance'].map((st) => (
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

      {/* Ports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Kode Pelabuhan</th>
                <th className="py-3.5 px-4">Nama Pelabuhan & Kota</th>
                <th className="py-3.5 px-4">Jumlah Dermaga</th>
                <th className="py-3.5 px-4">Max Draft Kedalaman</th>
                <th className="py-3.5 px-4">Status Alur</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPorts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sky-400 bg-sky-950/40 border border-sky-800/50 px-2 py-1 rounded">
                      {p.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{p.city}, {p.country}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200">{p.berthsCount} Dermaga</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold">{p.maxDraft} Meter</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit Pelabuhan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus Pelabuhan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPorts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data pelabuhan yang cocok.
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-sky-400" />
                <span>{editingPort ? 'Edit Data Pelabuhan' : 'Tambah Pelabuhan Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kode UN/LOCODE <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="IDTPP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Nama Pelabuhan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pelabuhan Tanjung Priok"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jakarta Utara"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Negara
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Indonesia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Jumlah Dermaga
                  </label>
                  <input
                    type="number"
                    value={berthsCount}
                    onChange={(e) => setBerthsCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Draft Kedalaman (M)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxDraft}
                    onChange={(e) => setMaxDraft(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Alur
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PortStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="open">Terbuka / Normal</option>
                    <option value="congested">Padat (Congested)</option>
                    <option value="maintenance">Pemeliharaan</option>
                  </select>
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Pelabuhan'}</span>
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
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Pelabuhan</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus data pelabuhan <span className="font-semibold text-white">{deleteTarget.name}</span> ({deleteTarget.code})?
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
                {isSaving ? 'Menghapus...' : 'Ya, Hapus Pelabuhan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
