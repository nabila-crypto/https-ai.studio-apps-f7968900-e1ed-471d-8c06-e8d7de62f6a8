import React, { useState } from 'react';
import { Clearance, SeaworthinessStatus, Voyage } from '../types/maritime';
import { saveClearance, deleteClearance } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface Props {
  clearances: Clearance[];
  voyages: Voyage[];
}

export const ClearanceView: React.FC<Props> = ({ clearances, voyages }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClearance, setEditingClearance] = useState<Clearance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Clearance | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [spbNumber, setSpbNumber] = useState('');
  const [voyageId, setVoyageId] = useState('');
  const [ksopAuthority, setKsopAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [seaworthinessStatus, setSeaworthinessStatus] = useState<SeaworthinessStatus>('laik_laut');
  const [inspectorNotes, setInspectorNotes] = useState('');

  const openCreateModal = () => {
    setEditingClearance(null);
    setSpbNumber('SPB/KSOP/' + new Date().getFullYear() + '/X-' + Math.floor(1000 + Math.random() * 9000));
    setVoyageId(voyages[0]?.id || '');
    setKsopAuthority('Kantor Kesyahbandaran dan Otoritas Pelabuhan (KSOP) Kelas I Tanjung Priok');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setSeaworthinessStatus('laik_laut');
    setInspectorNotes('Kapal memenuhi kelaiklautan, perlengkapan navigasi radar aktif, APAR & liferaft terinspeksi lengkap.');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Clearance) => {
    setEditingClearance(c);
    setSpbNumber(c.spbNumber);
    setVoyageId(c.voyageId);
    setKsopAuthority(c.ksopAuthority);
    setIssueDate(c.issueDate);
    setSeaworthinessStatus(c.seaworthinessStatus);
    setInspectorNotes(c.inspectorNotes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spbNumber.trim()) return;
    setIsSaving(true);

    const selVoyage = voyages.find((v) => v.id === voyageId);

    try {
      await saveClearance(
        {
          spbNumber: spbNumber.trim(),
          voyageId,
          voyageNumber: selVoyage?.voyageNumber || 'VYG-2026-001',
          vesselName: selVoyage?.vesselName || 'KM Samudera',
          ksopAuthority: ksopAuthority.trim(),
          issueDate,
          seaworthinessStatus,
          inspectorNotes: inspectorNotes.trim(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingClearance?.id,
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
      await deleteClearance(deleteTarget.id, deleteTarget.spbNumber, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClearances = clearances.filter((c) => {
    const matchesSearch =
      c.spbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ksopAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.seaworthinessStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: SeaworthinessStatus) => {
    switch (st) {
      case 'laik_laut':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 Laik Laut (Cleared to Sail)</span>;
      case 'dalam_inspeksi':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 Dalam Verifikasi Fisik</span>;
      case 'ditahan':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">🔴 Ditahan Syahbandar (Detained)</span>;
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
            <FileCheck2 className="w-4 h-4" />
            <span>Dokumen Syahbandar & KSOP</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Surat Perintah Berlayar (SPB) & Port Clearance
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Penerbitan izin berlayar resmi dari Syahbandar KSOP sesuai regulasi maritim Kemenhub & SOLAS 1974.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan SPB Baru</span>
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
            placeholder="Cari no SPB, nama kapal, KSOP..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Kelaiklautan:</span>
          {['all', 'laik_laut', 'dalam_inspeksi', 'ditahan'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Clearances Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. SPB & Voyage</th>
                <th className="py-3.5 px-4">Kapal Armada</th>
                <th className="py-3.5 px-4">Otoritas KSOP / Syahbandar</th>
                <th className="py-3.5 px-4">Tanggal Terbit</th>
                <th className="py-3.5 px-4">Status Kelaiklautan</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClearances.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-sky-400 text-xs">{c.spbNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Voyage: {c.voyageNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{c.vesselName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {c.inspectorNotes || '-'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200 truncate max-w-[240px]">
                      {c.ksopAuthority}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.issueDate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(c.seaworthinessStatus)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit SPB"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus SPB"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClearances.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data Surat Perintah Berlayar.
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
                <FileCheck2 className="w-5 h-5 text-sky-400" />
                <span>{editingClearance ? 'Edit Dokumen SPB' : 'Terbitkan SPB / Clearance Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor Izin SPB <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={spbNumber}
                    onChange={(e) => setSpbNumber(e.target.value)}
                    placeholder="SPB/KSOP/2026/09/IX-4412"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pilih Jadwal Voyage Pelayaran
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
                  Otoritas Pelabuhan / KSOP Penerbit
                </label>
                <input
                  type="text"
                  required
                  value={ksopAuthority}
                  onChange={(e) => setKsopAuthority(e.target.value)}
                  placeholder="Kantor Kesyahbandaran dan Otoritas Pelabuhan Kelas I Tanjung Priok"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Kelaiklautan
                  </label>
                  <select
                    value={seaworthinessStatus}
                    onChange={(e) => setSeaworthinessStatus(e.target.value as SeaworthinessStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="laik_laut">Laik Laut (Diberikan Izin)</option>
                    <option value="dalam_inspeksi">Dalam Pemeriksaan Fisik</option>
                    <option value="ditahan">Ditahan Syahbandar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Catatan Syahbandar & Hasil Inspeksi
                </label>
                <textarea
                  rows={3}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Catatan hasil inspeksi lambung kapal, dokumen keselamatan, jumlah kru..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan SPB'}</span>
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
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Data SPB</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus data izin SPB <span className="font-semibold text-white">{deleteTarget.spbNumber}</span>?
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
