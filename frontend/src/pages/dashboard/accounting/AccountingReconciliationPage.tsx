import React, { useState, useEffect } from 'react';
import { Receipt, Filter, CheckCircle, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { accountingApi } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingReconciliationPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciled, setReconciled] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (reconciled) params.reconciled = reconciled;
      if (branchId) params.branch_id = branchId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await accountingApi.getReconciliation(params);
      if (res.data.success && res.data.data) setPayments(res.data.data);
      else setPayments([]);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    accountingApi.getDashboard({}).then((r) => {
      if (r.data.success && r.data.data?.branches) setBranches(r.data.data.branches);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchList();
  }, [reconciled, branchId, dateFrom, dateTo]);

  const handleReconcile = async (id: string) => {
    try {
      await accountingApi.reconcilePayment(id);
      fetchList();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menandai rekonsiliasi');
    }
  };

  const resetFilters = () => {
    setReconciled('');
    setBranchId('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = branchId || reconciled || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rekonsiliasi Bank</h1>
          <p className="text-slate-600 mt-1">Cocokkan bukti pembayaran dengan rekening koran, tandai yang sudah direkonsiliasi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">aktif</span>}
          </Button>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>}
          <Button variant="primary" size="sm" onClick={fetchList} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-slate-50/80">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cabang</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="">Semua cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status Rekonsiliasi</label>
              <select value={reconciled} onChange={(e) => setReconciled(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="">Semua</option>
                <option value="true">Sudah direkonsiliasi</option>
                <option value="false">Belum direkonsiliasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="primary" onClick={fetchList} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan'}</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <p className="text-center py-8 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4">Tanggal</th>
                  <th className="pb-2 pr-4">Invoice / Order</th>
                  <th className="pb-2 pr-4">Owner</th>
                  <th className="pb-2 pr-4">Cabang</th>
                  <th className="pb-2 pr-4">Jumlah</th>
                  <th className="pb-2 pr-4">Bank</th>
                  <th className="pb-2 pr-4">Verifikasi</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4">{p.transfer_date || (p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-')}</td>
                    <td className="py-3 pr-4">{p.Invoice?.invoice_number} / {p.Invoice?.Order?.order_number}</td>
                    <td className="py-3 pr-4">{p.Invoice?.User?.name || '-'}</td>
                    <td className="py-3 pr-4">{p.Invoice?.Branch?.name || '-'}</td>
                    <td className="py-3 pr-4 font-medium">{formatIDR(parseFloat(p.amount || 0))}</td>
                    <td className="py-3 pr-4">{p.bank_name || '-'}</td>
                    <td className="py-3 pr-4">{p.verified_at ? <Badge variant="success">Terverifikasi</Badge> : <Badge variant="warning">Pending</Badge>}</td>
                    <td className="py-3 pr-4">
                      {p.reconciled_at ? (
                        <Badge variant="success">Direkonsiliasi</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleReconcile(p.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Tandai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && payments.length === 0 && <p className="text-slate-500 py-8 text-center">Tidak ada data pembayaran</p>}
      </Card>
    </div>
  );
};

export default AccountingReconciliationPage;
