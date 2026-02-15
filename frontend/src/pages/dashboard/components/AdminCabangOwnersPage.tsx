import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ownersApi, adminCabangApi } from '../../../services/api';
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

const AdminCabangOwnersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

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

  useEffect(() => {
    setLoading(true);
    fetchOwners();
  }, []);

  const handleVerifyDeposit = async (profileId: string) => {
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
    if (!user?.branch_id) {
      showToast('Anda tidak terikat cabang.', 'error');
      return;
    }
    setActingId(profileId);
    try {
      await ownersApi.assignBranch(profileId, user.branch_id);
      showToast('Cabang berhasil ditetapkan.', 'success');
      fetchOwners();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal menetapkan cabang', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleActivate = async (profileId: string) => {
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
          <h1 className="text-2xl font-bold text-slate-900">Owner Cabang</h1>
          <p className="text-slate-600 mt-1">Data owner, verifikasi deposit, tetapkan cabang, aktivasi</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          Kembali ke Dashboard
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Memuat...
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada owner untuk cabang Anda.</div>
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
                      {o.status === 'pending_deposit_verification' && (
                        <Button size="sm" variant="outline" disabled={actingId !== null} onClick={() => handleVerifyDeposit(o.id)}>
                          Verifikasi Deposit
                        </Button>
                      )}
                      {o.status === 'deposit_verified' && user?.branch_id && (
                        <Button size="sm" variant="outline" disabled={actingId !== null} onClick={() => handleAssignBranch(o.id)}>
                          Tetapkan ke Cabang Saya
                        </Button>
                      )}
                      {o.status === 'assigned_to_branch' && (
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

export default AdminCabangOwnersPage;
