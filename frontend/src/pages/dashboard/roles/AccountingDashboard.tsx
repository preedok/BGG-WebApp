import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Receipt, DollarSign, TrendingUp, Building2, Filter } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { accountingApi, type AccountingDashboardData } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AccountingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { branch_id?: string; date_from?: string; date_to?: string } = {};
      if (branchId) params.branch_id = branchId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await accountingApi.getDashboard(params);
      if (res.data.success && res.data.data) setData(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const summary = data?.summary ?? { total_invoices: 0, total_receivable: 0, total_paid: 0, by_status: {}, by_branch: [] };
  const branches = data?.branches ?? [];
  const recent = data?.invoices_recent ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {user?.name ? `Selamat datang, ${user.name}` : 'Accounting'}
        </h1>
        <p className="text-slate-600 mt-1">Rekapitulasi piutang, pembayaran, dan laporan keuangan</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Cabang</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 min-w-[180px] focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Dari</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sampai</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <Button variant="primary" onClick={fetchDashboard} disabled={loading}>
            {loading ? 'Memuat...' : 'Terapkan'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">{error}</div>
      )}

      {loading && !data && <div className="text-center py-12 text-slate-500">Memuat data...</div>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Invoice</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.total_invoices}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Terbayar</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatIDR(summary.total_paid)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Piutang (Sisa)</p>
                  <p className="text-2xl font-bold text-amber-600">{formatIDR(summary.total_receivable)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice per Status</h3>
              <div className="space-y-2">
                {Object.entries(summary.by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <Badge variant="info">{status}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.by_status || {}).length === 0 && <p className="text-slate-500 text-sm">Belum ada data</p>}
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Per Cabang</h3>
              <div className="space-y-2">
                {(summary.by_branch || []).map((row: any) => (
                  <div key={row.branch_id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-800">{row.branch_name || row.code}</span>
                    <span className="text-sm font-semibold">{row.count} inv · Terbayar {formatIDR(row.paid)} · Sisa {formatIDR(row.receivable)}</span>
                  </div>
                ))}
                {(summary.by_branch || []).length === 0 && <p className="text-slate-500 text-sm">Belum ada data</p>}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Terbaru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4">No. Invoice</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2 pr-4">Terbayar</th>
                    <th className="pb-2 pr-4">Sisa</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 10).map((inv: any) => (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono">{inv.invoice_number}</td>
                      <td className="py-3 pr-4">{inv.User?.name ?? '-'}</td>
                      <td className="py-3 pr-4">{formatIDR(parseFloat(inv.total_amount || 0))}</td>
                      <td className="py-3 pr-4 text-emerald-600">{formatIDR(parseFloat(inv.paid_amount || 0))}</td>
                      <td className="py-3 pr-4">{formatIDR(parseFloat(inv.remaining_amount || 0))}</td>
                      <td className="py-3"><Badge variant="info">{inv.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recent.length === 0 && <p className="text-slate-500 py-4 text-center">Belum ada invoice</p>}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col h-20 gap-2 justify-center" onClick={() => navigate('/dashboard/accounting/financial-report')}>
                <Activity className="w-5 h-5" />
                <span className="text-sm">Laporan Keuangan</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 justify-center" onClick={() => navigate('/dashboard/accounting/reconciliation')}>
                <Receipt className="w-5 h-5" />
                <span className="text-sm">Rekonsiliasi Bank</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 justify-center" onClick={() => navigate('/dashboard/accounting/aging')}>
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Piutang (AR)</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 justify-center" onClick={() => navigate('/dashboard/invoices')}>
                <Receipt className="w-5 h-5" />
                <span className="text-sm">Semua Invoice</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountingDashboard;
