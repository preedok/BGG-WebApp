import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ownersApi, branchesApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
const OWNER_STATUS_LABELS: Record<string, string> = {
  registered_pending_mou: 'Pending MoU',
  pending_mou_approval: 'Menunggu Approve MoU',
  pending_deposit_payment: 'Bayar Deposit',
  pending_deposit_verification: 'Verifikasi Deposit',
  deposit_verified: 'Siap Ditetapkan Cabang',
  assigned_to_branch: 'Siap Aktivasi',
  active: 'Aktif',
  rejected: 'Ditolak'
};

const KoordinatorOwnersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [assigningProfileId, setAssigningProfileId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const isAdminKoordinator = user?.role === 'admin_koordinator';

  const fetchOwners = async () => {
    try {
      const res = await ownersApi.list({});
      if (res.data.success) setList(res.data.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (!isAdminKoordinator) return;
    try {
      const res = await branchesApi.list({});
      if (res.data.success) setBranches(res.data.data || []);
    } catch {
      setBranches([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOwners();
  }, []);

  useEffect(() => {
    if (isAdminKoordinator) fetchBranches();
  }, [isAdminKoordinator]);

  const handleVerifyDeposit = async (profileId: string) => {
    if (!isAdminKoordinator) return;
    setActingId(profileId);
    try {
      await ownersApi.verifyDeposit(profileId);
      showToast('Deposit terverifikasi.', 'success');
      fetchOwners();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal verifikasi deposit', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleAssignBranch = async (profileId: string) => {
    if (!isAdminKoordinator || !selectedBranchId) {
      showToast('Pilih cabang di wilayah Anda.', 'error');
      return;
    }
    setActingId(profileId);
    try {
      await ownersApi.assignBranch(profileId, selectedBranchId);
      showToast('Cabang berhasil ditetapkan.', 'success');
      setAssigningProfileId(null);
      setSelectedBranchId('');
      fetchOwners();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal menetapkan cabang', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleActivate = async (profileId: string) => {
    if (!isAdminKoordinator) return;
    setActingId(profileId);
    try {
      await ownersApi.activate(profileId);
      showToast('Owner berhasil diaktifkan.', 'success');
      fetchOwners();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal aktivasi', 'error');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owners Wilayah</h1>
          <p className="text-slate-600 mt-1">Owner yang dilayani koordinator wilayah Anda. Hanya owner di wilayah Anda yang tampil.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/koordinator')}>
          Kembali ke Dashboard Koordinator
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Memuat...
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada owner di wilayah Anda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">Nama / Perusahaan</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Cabang</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{o.User?.name}</p>
                      {o.User?.company_name && <p className="text-xs text-slate-500">{o.User.company_name}</p>}
                    </td>
                    <td className="py-3 px-4">{o.User?.email}</td>
                    <td className="py-3 px-4">{OWNER_STATUS_LABELS[o.status] || o.status}</td>
                    <td className="py-3 px-4">{o.AssignedBranch?.name || '-'}</td>
                    <td className="py-3 px-4 flex flex-wrap gap-1">
                      {o.status === 'pending_deposit_verification' && isAdminKoordinator && (
                        <Button size="sm" variant="outline" disabled={actingId !== null} onClick={() => handleVerifyDeposit(o.id)}>
                          Verifikasi Deposit
                        </Button>
                      )}
                      {o.status === 'deposit_verified' && isAdminKoordinator && (
                        <>
                          {assigningProfileId === o.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                className="border border-slate-300 rounded px-2 py-1 text-sm"
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                              >
                                <option value="">Pilih cabang wilayah</option>
                                {branches.map((b) => (
                                  <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                ))}
                              </select>
                              <Button size="sm" variant="primary" disabled={actingId !== null || !selectedBranchId} onClick={() => handleAssignBranch(o.id)}>
                                Tetapkan
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setAssigningProfileId(null); setSelectedBranchId(''); }}>
                                Batal
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" disabled={actingId !== null} onClick={() => { setAssigningProfileId(o.id); setSelectedBranchId(branches[0]?.id || ''); }}>
                              Tetapkan Cabang
                            </Button>
                          )}
                        </>
                      )}
                      {o.status === 'assigned_to_branch' && isAdminKoordinator && (
                        <Button size="sm" variant="primary" disabled={actingId !== null} onClick={() => handleActivate(o.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Aktivasi
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default KoordinatorOwnersPage;
