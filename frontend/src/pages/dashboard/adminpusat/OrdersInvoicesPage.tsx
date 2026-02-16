import React, { useState, useEffect } from 'react';
import { Receipt, Eye, FileText, Filter, Download, Check, X, Unlock } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { formatIDR } from '../../../utils';
import { ordersApi, invoicesApi, branchesApi } from '../../../services/api';

/**
 * Order & Invoice gabungan untuk Admin Pusat (filter cabang) dan Admin Cabang (cabang sendiri).
 * Admin Pusat bisa cek status bukti bayar (verifikasi) seperti role accounting.
 */
type TabType = 'order' | 'invoice';

const OrdersInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('order');
  const [branchId, setBranchId] = useState<string>('');
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isAdminPusat = user?.role === 'admin_pusat';
  const isAdminCabang = user?.role === 'admin_cabang';

  const fetchBranches = async () => {
    if (!isAdminPusat) return;
    try {
      const res = await branchesApi.list();
      if (res.data.success) setBranches(res.data.data || []);
    } catch {
      setBranches([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: { branch_id?: string } = {};
      if (isAdminPusat && branchId) params.branch_id = branchId;
      const [ordersRes, invoicesRes] = await Promise.all([
        ordersApi.list(params),
        invoicesApi.list(params)
      ]);
      if (ordersRes.data.success) setOrders(ordersRes.data.data || []);
      if (invoicesRes.data.success) setInvoices(invoicesRes.data.data || []);
    } catch {
      setOrders([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [isAdminPusat]);

  useEffect(() => {
    fetchData();
  }, [branchId, isAdminPusat]);

  const handleVerifyPayment = async (invoiceId: string, paymentProofId: string, verified: boolean) => {
    setVerifyingId(paymentProofId);
    try {
      await invoicesApi.verifyPayment(invoiceId, { payment_proof_id: paymentProofId, verified });
      showToast(verified ? 'Bukti bayar diverifikasi (transfer masuk)' : 'Pembayaran ditolak', 'success');
      setViewInvoice(null);
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleUnblock = async (inv: any) => {
    try {
      await invoicesApi.unblock(inv.id);
      showToast('Invoice diaktifkan kembali', 'success');
      setViewInvoice(null);
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal unblock', 'error');
    }
  };

  const openPdf = async (invoiceId: string) => {
    try {
      const res = await invoicesApi.getPdf(invoiceId);
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal unduh PDF', 'error');
    }
  };

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      paid: 'success',
      partial_paid: 'warning',
      tentative: 'default',
      draft: 'info',
      confirmed: 'info',
      processing: 'info',
      completed: 'success',
      overdue: 'error',
      canceled: 'error',
      cancelled: 'error'
    };
    return map[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order & Invoice</h1>
          <p className="text-slate-600 mt-1">
            {isAdminPusat ? 'Daftar order dan invoice. Filter cabang, cek status bukti bayar.' : 'Daftar order dan invoice cabang Anda.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setActiveTab('order')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'order' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Order ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'invoice' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Invoice ({invoices.length})
            </button>
          </div>
          {isAdminPusat && (
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
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
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Memuat...</div>
      ) : activeTab === 'order' ? (
        <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Order ({orders.length})
            </h2>
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
                  {orders.slice(0, 50).map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono">{o.order_number}</td>
                      <td className="py-3 pr-4">{o.User?.name || o.User?.company_name || '-'}</td>
                      <td className="py-3 pr-4">{o.Branch?.name || o.Branch?.code || '-'}</td>
                      <td className="py-3 pr-4"><Badge variant={getStatusBadge(o.status)}>{o.status}</Badge></td>
                      <td className="py-3 pr-4">{formatIDR(parseFloat(o.total_amount || 0))}</td>
                      <td className="py-3">{o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && <p className="text-slate-500 py-6 text-center">Belum ada order</p>}
          </Card>
      ) : (
        <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Invoice ({invoices.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4">Invoice #</th>
                    <th className="pb-2 pr-4">Order #</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2 pr-4">Dibayar</th>
                    <th className="pb-2 pr-4">Sisa</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 50).map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono">{inv.invoice_number}</td>
                      <td className="py-3 pr-4">{inv.Order?.order_number || '-'}</td>
                      <td className="py-3 pr-4">{inv.User?.name || inv.User?.company_name || '-'}</td>
                      <td className="py-3 pr-4">{formatIDR(parseFloat(inv.total_amount || 0))}</td>
                      <td className="py-3 pr-4 text-emerald-600">{formatIDR(parseFloat(inv.paid_amount || 0))}</td>
                      <td className="py-3 pr-4 text-red-600">{formatIDR(parseFloat(inv.remaining_amount || 0))}</td>
                      <td className="py-3 pr-4"><Badge variant={getStatusBadge(inv.status)}>{inv.status}</Badge>{inv.is_blocked && <Badge variant="error" className="ml-1">Block</Badge>}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" onClick={() => setViewInvoice(inv)} title="Detail"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" onClick={() => openPdf(inv.id)} title="PDF"><Download className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.length === 0 && <p className="text-slate-500 py-6 text-center">Belum ada invoice</p>}
          </Card>
      )}

      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewInvoice(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Detail Invoice</h2>
              <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Invoice #</dt><dd className="font-semibold">{viewInvoice.invoice_number}</dd></div>
              <div><dt className="text-slate-500">Order #</dt><dd className="font-semibold">{viewInvoice.Order?.order_number}</dd></div>
              <div><dt className="text-slate-500">Owner</dt><dd className="font-semibold">{viewInvoice.User?.name}</dd></div>
              <div><dt className="text-slate-500">Total</dt><dd className="font-semibold">{formatIDR(parseFloat(viewInvoice.total_amount))}</dd></div>
              <div><dt className="text-slate-500">Dibayar</dt><dd className="font-semibold text-emerald-600">{formatIDR(parseFloat(viewInvoice.paid_amount || 0))}</dd></div>
              <div><dt className="text-slate-500">Sisa</dt><dd className="font-semibold text-red-600">{formatIDR(parseFloat(viewInvoice.remaining_amount))}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><Badge variant={getStatusBadge(viewInvoice.status)}>{viewInvoice.status}</Badge>{viewInvoice.is_blocked && <Badge variant="error" className="ml-1">Blocked</Badge>}</dd></div>
            </dl>
            {viewInvoice.PaymentProofs?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 mb-2">Bukti Bayar (cek transfer masuk)</h4>
                <div className="space-y-2">
                  {viewInvoice.PaymentProofs.map((p: any) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center flex-wrap gap-2">
                      <span>{p.payment_type} · {formatIDR(parseFloat(p.amount))} — {p.verified_status === 'verified' ? '✓ Diverifikasi' : p.verified_status === 'rejected' ? 'Ditolak' : 'Pending'}</span>
                      {(p.verified_status === 'pending' || !p.verified_status) && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleVerifyPayment(viewInvoice.id, p.id, true)} disabled={verifyingId === p.id}>
                            <Check className="w-4 h-4 mr-1" /> Terima (transfer masuk)
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleVerifyPayment(viewInvoice.id, p.id, false)} disabled={verifyingId === p.id}>
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setViewInvoice(null)}>Tutup</Button>
              <Button variant="outline" onClick={() => openPdf(viewInvoice.id)}><Download className="w-4 h-4 mr-2" /> Unduh PDF</Button>
              {viewInvoice.is_blocked && (
                <Button variant="secondary" onClick={() => handleUnblock(viewInvoice)}><Unlock className="w-4 h-4 mr-2" /> Aktifkan Kembali</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersInvoicesPage;
