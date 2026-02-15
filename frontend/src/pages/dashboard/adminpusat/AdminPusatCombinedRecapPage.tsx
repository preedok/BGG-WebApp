import React, { useState, useEffect } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { adminPusatApi, type AdminPusatCombinedRecapData } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AdminPusatCombinedRecapPage: React.FC = () => {
  const [data, setData] = useState<AdminPusatCombinedRecapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchRecap = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { branch_id?: string; date_from?: string; date_to?: string } = {};
      if (branchId) params.branch_id = branchId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await adminPusatApi.getCombinedRecap(params);
      if (res.data.success && res.data.data) setData(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Gagal memuat rekap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap();
  }, []);

  const recap = data?.recap ?? { total_orders: 0, total_invoices: 0, orders_by_branch: {}, orders_by_status: {}, items_hotel: 0, items_visa: 0, items_ticket: 0, items_bus: 0 };
  const orders = data?.orders ?? [];
  const branches = data?.branches ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rekap Gabungan</h1>
        <p className="text-slate-600 mt-1">Seluruh proses pekerjaan dan order di semua cabang</p>
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
          <Button variant="primary" onClick={fetchRecap} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan'}</Button>
        </div>
      </Card>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">{error}</div>}
      {loading && !data && <div className="text-center py-12 text-slate-500">Memuat data...</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card><p className="text-sm text-slate-600">Total Order</p><p className="text-2xl font-bold">{recap.total_orders}</p></Card>
            <Card><p className="text-sm text-slate-600">Total Invoice</p><p className="text-2xl font-bold">{recap.total_invoices}</p></Card>
            <Card><p className="text-sm text-slate-600">Item Hotel</p><p className="text-2xl font-bold">{recap.items_hotel}</p></Card>
            <Card><p className="text-sm text-slate-600">Item Visa</p><p className="text-2xl font-bold">{recap.items_visa}</p></Card>
            <Card><p className="text-sm text-slate-600">Item Tiket</p><p className="text-2xl font-bold">{recap.items_ticket}</p></Card>
            <Card><p className="text-sm text-slate-600">Item Bus</p><p className="text-2xl font-bold">{recap.items_bus}</p></Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order per Status</h3>
              <div className="space-y-2">
                {Object.entries(recap.orders_by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-2 border-b border-slate-100">
                    <Badge variant="info">{status}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order per Cabang</h3>
              <div className="space-y-2">
                {Object.entries(recap.orders_by_branch || {}).map(([bid, count]) => {
                  const branch = branches.find((b: any) => b.id === bid);
                  return (
                    <div key={bid} className="flex justify-between py-2 border-b border-slate-100">
                      <span>{branch ? `${branch.code} - ${branch.name}` : bid}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Daftar Order (maks. 50)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4">No. Order</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Cabang</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono">{o.order_number}</td>
                      <td className="py-3 pr-4">{o.User?.name ?? '-'}</td>
                      <td className="py-3 pr-4">{o.Branch?.name ?? '-'}</td>
                      <td className="py-3 pr-4"><Badge variant="info">{o.status}</Badge></td>
                      <td className="py-3">{o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && <p className="text-slate-500 py-4 text-center">Tidak ada order</p>}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPusatCombinedRecapPage;
