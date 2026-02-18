import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Receipt, Plus, Search, Eye, Edit, Download, X } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ordersApi, invoicesApi } from '../../../services/api';
import { formatIDR } from '../../../utils';
import { ORDER_STATUS_LABELS } from '../../../utils/constants';
import { TableColumn } from '../../../types';

/** Order dari API (list) */
interface ApiOrder {
  id: string;
  order_number: string;
  owner_id?: string;
  status: string;
  total_amount: number;
  subtotal?: number;
  created_at: string;
  User?: { id: string; name?: string; company_name?: string };
  Branch?: { id: string; code?: string; name?: string };
  OrderItems?: Array<{ type: string; product_ref_id: string; quantity: number; unit_price: number }>;
}

const OrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const qFromUrl = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(qFromUrl);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  useEffect(() => {
    if (qFromUrl) setSearchTerm(qFromUrl);
  }, [qFromUrl]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, string | number> = { limit, page, sort_by: sortBy, sort_order: sortOrder };
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (searchTerm.trim()) params.order_number = searchTerm.trim();
    if (user?.role === 'owner' && user?.id) params.owner_id = user.id;
    ordersApi
      .list(params)
      .then((res) => {
        const data = (res.data as { data?: ApiOrder[]; pagination?: typeof pagination })?.data ?? [];
        setOrders(Array.isArray(data) ? data : []);
        const p = (res.data as { pagination?: typeof pagination }).pagination;
        setPagination(p || null);
      })
      .catch(() => {
        setOrders([]);
        setPagination(null);
        showToast('Gagal memuat daftar order', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, user?.id, user?.role, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    if (!searchTerm && !qFromUrl) return;
    const t = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const [viewOrder, setViewOrder] = useState<ApiOrder | null>(null);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          (o.User?.company_name ?? o.User?.name ?? '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const va = sortBy === 'total_amount' ? (a.total_amount ?? 0) : new Date(a.created_at || 0).getTime();
      const vb = sortBy === 'total_amount' ? (b.total_amount ?? 0) : new Date(b.created_at || 0).getTime();
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [orders, searchTerm, sortBy, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page, limit]);

  const totalPages = Math.ceil(filteredOrders.length / limit) || 1;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const isOwner = user?.role === 'owner';

  const stats = [
    { label: isOwner ? 'Total Order' : 'Total Orders', value: pagination?.total ?? filteredOrders.length, color: 'from-blue-500 to-cyan-500' },
    { label: isOwner ? 'Dikonfirmasi' : 'Confirmed', value: orders.filter((o) => o.status === 'confirmed').length, color: 'from-emerald-500 to-teal-500' },
    { label: isOwner ? 'Menunggu / Draft' : 'Pending/Draft', value: orders.filter((o) => ['pending', 'draft', 'tentative'].includes(o.status)).length, color: 'from-yellow-500 to-orange-500' },
    { label: isOwner ? 'Selesai' : 'Completed', value: orders.filter((o) => o.status === 'completed').length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = useMemo(() => {
    const base = [
      { id: 'order_number', label: isOwner ? 'Order' : 'Order ID', align: 'left' as const, sortable: true },
      { id: 'amount', label: 'Total', align: 'right' as const, sortable: true },
      { id: 'status', label: 'Status', align: 'center' as const, sortable: true },
      { id: 'date', label: 'Tanggal', align: 'left' as const, sortable: true },
      { id: 'actions', label: 'Aksi', align: 'center' as const }
    ];
    if (!isOwner) {
      base.splice(1, 0, { id: 'owner_name', label: 'Owner', align: 'left' as const, sortable: true });
    }
    return base as TableColumn[];
  }, [isOwner]);

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      confirmed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'error',
      completed: 'success',
      draft: 'default',
      tentative: 'default',
      partial_paid: 'info',
      paid: 'success'
    };
    return variants[status] || 'default';
  };

  const canEditOrder = (order: ApiOrder) => {
    if (['super_admin', 'admin_pusat', 'admin_cabang', 'admin_koordinator', 'invoice_koordinator', 'role_invoice_saudi'].includes(user?.role ?? '')) return true;
    if (user?.role === 'owner' && order.owner_id === user?.id) return true;
    return false;
  };

  const handleDownload = (order: ApiOrder) => {
    showToast(isOwner ? 'Invoice tersedia di menu Invoice. Silakan buka menu Invoice untuk unduh atau upload bukti bayar.' : `Invoice untuk ${order.order_number} tersedia di halaman Invoice`, 'info');
  };

  const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{isOwner ? 'Order Saya' : 'Orders Management'}</h1>
          <p className="text-slate-600 mt-1">
            {isOwner ? 'Daftar order dan invoice Anda. Setelah order dibuat, invoice otomatis terbit dan dapat dibayar di menu Invoice.' : 'View and manage all orders from travel partners'}
          </p>
        </div>
        {(user?.role === 'owner' || user?.role === 'invoice_koordinator' || user?.role === 'role_invoice_saudi' || user?.role === 'super_admin' || user?.role === 'admin_pusat' || user?.role === 'admin_cabang' || user?.role === 'admin_koordinator') && (
          <Button variant="primary" onClick={() => navigate('/dashboard/orders/new')}>
            <Plus className="w-5 h-5 mr-2" />
            Buat Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={isOwner ? 'Cari order atau nomor invoice...' : 'Search orders...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'draft', 'tentative', 'confirmed', 'processing', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? (isOwner ? 'Semua' : 'All') : (ORDER_STATUS_LABELS[status] || status)}
              </Button>
            ))}
          </div>
        </div>

        <Table
          columns={tableColumns}
          data={paginatedOrders}
          emptyMessage={loading ? 'Memuat...' : (isOwner ? 'Belum ada order' : 'Tidak ada order')}
          sort={{ columnId: sortBy, order: sortOrder }}
          onSortChange={(col, order) => { setSortBy(col); setSortOrder(order); setPage(1); }}
          pagination={filteredOrders.length > 0 ? {
            total: filteredOrders.length,
            page,
            limit,
            totalPages,
            onPageChange: setPage,
            onLimitChange: (l) => { setLimit(l); setPage(1); }
          } : undefined}
          renderRow={(order: ApiOrder) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-900">{order.order_number}</td>
              {!isOwner && (
                <td className="px-6 py-4 text-slate-700">{order.User?.company_name ?? order.User?.name ?? '-'}</td>
              )}
              <td className="px-6 py-4 text-right font-semibold text-slate-900">
                {formatIDR(order.total_amount ?? 0)}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={getStatusBadge(order.status)}>{ORDER_STATUS_LABELS[order.status] || order.status}</Badge>
              </td>
              <td className="px-6 py-4 text-slate-600 text-sm">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    onClick={() => setViewOrder(order)}
                    title="Lihat detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canEditOrder(order) && (
                    <button
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      onClick={() => navigate(`/dashboard/orders/${order.id}/edit`)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => handleDownload(order)}
                    title="Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* View Order Modal */}
      {viewOrder && (
        <ModalOverlay onClose={() => setViewOrder(null)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{isOwner ? 'Detail Order Saya' : 'Detail Order'}</h2>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">{isOwner ? 'Order' : 'Order ID'}</dt><dd className="font-semibold">{viewOrder.order_number}</dd></div>
              {!isOwner && (
                <div><dt className="text-slate-500">Owner</dt><dd className="font-semibold">{viewOrder.User?.company_name ?? viewOrder.User?.name ?? '-'}</dd></div>
              )}
              <div><dt className="text-slate-500">Total</dt><dd className="font-semibold text-emerald-600">{formatIDR(viewOrder.total_amount ?? 0)}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><Badge variant={getStatusBadge(viewOrder.status)}>{ORDER_STATUS_LABELS[viewOrder.status] || viewOrder.status}</Badge></dd></div>
              <div><dt className="text-slate-500">Tanggal</dt><dd className="font-semibold">{viewOrder.created_at ? new Date(viewOrder.created_at).toLocaleString('id-ID') : '-'}</dd></div>
              {isOwner && (
                <div><dt className="text-slate-500">Invoice</dt><dd className="text-slate-600">Setelah order dibuat, invoice otomatis terbit. Lihat dan bayar di menu <strong>Invoice</strong>.</dd></div>
              )}
              {viewOrder.OrderItems && viewOrder.OrderItems.length > 0 && (
                <div>
                  <dt className="text-slate-500 mb-1">Item</dt>
                  <dd className="text-slate-700">
                    <ul className="list-disc pl-4">
                      {viewOrder.OrderItems.map((it, i) => (
                        <li key={i}>{it.type} × {it.quantity} @ {formatIDR(it.unit_price ?? 0)}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setViewOrder(null)}>Tutup</Button>
              {isOwner && (
                <Button variant="secondary" onClick={() => { setViewOrder(null); navigate('/dashboard/invoices'); }}>
                  Lihat Invoice
                </Button>
              )}
              {canEditOrder(viewOrder) && (
                <Button variant="primary" onClick={() => { setViewOrder(null); navigate(`/dashboard/orders/${viewOrder.id}/edit`); }}>
                  {isOwner ? 'Edit order' : 'Edit order'}
                </Button>
              )}
              {(user?.role === 'owner' || user?.role === 'invoice_koordinator' || user?.role === 'role_invoice_saudi' || user?.role === 'super_admin') && ['draft', 'tentative', 'confirmed', 'processing'].includes(viewOrder.status) && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await invoicesApi.create({ order_id: viewOrder.id });
                      showToast('Invoice berhasil dibuat. Silakan upload bukti bayar di halaman Invoice.', 'success');
                      setViewOrder(null);
                      navigate('/dashboard/invoices');
                    } catch (err: any) {
                      showToast(err.response?.data?.message || 'Gagal membuat invoice (mungkin sudah ada)', 'error');
                    }
                  }}
                >
                  Buat Invoice
                </Button>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default OrdersPage;
