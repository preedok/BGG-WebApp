import React, { useState, useEffect } from 'react';
import { Receipt, Filter, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { accountingApi } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: { branch_id?: string; limit?: number } = { limit: 100 };
      if (branchId) params.branch_id = branchId;
      const res = await accountingApi.listOrders(params);
      if (res.data.success && Array.isArray(res.data.data)) setOrders(res.data.data);
      else setOrders([]);
    } catch {
      setOrders([]);
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
    fetchOrders();
  }, [branchId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Daftar Order</h1>
        <p className="text-slate-600 mt-1">Order per cabang atau seluruh cabang (terbaru dulu). Filter cabang untuk melihat orderan cabang tertentu.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Cabang</span>
          </div>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua cabang (order terbaru)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.code} – {b.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {loading && orders.length === 0 && <div className="text-center py-12 text-slate-500">Memuat...</div>}

      {!loading && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-3 pr-4">No. Order</th>
                  <th className="py-3 pr-4">Cabang</th>
                  <th className="py-3 pr-4">Owner</th>
                  <th className="py-3 pr-4">Subtotal</th>
                  <th className="py-3 pr-4">Penalty</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium">{o.order_number}</td>
                    <td className="py-3 pr-4">{o.Branch?.code} – {o.Branch?.name}</td>
                    <td className="py-3 pr-4">{o.User?.name}</td>
                    <td className="py-3 pr-4">{formatIDR(parseFloat(o.subtotal || 0))}</td>
                    <td className="py-3 pr-4">{formatIDR(parseFloat(o.penalty_amount || 0))}</td>
                    <td className="py-3 pr-4 font-medium">{formatIDR(parseFloat(o.total_amount || 0))}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{o.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="py-8 text-center text-slate-500">Tidak ada order.</p>}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AccountingOrdersPage;
