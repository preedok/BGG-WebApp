import React, { useState, useEffect } from 'react';
import { Receipt, Eye, Download, Calendar, CheckCircle, Clock, AlertCircle, Upload, X, Unlock, Check } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatIDR } from '../../../utils';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../../../utils/constants';
import { invoicesApi } from '../../../services/api';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  order_number: string;
  owner_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  due_date: string;
  created_date: string;
  is_blocked?: boolean;
}

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: { status?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' } = { limit, page, sort_by: sortBy, sort_order: sortOrder };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await invoicesApi.list(params);
      if (res.data.success) {
        const data = res.data.data || [];
        setInvoices(data);
        const p = (res.data as { pagination?: { total: number; page: number; limit: number; totalPages: number } }).pagination;
        setPagination(p || { total: data.length, page: 1, limit: data.length, totalPages: 1 });
      } else {
        setPagination(null);
      }
    } catch {
      setInvoices([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, page, limit]);

  const mapRow = (inv: any): InvoiceRow => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    order_number: inv.Order?.order_number || '-',
    owner_name: inv.User?.name || '-',
    total_amount: parseFloat(inv.total_amount),
    paid_amount: parseFloat(inv.paid_amount || 0),
    remaining_amount: parseFloat(inv.remaining_amount || 0),
    status: inv.status,
    due_date: inv.due_date_dp ? new Date(inv.due_date_dp).toLocaleDateString() : '-',
    created_date: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-',
    is_blocked: inv.is_blocked
  });

  const filteredInvoices = invoices.map(mapRow);

  const stats = [
    { label: 'Total Invoices', value: pagination?.total ?? invoices.length, icon: <Receipt className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, icon: <CheckCircle className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
    { label: 'Partial', value: invoices.filter((i) => i.status === 'partial_paid').length, icon: <Clock className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Tentative', value: invoices.filter((i) => i.status === 'tentative').length, icon: <AlertCircle className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'invoice', label: 'Invoice #', align: 'left', sortable: true, sortKey: 'invoice_number' },
    { id: 'order', label: 'Order #', align: 'left' },
    { id: 'owner', label: 'Owner', align: 'left' },
    { id: 'total', label: 'Total Amount', align: 'right', sortable: true, sortKey: 'total_amount' },
    { id: 'paid', label: 'Paid', align: 'right' },
    { id: 'remaining', label: 'Remaining', align: 'right' },
    { id: 'status', label: 'Status', align: 'center', sortable: true, sortKey: 'status' },
    { id: 'due_date', label: 'Due Date', align: 'left' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const getStatusBadge = (status: string) => (INVOICE_STATUS_COLORS[status] || 'default') as 'success' | 'warning' | 'info' | 'error' | 'default';

  const handleUnblock = async (inv: any) => {
    try {
      const res = await invoicesApi.unblock(inv.id);
      showToast('Invoice diaktifkan kembali', 'success');
      const updated = res.data?.data;
      setViewInvoice(null);
      if (updated) {
        const merged = { ...inv, is_blocked: false, unblocked_at: updated.unblocked_at, auto_cancel_at: updated.auto_cancel_at, Order: updated.Order ? { ...inv.Order, ...updated.Order, status: 'tentative' } : { ...inv.Order, status: 'tentative' } };
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? merged : i)));
      }
      fetchInvoices();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal unblock', 'error');
    }
  };

  const handleVerifyPayment = async (invoiceId: string, paymentProofId: string, verified: boolean) => {
    setVerifyingId(paymentProofId);
    try {
      await invoicesApi.verifyPayment(invoiceId, { payment_proof_id: paymentProofId, verified });
      showToast(verified ? 'Bukti bayar diverifikasi' : 'Ditolak', 'success');
      if (viewInvoice?.id === invoiceId) setViewInvoice(null);
      fetchInvoices();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const canUploadProof = (invoice: InvoiceRow) =>
    (user?.role === 'owner' || user?.role === 'role_invoice') && invoice.status !== 'paid';

  const canUnblock = (inv: any) =>
    ['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin'].includes(user?.role || '') && inv.is_blocked;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600 mt-1">Kelola invoice dan verifikasi pembayaran</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'tentative', 'partial_paid', 'paid', 'overdue', 'canceled', 'draft'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Semua' : INVOICE_STATUS_LABELS[status] || status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Memuat...</div>
        ) : (
          <Table
            columns={tableColumns}
            data={filteredInvoices}
            emptyMessage="Tidak ada invoice"
            sort={{ columnId: sortBy, order: sortOrder }}
            onSortChange={(col, order) => { setSortBy(col); setSortOrder(order); setPage(1); }}
            pagination={pagination ? {
              total: pagination.total,
              page: pagination.page,
              limit: pagination.limit,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
              onLimitChange: (l) => { setLimit(l); setPage(1); }
            } : undefined}
            renderRow={(invoice: InvoiceRow) => (
              <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{invoice.invoice_number}</td>
                <td className="px-6 py-4 text-slate-700">{invoice.order_number}</td>
                <td className="px-6 py-4 text-slate-700">{invoice.owner_name}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatIDR(invoice.total_amount)}</td>
                <td className="px-6 py-4 text-right text-emerald-600 font-semibold">{formatIDR(invoice.paid_amount)}</td>
                <td className="px-6 py-4 text-right text-red-600 font-semibold">{formatIDR(invoice.remaining_amount)}</td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={getStatusBadge(invoice.status)}>{INVOICE_STATUS_LABELS[invoice.status] || invoice.status}</Badge>
                  {invoice.is_blocked && <Badge variant="error" className="ml-1">Blocked</Badge>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.due_date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() => setViewInvoice(invoices.find((i) => i.id === invoice.id))}
                      title="Lihat detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </Card>

      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewInvoice(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Detail Invoice</h2>
              <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">Invoice #</dt><dd className="font-semibold">{viewInvoice.invoice_number}</dd></div>
              <div><dt className="text-slate-500">Order #</dt><dd className="font-semibold">{viewInvoice.Order?.order_number}</dd></div>
              <div><dt className="text-slate-500">Owner</dt><dd className="font-semibold">{viewInvoice.User?.name}</dd></div>
              <div><dt className="text-slate-500">Total</dt><dd className="font-semibold">{formatIDR(parseFloat(viewInvoice.total_amount))}</dd></div>
              <div><dt className="text-slate-500">Paid</dt><dd className="font-semibold text-emerald-600">{formatIDR(parseFloat(viewInvoice.paid_amount || 0))}</dd></div>
              <div><dt className="text-slate-500">Remaining</dt><dd className="font-semibold text-red-600">{formatIDR(parseFloat(viewInvoice.remaining_amount))}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><Badge variant={getStatusBadge(viewInvoice.status)}>{INVOICE_STATUS_LABELS[viewInvoice.status] || viewInvoice.status}</Badge>{viewInvoice.is_blocked && <Badge variant="error" className="ml-1">Blocked</Badge>}</dd></div>
            </dl>
            {viewInvoice.PaymentProofs?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 mb-2">Bukti Bayar</h4>
                <div className="space-y-2">
                  {viewInvoice.PaymentProofs.map((p: any) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                      <span>{p.payment_type} · {formatIDR(parseFloat(p.amount))} {p.verified_at ? '✓' : '(pending)'}</span>
                      {!p.verified_at && ['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin', 'role_accounting'].includes(user?.role || '') && (
                        <Button size="sm" onClick={() => handleVerifyPayment(viewInvoice.id, p.id, true)} disabled={verifyingId === p.id}>
                          <Check className="w-4 h-4 mr-1" /> Verifikasi
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setViewInvoice(null)}>Tutup</Button>
              {canUnblock(viewInvoice) && (
                <Button variant="secondary" onClick={() => handleUnblock(viewInvoice)}>
                  <Unlock className="w-4 h-4 mr-2" /> Aktifkan Kembali
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
