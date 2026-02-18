import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, CheckCircle, Building2 } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { PageFilter } from '../../../components/common';
import ActionsMenu from '../../../components/common/ActionsMenu';
import type { ActionsMenuItem } from '../../../components/common/ActionsMenu';
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

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  ...Object.entries(OWNER_STATUS_LABELS).map(([value, label]) => ({ value, label }))
];

const KoordinatorOwnersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [wilayahList, setWilayahList] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [branchesForFilter, setBranchesForFilter] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [assigningProfileId, setAssigningProfileId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterWilayahId, setFilterWilayahId] = useState<string>('');
  const [filterBranchId, setFilterBranchId] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  const isAdminKoordinator = user?.role === 'admin_koordinator';
  const isInvoiceKoordinator = user?.role === 'invoice_koordinator';
  const canAssignOrActivate = isAdminKoordinator || isInvoiceKoordinator;
  const canVerifyDeposit = isAdminKoordinator;
  const isAdminPusatOrSuperAdmin = user?.role === 'admin_pusat' || user?.role === 'super_admin';

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const params: { status?: string; wilayah_id?: string; branch_id?: string } = {};
      if (filterStatus) params.status = filterStatus;
      if (filterWilayahId) params.wilayah_id = filterWilayahId;
      if (filterBranchId) params.branch_id = filterBranchId;
      const res = await ownersApi.list(params);
      if (res.data.success) setList(res.data.data || []);
      else setList([]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterWilayahId, filterBranchId]);

  const fetchBranches = useCallback(async () => {
    if (!canAssignOrActivate) return;
    try {
      const params: { limit?: number; wilayah_id?: string } = { limit: 500 };
      if (user?.wilayah_id) params.wilayah_id = user.wilayah_id;
      const res = await branchesApi.list(params);
      if (res.data.success) setBranches(res.data.data || []);
      else setBranches([]);
    } catch {
      setBranches([]);
    }
  }, [canAssignOrActivate, user?.wilayah_id]);

  const fetchWilayahList = useCallback(async () => {
    if (!isAdminPusatOrSuperAdmin) return;
    try {
      const res = await branchesApi.listWilayah();
      if (res.data?.success && Array.isArray(res.data.data)) setWilayahList(res.data.data);
      else setWilayahList([]);
    } catch {
      setWilayahList([]);
    }
  }, [isAdminPusatOrSuperAdmin]);

  const fetchBranchesForFilter = useCallback(async () => {
    if (!isAdminPusatOrSuperAdmin) return;
    try {
      const params: { limit?: number; wilayah_id?: string } = { limit: 500 };
      if (filterWilayahId) params.wilayah_id = filterWilayahId;
      const res = await branchesApi.list(params);
      if (res.data.success) setBranchesForFilter(res.data.data || []);
      else setBranchesForFilter([]);
    } catch {
      setBranchesForFilter([]);
    }
  }, [isAdminPusatOrSuperAdmin, filterWilayahId]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    if (canAssignOrActivate) fetchBranches();
  }, [canAssignOrActivate, fetchBranches]);

  useEffect(() => {
    fetchWilayahList();
  }, [fetchWilayahList]);

  useEffect(() => {
    fetchBranchesForFilter();
  }, [fetchBranchesForFilter]);

  const filteredList = useMemo(() => {
    if (!filterSearch.trim()) return list;
    const q = filterSearch.trim().toLowerCase();
    return list.filter(
      (o) =>
        (o.User?.name || '').toLowerCase().includes(q) ||
        (o.User?.company_name || '').toLowerCase().includes(q) ||
        (o.User?.email || '').toLowerCase().includes(q)
    );
  }, [list, filterSearch]);

  const handleVerifyDeposit = async (profileId: string) => {
    if (!canVerifyDeposit) return;
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
    if (!canAssignOrActivate || !selectedBranchId) {
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
    if (!canAssignOrActivate) return;
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

  const resetFilters = () => {
    setFilterStatus('');
    setFilterWilayahId('');
    setFilterBranchId('');
    setFilterSearch('');
  };

  const hasActiveFilters = !!(filterStatus || filterWilayahId || filterBranchId || filterSearch.trim());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Owners Wilayah</h1>
        <p className="text-slate-600 mt-1">
          {isAdminPusatOrSuperAdmin
            ? 'Daftar owner per wilayah. Filter menurut wilayah, cabang, status, dan cari nama/email.'
            : 'Owner yang dilayani koordinator wilayah Anda. Verifikasi deposit, tetapkan cabang, dan aktivasi.'}
        </p>
      </div>

      <PageFilter
        open={showFilters}
        onToggle={() => setShowFilters((v) => !v)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        onApply={() => fetchOwners()}
        loading={loading}
        applyLabel="Terapkan"
        resetLabel="Reset"
        className="w-full"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isAdminPusatOrSuperAdmin && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Wilayah</label>
                <select
                  value={filterWilayahId}
                  onChange={(e) => {
                    setFilterWilayahId(e.target.value);
                    setFilterBranchId('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua wilayah</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Cabang</label>
                <select
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua cabang</option>
                  {branchesForFilter.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} – {b.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Cari nama / email</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Nama, perusahaan, email..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </PageFilter>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Memuat...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            {hasActiveFilters ? 'Tidak ada owner sesuai filter.' : 'Belum ada owner di wilayah Anda.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">Nama / Perusahaan</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Cabang</th>
                  <th className="text-left py-3 px-4 w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{o.User?.name}</p>
                      {o.User?.company_name && <p className="text-xs text-slate-500">{o.User.company_name}</p>}
                    </td>
                    <td className="py-3 px-4">{o.User?.email}</td>
                    <td className="py-3 px-4">{OWNER_STATUS_LABELS[o.status] || o.status}</td>
                    <td className="py-3 px-4">{o.AssignedBranch?.name || '-'}</td>
                    <td className="py-3 px-4">
                      {assigningProfileId === o.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            className="border border-slate-300 rounded px-2 py-1 text-sm min-w-[140px]"
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
                        (() => {
                          const items: ActionsMenuItem[] = [];
                          if (o.status === 'pending_deposit_verification' && canVerifyDeposit) {
                            items.push({
                              id: 'verify-deposit',
                              label: 'Verifikasi Deposit',
                              icon: <CheckCircle className="w-4 h-4" />,
                              onClick: () => handleVerifyDeposit(o.id),
                              disabled: actingId !== null
                            });
                          }
                          if (o.status === 'deposit_verified' && canAssignOrActivate) {
                            items.push({
                              id: 'assign-branch',
                              label: 'Tetapkan Cabang',
                              icon: <Building2 className="w-4 h-4" />,
                              onClick: () => { setAssigningProfileId(o.id); setSelectedBranchId(branches[0]?.id || ''); },
                              disabled: actingId !== null
                            });
                          }
                          if (o.status === 'assigned_to_branch' && canAssignOrActivate) {
                            items.push({
                              id: 'activate',
                              label: 'Aktivasi',
                              icon: <CheckCircle className="w-4 h-4" />,
                              onClick: () => handleActivate(o.id),
                              disabled: actingId !== null
                            });
                          }
                          if (items.length === 0) return <span className="text-slate-400">-</span>;
                          return <ActionsMenu items={items} />;
                        })()
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
