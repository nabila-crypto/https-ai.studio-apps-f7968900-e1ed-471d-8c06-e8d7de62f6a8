import React, { useState } from 'react';
import { Crew, CrewStatus, Vessel } from '../types/maritime';
import { saveCrew, deleteCrew } from '../services/maritimeService';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Award,
  Phone,
  Ship,
} from 'lucide-react';

interface Props {
  crew: Crew[];
  vessels: Vessel[];
}

export const CrewView: React.FC<Props> = ({ crew, vessels }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Crew | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [rank, setRank] = useState<Crew['rank']>('Nahkoda (Master)');
  const [seamanBookNumber, setSeamanBookNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [assignedVesselId, setAssignedVesselId] = useState('');
  const [phone, setPhone] = useState('+62 812-');
  const [status, setStatus] = useState<CrewStatus>('on_duty');

  const openCreateModal = () => {
    setEditingCrew(null);
    setName('');
    setRank('Nahkoda (Master)');
    setSeamanBookNumber('B.' + Math.floor(100000 + Math.random() * 900000) + '-JKT');
    setLicenseNumber('ANT-I / 2020 / ' + Math.floor(1000 + Math.random() * 9000));
    setAssignedVesselId(vessels[0]?.id || '');
    setPhone('+62 812-');
    setStatus('on_duty');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Crew) => {
    setEditingCrew(c);
    setName(c.name);
    setRank(c.rank);
    setSeamanBookNumber(c.seamanBookNumber);
    setLicenseNumber(c.licenseNumber);
    setAssignedVesselId(c.assignedVesselId || '');
    setPhone(c.phone);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);

    const selectedVessel = vessels.find((v) => v.id === assignedVesselId);

    try {
      await saveCrew(
        {
          name: name.trim(),
          rank,
          seamanBookNumber: seamanBookNumber.trim(),
          licenseNumber: licenseNumber.trim(),
          assignedVesselId,
          assignedVesselName: selectedVessel?.name || 'Belum Ditugaskan',
          phone: phone.trim(),
          status,
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'admin',
        },
        editingCrew?.id,
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
      await deleteCrew(deleteTarget.id, deleteTarget.name, currentUser?.email || 'admin');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCrew = crew.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seamanBookNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.assignedVesselName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || c.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  const getStatusBadge = (st: CrewStatus) => {
    switch (st) {
      case 'on_duty':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">⚓ On Duty (Berlayar)</span>;
      case 'standby':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">⏳ Standby Pelabuhan</span>;
      case 'on_leave':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🏖️ Sedang Cuti</span>;
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
            <Users className="w-4 h-4" />
            <span>Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Nahkoda & Kru Pelaut (Crew Management)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Data buku pelaut, sertifikasi perwira (ANT/ATT), penugasan kapal, dan status dinas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelaut Baru</span>
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
            placeholder="Cari nama pelaut, no buku pelaut, kapal..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 shrink-0">Jabatan:</span>
          {['all', 'Nahkoda (Master)', 'Chief Officer', 'Chief Engineer', 'Bosun'].map((rk) => (
            <button
              key={rk}
              onClick={() => setRankFilter(rk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                rankFilter === rk
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {rk === 'all' ? 'Semua Jabatan' : rk}
            </button>
          ))}
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Pelaut & Kontak</th>
                <th className="py-3.5 px-4">Jabatan / Rank</th>
                <th className="py-3.5 px-4">No. Buku Pelaut & Sertifikat</th>
                <th className="py-3.5 px-4">Kapal Ditugaskan</th>
                <th className="py-3.5 px-4">Status Dinas</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCrew.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-sky-400">{c.rank}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-slate-200 font-semibold">{c.seamanBookNumber}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{c.licenseNumber}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                      <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{c.assignedVesselName || 'Belum Ditugaskan'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors"
                        title="Edit Data Kru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Hapus Kru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCrew.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data pelaut yang cocok.
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
                <Users className="w-5 h-5 text-sky-400" />
                <span>{editingCrew ? 'Edit Data Pelaut' : 'Tambah Pelaut Baru'}</span>
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
                  Nama Lengkap & Gelar Maritim <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Capt. Bambang Irawan, M.Mar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Jabatan / Pangkat
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Nahkoda (Master)">Nahkoda (Master)</option>
                    <option value="Chief Officer">Chief Officer (Mualim I)</option>
                    <option value="Chief Engineer">Chief Engineer (KKM)</option>
                    <option value="2nd Officer">2nd Officer (Mualim II)</option>
                    <option value="2nd Engineer">2nd Engineer (Masinis II)</option>
                    <option value="Bosun">Bosun (Serang)</option>
                    <option value="Able Seaman">Able Seaman (Juru Mudi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    No. Buku Pelaut <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={seamanBookNumber}
                    onChange={(e) => setSeamanBookNumber(e.target.value)}
                    placeholder="B.094821-JKT"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Sertifikat Keahlian Pelaut (CoC)
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="ANT-I / 2018 / 8820"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor Telepon / Kontak
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-9844-3100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Penugasan Kapal
                  </label>
                  <select
                    value={assignedVesselId}
                    onChange={(e) => setAssignedVesselId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Pilih Kapal --</option>
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Status Dinas
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CrewStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="on_duty">On Duty (Sedang Berlayar)</option>
                    <option value="standby">Standby (Di Pelabuhan)</option>
                    <option value="on_leave">Cuti / On Leave</option>
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Pelaut'}</span>
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
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Data Pelaut</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apakah Anda yakin ingin menghapus data pelaut <span className="font-semibold text-white">{deleteTarget.name}</span> ({deleteTarget.rank})?
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
                {isSaving ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
