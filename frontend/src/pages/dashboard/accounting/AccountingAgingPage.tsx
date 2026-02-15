import React, { useState, useEffect } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { accountingApi, type AccountingAgingData } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingAgingPage: React.FC = () => {
  const [data, setData] = useState<AccountingAgingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);

  const fetchAging = async () => {
    setLoading(true);
    try {
      const params = branchId ? { branch_id: branchId } : {};
      const res = await accountingApi.getAgingReport(params);
      if (res.data.success && res.data.data) setData(res.data.data);
    } catch {
      setData(null);
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
    fetchAging();
  }, []);

  const buckets = data?.buckets ?? { current: [], days_1_30: [], days_31_60: [], days_61_plus: [] };
  const totals = data?.totals ?? { current: 0, days_1_30: 0, days_31_60: 0, days_61_plus: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Piutang Usaha (AR)</h1>
        <p className="text-slate-600 mt-1">Aging piutang: belum jatuh tempo, 1–30 hari, 31–60 hari, 61+ hari</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Cabang</span>
          </div>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
            ))}
          </select>
          <Button variant="primary" onClick={fetchAging} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan'}</Button>
        </div>
      </Card>

      {loading && !data && <div className="text-center py-12 text-slate-500">Memuat...</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <p className="text-sm text-slate-600">Total Piutang</p>
              <p className="text-xl font-bold text-amber-600">{formatIDR(data.total_outstanding)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">Current</p>
              <p className="text-lg font-bold text-slate-800">{formatIDR(totals.current)}</p>
              <p className="text-xs text-slate-500">{buckets.current.length} invoice</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">1–30 hari</p>
              <p className="text-lg font-bold text-amber-600">{formatIDR(totals.days_1_30)}</p>
              <p className="text-xs text-slate-500">{buckets.days_1_30.length} invoice</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">31–60 hari</p>
              <p className="text-lg font-bold text-orange-600">{formatIDR(totals.days_31_60)}</p>
              <p className="text-xs text-slate-500">{buckets.days_31_60.length} invoice</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">61+ hari</p>
              <p className="text-lg font-bold text-red-600">{formatIDR(totals.days_61_plus)}</p>
              <p className="text-xs text-slate-500">{buckets.days_61_plus.length} invoice</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Belum Jatuh Tempo</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {buckets.current.slice(0, 15).map((inv: any) => (
                  <div key={inv.id} className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span>{inv.Order?.order_number} – {inv.User?.name}</span>
                    <span className="font-medium">{formatIDR(parseFloat(inv.remaining_amount || 0))}</span>
                  </div>
                ))}
                {buckets.current.length === 0 && <p className="text-slate-500 text-sm">Tidak ada</p>}
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Terlambat 1–30 Hari</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {buckets.days_1_30.slice(0, 15).map((inv: any) => (
                  <div key={inv.id} className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span>{inv.Order?.order_number} – {inv.User?.name}</span>
                    <span className="font-medium text-amber-600">{formatIDR(parseFloat(inv.remaining_amount || 0))}</span>
                  </div>
                ))}
                {buckets.days_1_30.length === 0 && <p className="text-slate-500 text-sm">Tidak ada</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountingAgingPage;
