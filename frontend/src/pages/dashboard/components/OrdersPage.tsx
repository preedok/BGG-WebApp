import React, { useState } from 'react';
import { Receipt, Plus, Search, Eye, Edit, Trash2, Download, X } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useOrders } from '../../../contexts/OrderContext';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { TableColumn, OrderListItem, OrderStatus } from '../../../types';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, addOrder, updateOrder, deleteOrder, getOrderById } = useOrders();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [viewOrder, setViewOrder] = useState<OrderListItem | null>(null);
  const [editOrder, setEditOrder] = useState<OrderListItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<OrderListItem | null>(null);

  // Form state for New/Edit
  const [form, setForm] = useState({
    owner_name: '',
    package_name: '',
    amount: '',
    status: 'pending' as OrderStatus,
    date: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: orders.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Confirmed', value: orders.filter((o) => o.status === 'confirmed').length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Pending', value: orders.filter((o) => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
    { label: 'Completed', value: orders.filter((o) => o.status === 'completed').length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'order_number', label: 'Order ID', align: 'left' },
    { id: 'owner_name', label: 'Owner', align: 'left' },
    { id: 'package_name', label: 'Package', align: 'left' },
    { id: 'amount', label: 'Amount', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      confirmed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'error',
      completed: 'success',
      draft: 'default',
      tentative: 'default'
    };
    return variants[status] || 'default';
  };

  const canEditOrder = (order: OrderListItem) => {
    if (user?.role === 'super_admin' || user?.role === 'admin_pusat' || user?.role === 'admin_cabang') return true;
    if (user?.role === 'owner' || user?.role === 'role_invoice') return true;
    return false;
  };

  const canDeleteOrder = (order: OrderListItem) => {
    if (order.status === 'cancelled' || order.status === 'completed') return false;
    return canEditOrder(order);
  };

  const handleOpenNew = () => {
    setForm({
      owner_name: user?.role === 'owner' ? user.company_name || user.name || '' : '',
      package_name: '',
      amount: '',
      status: 'pending',
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });
    setShowNewModal(true);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.owner_name.trim() || !form.package_name.trim() || !form.amount.trim()) {
      showToast('Isi semua field wajib', 'warning');
      return;
    }
    addOrder({
      owner_name: form.owner_name.trim(),
      package_name: form.package_name.trim(),
      amount: form.amount.trim(),
      status: form.status,
      date: form.date
    });
    showToast('Order berhasil dibuat', 'success');
    setShowNewModal(false);
  };

  const handleOpenEdit = (order: OrderListItem) => {
    setForm({
      owner_name: order.owner_name,
      package_name: order.package_name,
      amount: order.amount,
      status: order.status,
      date: order.date
    });
    setEditOrder(order);
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    if (!form.owner_name.trim() || !form.package_name.trim() || !form.amount.trim()) {
      showToast('Isi semua field wajib', 'warning');
      return;
    }
    updateOrder(editOrder.id, {
      owner_name: form.owner_name.trim(),
      package_name: form.package_name.trim(),
      amount: form.amount.trim(),
      status: form.status,
      date: form.date
    });
    showToast('Order berhasil diubah', 'success');
    setEditOrder(null);
  };

  const handleDeleteOrder = () => {
    if (!deleteConfirm) return;
    deleteOrder(deleteConfirm.id);
    showToast('Order berhasil dihapus', 'success');
    setDeleteConfirm(null);
  };

  const handleDownload = (order: OrderListItem) => {
    showToast(`Download invoice ${order.order_number} (demo)`, 'info');
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
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-1">View and manage all orders from travel partners</p>
        </div>
        {(user?.role === 'owner' || user?.role === 'role_invoice' || user?.role === 'super_admin' || user?.role === 'admin_pusat' || user?.role === 'admin_cabang') && (
          <Button variant="primary" onClick={handleOpenNew}>
            <Plus className="w-5 h-5 mr-2" />
            New Order
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
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'confirmed', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Table
          columns={tableColumns}
          data={filteredOrders}
          emptyMessage="Tidak ada order"
          renderRow={(order: OrderListItem) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-900">{order.order_number}</td>
              <td className="px-6 py-4 text-slate-700">{order.owner_name}</td>
              <td className="px-6 py-4 text-slate-700">{order.package_name}</td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">{order.amount}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={getStatusBadge(order.status)}>{order.status}</Badge>
              </td>
              <td className="px-6 py-4 text-slate-600 text-sm">{order.date}</td>
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
                      onClick={() => handleOpenEdit(order)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => handleDownload(order)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {canDeleteOrder(order) && (
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => setDeleteConfirm(order)}
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
              <h2 className="text-xl font-bold text-slate-900">Detail Order</h2>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">Order ID</dt><dd className="font-semibold">{viewOrder.order_number}</dd></div>
              <div><dt className="text-slate-500">Owner</dt><dd className="font-semibold">{viewOrder.owner_name}</dd></div>
              <div><dt className="text-slate-500">Package</dt><dd className="font-semibold">{viewOrder.package_name}</dd></div>
              <div><dt className="text-slate-500">Amount</dt><dd className="font-semibold text-emerald-600">{viewOrder.amount}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><Badge variant={getStatusBadge(viewOrder.status)}>{viewOrder.status}</Badge></dd></div>
              <div><dt className="text-slate-500">Date</dt><dd className="font-semibold">{viewOrder.date}</dd></div>
            </dl>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setViewOrder(null)}>Tutup</Button>
              {canEditOrder(viewOrder) && <Button variant="primary" onClick={() => { setViewOrder(null); handleOpenEdit(viewOrder); }}>Edit</Button>}
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* New Order Modal */}
      {showNewModal && (
        <ModalOverlay onClose={() => setShowNewModal(false)}>
          <form onSubmit={handleCreateOrder} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Buat Order Baru</h2>
              <button type="button" onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <Input fullWidth label="Nama Owner" value={form.owner_name} onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))} />
              <Input fullWidth label="Nama Paket / Produk" value={form.package_name} onChange={(e) => setForm((f) => ({ ...f, package_name: e.target.value }))} />
              <Input fullWidth label="Amount (Rp)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Input label="Tanggal" type="datetime-local" fullWidth value={form.date ? form.date.replace(' ', 'T') : ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value.replace('T', ' ') }))} />
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan Order</Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Edit Order Modal */}
      {editOrder && (
        <ModalOverlay onClose={() => setEditOrder(null)}>
          <form onSubmit={handleUpdateOrder} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Order</h2>
              <button type="button" onClick={() => setEditOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-slate-600 text-sm mb-4">Order: {editOrder.order_number}</p>
            <div className="space-y-4">
              <Input fullWidth label="Nama Owner" value={form.owner_name} onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))} />
              <Input fullWidth label="Nama Paket / Produk" value={form.package_name} onChange={(e) => setForm((f) => ({ ...f, package_name: e.target.value }))} />
              <Input fullWidth label="Amount (Rp)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Input label="Tanggal" type="datetime-local" fullWidth value={form.date ? form.date.replace(' ', 'T') : ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value.replace('T', ' ') }))} />
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOrder(null)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan Perubahan</Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ModalOverlay onClose={() => setDeleteConfirm(null)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Hapus Order?</h2>
            <p className="text-slate-600 mb-4">
              Order <strong>{deleteConfirm.order_number}</strong> ({deleteConfirm.package_name}) akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
              <Button variant="danger" onClick={handleDeleteOrder}>Hapus</Button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default OrdersPage;
