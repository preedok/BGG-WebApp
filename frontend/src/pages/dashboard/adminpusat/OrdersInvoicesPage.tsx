import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt, Filter, Download, Check, X, Unlock, MoreVertical, Eye, FileText, ChevronLeft, ChevronRight,
  FileSpreadsheet, CreditCard, LayoutGrid, ExternalLink, DollarSign, Package, Wallet
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { DashboardFilterBar } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { formatIDR } from '../../../utils';
import { INVOICE_STATUS_LABELS, ORDER_STATUS_LABELS } from '../../../utils/constants';
import { invoicesApi, branchesApi, businessRulesApi, ownersApi, type InvoicesSummaryData } from '../../../services/api';

const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/api\/v1\/?$/, '') || '';

/** URL file untuk preview/download (uploads) */
const getFileUrl = (path: string) => {
  if (!path || path === 'issued-saudi') return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
};

/**
 * Order & Invoice - Satu halaman gabungan untuk Admin Pusat & Admin Cabang.
 * Modal Detail Invoice: tab Invoice & Order & tab Bukti Bayar, file preview inline.
 */
const OrdersInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [branchId, setBranchId] = useState<string>('');
  const [wilayahId, setWilayahId] = useState<string>('');
  const [provinsiId, setProvinsiId] = useState<string>('');
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [wilayahList, setWilayahList] = useState<{ id: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ id: string | number; name?: string; nama?: string }[]>([]);
  const [owners, setOwners] = useState<{ id: string; user_id?: string; User?: { id: string; name: string; company_name?: string } }[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('');
  const [filterOwnerId, setFilterOwnerId] = useState<string>('');
  const [filterInvoiceNumber, setFilterInvoiceNumber] = useState<string>('');
  const [filterOrderNumber, setFilterOrderNumber] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterDueStatus, setFilterDueStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<'invoice' | 'payments'>('invoice');
  const [invoicePdfUrl, setInvoicePdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});
  const [summary, setSummary] = useState<InvoicesSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const isAdminPusat = user?.role === 'admin_pusat';
  const isAdminCabang = user?.role === 'admin_cabang';
  const isAccounting = user?.role === 'role_accounting';

  const fetchBranches = async () => {
    if (!isAdminPusat && !isAccounting) return;
    try {
      const res = await branchesApi.list({ limit: 500, page: 1 });
      if (res.data.success) setBranches(res.data.data || []);
    } catch {
      setBranches([]);
    }
  };

  useEffect(() => {
    if (isAdminPusat || isAccounting) {
      branchesApi.listWilayah().then((r) => { if (r.data.success) setWilayahList(r.data.data || []); }).catch(() => {});
      branchesApi.listProvinces().then((r) => { if (r.data.success) setProvinces(r.data.data || []); }).catch(() => {});
    }
  }, [isAdminPusat, isAccounting]);

  const fetchOwners = async () => {
    try {
      const params: { branch_id?: string } = {};
      if (isAdminCabang && user?.branch_id) params.branch_id = user.branch_id;
      if ((isAdminPusat || isAccounting) && branchId) params.branch_id = branchId;
      const res = await ownersApi.list(params);
      if (res.data.success) setOwners(res.data.data || []);
    } catch {
      setOwners([]);
    }
  };

  const buildListParams = () => {
    const params: Record<string, string | number | undefined> = { limit, page, sort_by: sortBy, sort_order: sortOrder };
    if (branchId) params.branch_id = branchId;
    if (wilayahId) params.wilayah_id = wilayahId;
    if (provinsiId) params.provinsi_id = provinsiId;
    if (filterStatus) params.status = filterStatus;
    if (filterOrderStatus) params.order_status = filterOrderStatus;
    if (filterOwnerId) params.owner_id = filterOwnerId;
    if (filterInvoiceNumber.trim()) params.invoice_number = filterInvoiceNumber.trim();
    if (filterOrderNumber.trim()) params.order_number = filterOrderNumber.trim();
    if (filterDateFrom) params.date_from = filterDateFrom;
    if (filterDateTo) params.date_to = filterDateTo;
    if (filterDueStatus) params.due_status = filterDueStatus;
    return params;
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const params: Record<string, string> = {};
      if (branchId) params.branch_id = branchId;
      if (wilayahId) params.wilayah_id = wilayahId;
      if (provinsiId) params.provinsi_id = provinsiId;
      if (filterStatus) params.status = filterStatus;
      if (filterOrderStatus) params.order_status = filterOrderStatus;
      if (filterOwnerId) params.owner_id = filterOwnerId;
      if (filterInvoiceNumber.trim()) params.invoice_number = filterInvoiceNumber.trim();
      if (filterOrderNumber.trim()) params.order_number = filterOrderNumber.trim();
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;
      if (filterDueStatus) params.due_status = filterDueStatus;
      const res = await invoicesApi.getSummary(params);
      if (res.data.success && res.data.data) setSummary(res.data.data);
      else setSummary(null);
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = buildListParams();
      const res = await invoicesApi.list(params);
      if (res.data.success) {
        const data = res.data.data || [];
        setInvoices(data);
        const pag = (res.data as { pagination?: { total: number; page: number; limit: number; totalPages: number } }).pagination;
        setPagination(pag || (data.length > 0 ? { total: data.length, page: 1, limit: data.length, totalPages: 1 } : null));
        const summaryPayload = (res.data as { summary?: InvoicesSummaryData }).summary;
        if (summaryPayload) setSummary(summaryPayload);
      } else {
        setPagination(null);
        setSummary(null);
      }
    } catch {
      setInvoices([]);
      setPagination(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetail = async (id: string) => {
    try {
      const res = await invoicesApi.getById(id);
      if (res.data.success) setViewInvoice(res.data.data);
    } catch {
      showToast('Gagal memuat detail invoice', 'error');
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const res = await businessRulesApi.get(isAdminCabang ? { branch_id: user?.branch_id } : {});
      if (res.data?.data?.currency_rates) {
        const cr = res.data.data.currency_rates;
        setCurrencyRates(typeof cr === 'string' ? JSON.parse(cr) : cr);
      }
    } catch {}
  };

  const fetchInvoicePdf = useCallback(async (invoiceId: string) => {
    setLoadingPdf(true);
    setInvoicePdfUrl(null);
    try {
      const res = await invoicesApi.getPdf(invoiceId);
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      setInvoicePdfUrl(url);
    } catch {
      showToast('Gagal memuat PDF invoice', 'error');
    } finally {
      setLoadingPdf(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBranches();
    fetchCurrencyRates();
  }, [isAdminPusat, isAccounting]);

  useEffect(() => {
    fetchOwners();
  }, [isAdminPusat, isAdminCabang, isAccounting, branchId, user?.branch_id]);

  useEffect(() => {
    setPage(1);
  }, [branchId, wilayahId, provinsiId, limit, filterStatus, filterOrderStatus, filterOwnerId, filterInvoiceNumber, filterOrderNumber, filterDateFrom, filterDateTo, filterDueStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchInvoices();
  }, [branchId, wilayahId, provinsiId, isAdminPusat, isAccounting, page, limit, filterStatus, filterOrderStatus, filterOwnerId, filterInvoiceNumber, filterOrderNumber, filterDateFrom, filterDateTo, filterDueStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchSummary();
  }, [branchId, wilayahId, provinsiId, filterStatus, filterOrderStatus, filterOwnerId, filterInvoiceNumber, filterOrderNumber, filterDateFrom, filterDateTo, filterDueStatus]);

  const summaryFromTable = (() => {
    if (invoices.length === 0) return null;
    const total_amount = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
    const total_paid = invoices.reduce((s, i) => s + parseFloat(i.paid_amount || 0), 0);
    const total_remaining = invoices.reduce((s, i) => s + parseFloat(i.remaining_amount || 0), 0);
    const orderIds = Array.from(new Set(invoices.map((i) => i.order_id).filter(Boolean)));
    const by_invoice_status = invoices.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const by_order_status = invoices.reduce((acc, i) => {
      const st = i.Order?.status;
      if (st) acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total_invoices: invoices.length,
      total_orders: orderIds.length,
      total_amount,
      total_paid,
      total_remaining,
      by_invoice_status,
      by_order_status
    };
  })();

  useEffect(() => {
    if (viewInvoice && detailTab === 'invoice') {
      fetchInvoicePdf(viewInvoice.id);
    }
  }, [viewInvoice?.id, detailTab, fetchInvoicePdf]);

  const closeModal = useCallback(() => {
    if (invoicePdfUrl) {
      URL.revokeObjectURL(invoicePdfUrl);
      setInvoicePdfUrl(null);
    }
    setViewInvoice(null);
  }, [invoicePdfUrl]);

  const handleVerifyPayment = async (invoiceId: string, paymentProofId: string, verified: boolean) => {
    setVerifyingId(paymentProofId);
    try {
      const res = await invoicesApi.verifyPayment(invoiceId, { payment_proof_id: paymentProofId, verified });
      showToast(verified ? 'Pembayaran dikonfirmasi' : 'Pembayaran ditolak', 'success');
      if (res.data?.success && res.data?.data) {
        const updated = res.data.data;
        setViewInvoice(updated);
        setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: updated.status, paid_amount: updated.paid_amount, remaining_amount: updated.remaining_amount, PaymentProofs: updated.PaymentProofs || inv.PaymentProofs } : inv)));
      }
      fetchInvoices();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleUnblock = async (inv: any) => {
    try {
      const res = await invoicesApi.unblock(inv.id);
      showToast('Invoice diaktifkan kembali', 'success');
      const updated = res.data?.data;
      closeModal();
      if (updated) {
        const merged = { ...inv, is_blocked: false, unblocked_at: updated.unblocked_at, auto_cancel_at: updated.auto_cancel_at, Order: updated.Order ? { ...inv.Order, ...updated.Order, status: 'tentative' } : { ...inv.Order, status: 'tentative' } };
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? merged : i)));
      }
      fetchInvoices();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal unblock', 'error');
    }
  };

  const openPdf = async (invoiceId: string) => {
    setMenuOpenId(null);
    setMenuPosition(null);
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

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      paid: 'success', partial_paid: 'warning', tentative: 'default', draft: 'info', confirmed: 'info',
      processing: 'info', completed: 'success', overdue: 'error', canceled: 'error', cancelled: 'error',
      refunded: 'default', order_updated: 'warning', overpaid: 'warning', overpaid_transferred: 'info',
      overpaid_received: 'info', refund_canceled: 'error', overpaid_refund_pending: 'warning'
    };
    return (map[status] || 'default') as 'success' | 'warning' | 'info' | 'error' | 'default';
  };

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

  const canUnblock = (inv: any) =>
    inv?.is_blocked && ['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin', 'role_accounting'].includes(user?.role || '');

  const canVerify = ['admin_pusat', 'admin_cabang', 'role_accounting', 'super_admin'].includes(user?.role || '');

  const rates = viewInvoice?.currency_rates || currencyRates;
  const sarToIdr = rates.SAR_TO_IDR || 4200;
  const usdToIdr = rates.USD_TO_IDR || 15500;

  const paymentProofs = viewInvoice?.PaymentProofs || [];

  /** Status bukti bayar: rejected > verified > pending. Pastikan rejected tampil benar. */
  const getProofStatus = (p: any) => {
    if (p.verified_status === 'rejected') return { status: 'rejected', label: 'Tidak valid', variant: 'error' as const };
    if (p.verified_status === 'verified' || (p.verified_at && p.verified_status !== 'rejected')) return { status: 'verified', label: 'Diverifikasi', variant: 'success' as const };
    return { status: 'pending', label: 'Menunggu verifikasi', variant: 'warning' as const };
  };

  const getProofTypeLabel = (type: string) => (type === 'dp' ? 'DP' : type === 'partial' ? 'Cicilan' : 'Lunas');

  const resetFilters = () => {
    setBranchId('');
    setWilayahId('');
    setProvinsiId('');
    setFilterStatus('');
    setFilterOrderStatus('');
    setFilterOwnerId('');
    setFilterInvoiceNumber('');
    setFilterOrderNumber('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterDueStatus('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = branchId || wilayahId || provinsiId || filterStatus || filterOrderStatus || filterOwnerId || filterInvoiceNumber.trim() || filterOrderNumber.trim() || filterDateFrom || filterDateTo || filterDueStatus || sortBy !== 'created_at' || sortOrder !== 'desc';

  const s = summary || summaryFromTable || {
    total_invoices: pagination?.total ?? 0,
    total_orders: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
    by_invoice_status: {},
    by_order_status: {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order & Invoice</h1>
          <p className="text-slate-600 mt-1">
            {(isAdminPusat || isAccounting) ? 'Daftar order dan invoice. Filter lengkap, konfirmasi pembayaran.' : 'Daftar order dan invoice cabang Anda.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">aktif</span>}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
          )}
        </div>
      </div>

      {/* Statistik Total - Card per metrik */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card hover className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Invoice</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{loadingSummary ? '...' : s.total_invoices.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card hover className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Order</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{loadingSummary ? '...' : s.total_orders.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card hover className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Tagihan</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{loadingSummary ? '...' : formatIDR(s.total_amount)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card hover className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Dibayar</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{loadingSummary ? '...' : formatIDR(s.total_paid)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card hover className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Sisa</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{loadingSummary ? '...' : formatIDR(s.total_remaining)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Per Status Invoice & Per Status Order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Per Status Invoice
          </h3>
          {loadingSummary ? (
            <p className="text-slate-500 text-sm">Memuat...</p>
          ) : Object.keys(s.by_invoice_status).length === 0 ? (
            <p className="text-slate-500 text-sm">Tidak ada data</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(s.by_invoice_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[120px]">
                  <Badge variant={getStatusBadge(status)}>{INVOICE_STATUS_LABELS[status] || status}</Badge>
                  <span className="font-bold text-slate-900">{Number(count).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Per Status Order
          </h3>
          {loadingSummary ? (
            <p className="text-slate-500 text-sm">Memuat...</p>
          ) : Object.keys(s.by_order_status).length === 0 ? (
            <p className="text-slate-500 text-sm">Tidak ada data</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(s.by_order_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 min-w-[120px]">
                  <Badge variant={getStatusBadge(status)}>{ORDER_STATUS_LABELS[status] || status}</Badge>
                  <span className="font-bold text-slate-900">{Number(count).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showFilters && (
        <Card className="bg-slate-50/80">
          <DashboardFilterBar
            variant="page"
            loading={loading}
            showWilayah={isAdminPusat || isAccounting}
            showProvinsi={isAdminPusat || isAccounting}
            showBranch={isAdminPusat || isAccounting}
            showStatus
            statusType="invoice"
            showOrderStatus
            showOwner
            showSearch
            showSearch2
            searchPlaceholder="No. Order..."
            search2Placeholder="No. Invoice..."
            showDateRange
            showDueStatus
            showReset
            wilayahId={wilayahId}
            provinsiId={provinsiId}
            branchId={branchId}
            status={filterStatus}
            orderStatus={filterOrderStatus}
            ownerId={filterOwnerId}
            dateFrom={filterDateFrom}
            dateTo={filterDateTo}
            search={filterOrderNumber}
            search2={filterInvoiceNumber}
            dueStatus={filterDueStatus}
            onWilayahChange={setWilayahId}
            onProvinsiChange={setProvinsiId}
            onBranchChange={setBranchId}
            onStatusChange={setFilterStatus}
            onOrderStatusChange={setFilterOrderStatus}
            onOwnerChange={setFilterOwnerId}
            onDateFromChange={setFilterDateFrom}
            onDateToChange={setFilterDateTo}
            onSearchChange={setFilterOrderNumber}
            onSearch2Change={setFilterInvoiceNumber}
            onDueStatusChange={setFilterDueStatus}
            onApply={() => { setPage(1); fetchInvoices(); }}
            onReset={resetFilters}
            wilayahList={wilayahList}
            provinces={provinces}
            branches={branches}
            invoiceStatusOptions={[{ value: '', label: 'Semua status' }, ...Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            orderStatusOptions={ORDER_STATUS_LABELS}
            owners={owners.map((o) => ({ id: o.User?.id || (o as any).user_id || o.id, User: o.User }))}
            dueStatusOptions={[
              { value: '', label: 'Semua' },
              { value: 'current', label: 'Belum Jatuh Tempo' },
              { value: 'due', label: 'Jatuh Tempo' },
              { value: 'overdue', label: 'Terlambat' },
            ]}
          />
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Urutkan</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="created_at">Tanggal dibuat</option>
                <option value="invoice_number">Nomor invoice</option>
                <option value="total_amount">Total</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Arah</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="desc">Terbaru dulu</option>
                <option value="asc">Terlama dulu</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">Memuat...</div>
      ) : (
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Order & Invoice ({pagination?.total ?? invoices.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4">Invoice #</th>
                  <th className="pb-2 pr-4">Order #</th>
                  <th className="pb-2 pr-4">Owner</th>
                  <th className="pb-2 pr-4">Cabang</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  <th className="pb-2 pr-4 text-right">Dibayar</th>
                  <th className="pb-2 pr-4 text-right">Sisa</th>
                  <th className="pb-2 pr-4">Status Order</th>
                  <th className="pb-2 pr-4">Status Invoice</th>
                  <th className="pb-2 pr-4">Bukti Bayar</th>
                  <th className="pb-2 pr-4">Tgl Invoice</th>
                  <th className="pb-2 pr-4">Tgl Update</th>
                  <th className="pb-2 w-12">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-mono font-semibold">{inv.invoice_number}</td>
                    <td className="py-3 pr-4 font-mono">{inv.Order?.order_number || '-'}</td>
                    <td className="py-3 pr-4">{inv.User?.name || inv.User?.company_name || '-'}</td>
                    <td className="py-3 pr-4">{inv.Branch?.name || inv.Branch?.code || '-'}</td>
                    <td className="py-3 pr-4 text-right font-medium">{formatIDR(parseFloat(inv.total_amount || 0))}</td>
                    <td className="py-3 pr-4 text-right text-emerald-600 font-medium">{formatIDR(parseFloat(inv.paid_amount || 0))}</td>
                    <td className="py-3 pr-4 text-right text-red-600 font-medium">{formatIDR(parseFloat(inv.remaining_amount || 0))}</td>
                    <td className="py-3 pr-4"><Badge variant={getStatusBadge(inv.Order?.status)}>{ORDER_STATUS_LABELS[inv.Order?.status] || inv.Order?.status || '-'}</Badge></td>
                    <td className="py-3 pr-4">
                      <Badge variant={getStatusBadge(inv.status)}>{INVOICE_STATUS_LABELS[inv.status] || inv.status}</Badge>
                      {inv.is_blocked && <Badge variant="error" className="ml-1">Block</Badge>}
                    </td>
                    <td className="py-3 pr-4">
                      {(inv.PaymentProofs?.length ?? 0) === 0 ? (
                        <span className="text-slate-400 text-xs">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {inv.PaymentProofs?.map((p: any) => {
                            const ps = getProofStatus(p);
                            return (
                              <Badge key={p.id} variant={ps.variant} className="text-xs">
                                {getProofTypeLabel(p.payment_type)} {ps.status === 'verified' ? '✓' : ps.status === 'rejected' ? '✗' : '...'}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">{formatDate(inv.issued_at || inv.created_at)}</td>
                    <td className="py-3 pr-4">{formatDate(inv.updated_at)}</td>
                    <td className="py-3 relative">
                      <div className="flex items-center justify-center">
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setMenuOpenId(menuOpenId === inv.id ? null : inv.id);
                            setMenuPosition(menuOpenId === inv.id ? null : { top: rect.bottom + 4, left: rect.right - 160 });
                          }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {menuOpenId === inv.id && menuPosition && createPortal(
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => { setMenuOpenId(null); setMenuPosition(null); }} aria-hidden="true" />
                            <div
                              className="fixed z-[9999] py-1 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[160px]"
                              style={{ top: menuPosition.top, left: menuPosition.left }}
                            >
                              <button
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 rounded-t-lg"
                                onClick={() => { setViewInvoice(inv); setDetailTab('invoice'); setMenuOpenId(null); setMenuPosition(null); fetchInvoiceDetail(inv.id); }}
                              >
                                <Eye className="w-4 h-4" /> Lihat Invoice
                              </button>
                              <button
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 rounded-b-lg"
                                onClick={() => openPdf(inv.id)}
                              >
                                <FileText className="w-4 h-4" /> Unduh PDF
                              </button>
                            </div>
                          </>,
                          document.body
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && <p className="text-slate-500 py-6 text-center">Belum ada invoice</p>}
          {pagination && pagination.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Menampilkan {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
                </span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 border border-slate-200 rounded text-slate-700 bg-white text-sm"
                >
                  {[25, 50, 100, 200, 500].map((n) => (
                    <option key={n} value={n}>{n} per halaman</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1} className="p-2 rounded border border-slate-200 bg-white disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded border border-slate-200 bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modal Detail Invoice - Layout baru dengan tab */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detail Invoice</h2>
                  <p className="text-sm text-slate-600 font-mono">{viewInvoice.invoice_number} · {viewInvoice.Order?.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openPdf(viewInvoice.id)}>
                  <Download className="w-4 h-4 mr-2" /> Unduh PDF
                </Button>
                {canUnblock(viewInvoice) && (
                  <Button variant="secondary" size="sm" onClick={() => handleUnblock(viewInvoice)}>
                    <Unlock className="w-4 h-4 mr-2" /> Aktifkan Kembali
                  </Button>
                )}
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
              <button
                onClick={() => setDetailTab('invoice')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors -mb-px ${
                  detailTab === 'invoice'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Invoice & Order
              </button>
              <button
                onClick={() => setDetailTab('payments')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors -mb-px ${
                  detailTab === 'payments'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Bukti Bayar
                {paymentProofs.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">{paymentProofs.length}</span>
                )}
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'invoice' && (
                <div className="space-y-6">
                  {/* Ringkasan info - grid rapi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Order</h4>
                      <dl className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><dt className="text-slate-600">No. Order</dt><dd className="font-semibold">{viewInvoice.Order?.order_number}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Owner</dt><dd className="font-semibold">{viewInvoice.User?.name || viewInvoice.User?.company_name}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Cabang</dt><dd className="font-semibold">{viewInvoice.Branch?.name || viewInvoice.Branch?.code}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Status</dt><dd><Badge variant={getStatusBadge(viewInvoice.Order?.status)}>{ORDER_STATUS_LABELS[viewInvoice.Order?.status] || viewInvoice.Order?.status}</Badge></dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Mata Uang</dt><dd className="font-semibold">{viewInvoice.Order?.currency || 'IDR'}</dd></div>
                      </dl>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Invoice</h4>
                      <dl className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><dt className="text-slate-600">Status</dt><dd><Badge variant={getStatusBadge(viewInvoice.status)}>{INVOICE_STATUS_LABELS[viewInvoice.status] || viewInvoice.status}</Badge>{viewInvoice.is_blocked && <Badge variant="error" className="ml-1">Block</Badge>}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Total</dt><dd className="font-semibold">{formatIDR(parseFloat(viewInvoice.total_amount))}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">DP ({viewInvoice.dp_percentage}%)</dt><dd className="font-semibold">{formatIDR(parseFloat(viewInvoice.dp_amount))}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Dibayar</dt><dd className="font-semibold text-emerald-600">{formatIDR(parseFloat(viewInvoice.paid_amount || 0))}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Sisa</dt><dd className="font-semibold text-red-600">{formatIDR(parseFloat(viewInvoice.remaining_amount))}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Tgl Invoice</dt><dd>{formatDate(viewInvoice.issued_at || viewInvoice.created_at)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-600">Jatuh Tempo DP</dt><dd>{formatDate(viewInvoice.due_date_dp)}</dd></div>
                      </dl>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Kurs (untuk pembayaran)</h4>
                      <dl className="space-y-1.5 text-sm text-slate-700">
                        <div>1 SAR = {formatIDR(sarToIdr)} IDR</div>
                        <div>1 USD = {formatIDR(usdToIdr)} IDR</div>
                        {(viewInvoice.Order?.currency === 'SAR' || viewInvoice.Order?.currency === 'USD') && (
                          <div className="pt-2 mt-2 border-t border-emerald-200 font-semibold">
                            Total: {viewInvoice.Order?.currency === 'SAR' && `${(parseFloat(viewInvoice.total_amount || 0) / sarToIdr).toFixed(2)} SAR`}
                            {viewInvoice.Order?.currency === 'USD' && `${(parseFloat(viewInvoice.total_amount || 0) / usdToIdr).toFixed(2)} USD`} = {formatIDR(parseFloat(viewInvoice.total_amount || 0))} IDR
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Preview PDF */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> Preview Invoice PDF
                      </span>
                      <Button size="sm" variant="outline" onClick={() => openPdf(viewInvoice.id)}>
                        <ExternalLink className="w-4 h-4 mr-1" /> Buka di tab baru
                      </Button>
                    </div>
                    <div className="h-[400px] min-h-[300px]">
                      {loadingPdf && (
                        <div className="flex items-center justify-center h-full text-slate-500">
                          <div className="animate-pulse">Memuat PDF...</div>
                        </div>
                      )}
                      {!loadingPdf && invoicePdfUrl && (
                        <iframe src={invoicePdfUrl} title="Invoice PDF" className="w-full h-full border-0" />
                      )}
                      {!loadingPdf && !invoicePdfUrl && (
                        <div className="flex items-center justify-center h-full text-slate-500">PDF tidak tersedia</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'payments' && (
                <div className="space-y-6">
                  {paymentProofs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                      <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">Belum ada bukti pembayaran</p>
                      <p className="text-sm text-slate-500 mt-1">Owner akan mengupload bukti bayar untuk DP atau pelunasan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentProofs.map((p: any) => {
                        const fileUrl = getFileUrl(p.proof_file_url);
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(p.proof_file_url || '');
                        const ps = getProofStatus(p);
                        const isPending = ps.status === 'pending';
                        return (
                          <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-800 capitalize">{getProofTypeLabel(p.payment_type)}</span>
                                <span className="text-emerald-600 font-semibold">{formatIDR(parseFloat(p.amount))}</span>
                                <Badge variant={ps.variant}>{ps.label}</Badge>
                                {p.bank_name && <span className="text-sm text-slate-600">{p.bank_name}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {fileUrl && (
                                  <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                                    <Download className="w-4 h-4" /> Unduh
                                  </a>
                                )}
                                {isPending && canVerify && (
                                  <>
                                    <Button size="sm" onClick={() => handleVerifyPayment(viewInvoice.id, p.id, true)} disabled={verifyingId === p.id}>
                                      <Check className="w-4 h-4 mr-1" /> Konfirmasi
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleVerifyPayment(viewInvoice.id, p.id, false)} disabled={verifyingId === p.id}>
                                      Tolak
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-4 bg-slate-50 min-h-[280px]">
                              {!fileUrl || p.proof_file_url === 'issued-saudi' ? (
                                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                                  Pembayaran via Saudi (issued by role invoice)
                                </div>
                              ) : isImage ? (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                  <img src={fileUrl} alt="Bukti bayar" className="max-w-full max-h-72 object-contain rounded-lg border border-slate-200" />
                                </a>
                              ) : (
                                <iframe src={fileUrl} title={`Bukti bayar ${p.payment_type}`} className="w-full h-72 border border-slate-200 rounded-lg bg-white" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50">
              <Button variant="outline" onClick={closeModal}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersInvoicesPage;
