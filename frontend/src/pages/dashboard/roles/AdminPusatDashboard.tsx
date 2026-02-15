import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Users,
  BarChart3,
  FileText,
  Package,
  Filter,
  ChevronRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { adminPusatApi, type AdminPusatDashboardData } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AdminPusatDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminPusatDashboardData | null>(null);
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
      const res = await adminPusatApi.getDashboard(params);
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

  const orders = data?.orders ?? { total: 0, by_status: {}, by_branch: [], total_revenue: 0 };
  const branches = data?.branches ?? [];
  const ordersRecent = data?.orders_recent ?? [];
  const invoices = data?.invoices ?? { total: 0, by_status: {} };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {user?.name ? `Selamat datang, ${user.name}` : 'Admin Pusat'}
        </h1>
        <p className="text-slate-600 mt-1">Rekapitulasi transaksi dan pekerjaan cabang</p>
      </div>

      {/* Filter */}
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
            <label className="block text-xs font-medium text-slate-500 mb-1">Dari tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sampai tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button variant="primary" onClick={fetchDashboard} disabled={loading}>
            {loading ? 'Memuat...' : 'Terapkan'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Order</p>
                  <p className="text-3xl font-bold text-slate-900">{orders.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{formatIDR(orders.total_revenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Invoice</p>
                  <p className="text-3xl font-bold text-slate-900">{invoices.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Owner</p>
                  <p className="text-3xl font-bold text-slate-900">{data.owners_total ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order per Status</h3>
              <div className="space-y-2">
                {Object.entries(orders.by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <Badge variant="info">{status}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {Object.keys(orders.by_status || {}).length === 0 && (
                  <p className="text-slate-500 text-sm">Belum ada data</p>
                )}
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order per Cabang</h3>
              <div className="space-y-2">
                {(orders.by_branch || []).map((row: any) => (
                  <div key={row.branch_id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-800">{row.branch_name || row.code}</span>
                    <span className="font-semibold">{row.count} order · {formatIDR(row.revenue || 0)}</span>
                  </div>
                ))}
                {(orders.by_branch || []).length === 0 && (
                  <p className="text-slate-500 text-sm">Belum ada data</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Terbaru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4">No. Order</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Cabang</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersRecent.slice(0, 10).map((o: any) => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono">{o.order_number}</td>
                      <td className="py-3 pr-4">{o.User?.name ?? '-'}</td>
                      <td className="py-3 pr-4">{o.Branch?.name ?? '-'}</td>
                      <td className="py-3 pr-4"><Badge variant="info">{o.status}</Badge></td>
                      <td className="py-3 pr-4">{formatIDR(o.total_amount || 0)}</td>
                      <td className="py-3">{o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ordersRecent.length === 0 && <p className="text-slate-500 py-4 text-center">Belum ada order</p>}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col h-24 gap-2 justify-center" onClick={() => navigate('/dashboard/combined-recap')}>
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Rekap Gabungan</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 gap-2 justify-center" onClick={() => navigate('/dashboard/branches')}>
                <Building2 className="w-6 h-6" />
                <span className="text-sm">Cabang & Akun</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 gap-2 justify-center" onClick={() => navigate('/dashboard/admin-pusat/users')}>
                <Users className="w-6 h-6" />
                <span className="text-sm">Buat Akun Bus/Hotel</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 gap-2 justify-center" onClick={() => navigate('/dashboard/flyers')}>
                <Package className="w-6 h-6" />
                <span className="text-sm">Flyer & Template</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPusatDashboard;
