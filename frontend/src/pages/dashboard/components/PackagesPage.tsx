import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, XCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import ActionsMenu from '../../../components/common/ActionsMenu';
import type { ActionsMenuItem } from '../../../components/common/ActionsMenu';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { productsApi, businessRulesApi } from '../../../services/api';
import { fillFromSource, getRatesFromRates } from '../../../utils/currencyConversion';

const INCLUDE_OPTIONS = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'makan', label: 'Makan' },
  { id: 'visa', label: 'Visa' },
  { id: 'tiket', label: 'Tiket' },
  { id: 'bis', label: 'Bis' },
  { id: 'handling', label: 'Handling' }
] as const;

const CURRENCIES = [
  { id: 'IDR', label: 'Rupiah (IDR)', symbol: 'Rp', locale: 'id-ID' },
  { id: 'SAR', label: 'Riyal Saudi (SAR)', symbol: 'SAR', locale: 'en-US' },
  { id: 'USD', label: 'US Dollar (USD)', symbol: '$', locale: 'en-US' }
] as const;

/** Produk paket dari API (products is_package=true) */
interface PackageProduct {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  meta?: { includes?: string[]; discount_percent?: number; days?: number; currency?: string } | null;
  is_active: boolean;
  is_package?: boolean;
  price_general?: number | null;
  price_branch?: number | null;
  price_general_idr?: number | null;
  price_general_sar?: number | null;
  price_general_usd?: number | null;
  currency?: string;
}

type FormState = {
  name: string;
  /** Mata uang yang dipilih untuk input; hanya field ini yang bisa diisi */
  price_currency: 'IDR' | 'SAR' | 'USD';
  /** Nilai harga dalam price_currency; konversi IDR/SAR/USD otomatis (read-only) */
  price_value: number;
  days: number;
  discountPercent: number;
  includes: string[];
};

const emptyForm: FormState = { name: '', price_currency: 'IDR', price_value: 0, days: 1, discountPercent: 0, includes: [] };

const PackagesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [packages, setPackages] = useState<PackageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  /** Tampilan input Lama (hari) agar user bisa mengosongkan dan mengubah dari 1 */
  const [daysInput, setDaysInput] = useState('1');
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});

  const canCreatePackage = user?.role === 'super_admin' || user?.role === 'admin_pusat';

  useEffect(() => {
    businessRulesApi.get().then((res) => {
      const data = (res.data as { data?: { currency_rates?: unknown } })?.data;
      let cr = data?.currency_rates;
      if (typeof cr === 'string') {
        try { cr = JSON.parse(cr) as { SAR_TO_IDR?: number; USD_TO_IDR?: number }; } catch { cr = null; }
      }
      const rates = cr as { SAR_TO_IDR?: number; USD_TO_IDR?: number } | null;
      if (rates && typeof rates === 'object') setCurrencyRates({ SAR_TO_IDR: rates.SAR_TO_IDR ?? 4200, USD_TO_IDR: rates.USD_TO_IDR ?? 15500 });
    }).catch(() => {});
  }, []);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  const fetchPackages = () => {
    setLoading(true);
    setError(null);
    productsApi
      .list({ is_package: 'true', with_prices: 'true', include_inactive: 'false', limit, page, sort_by: sortBy, sort_order: sortOrder })
      .then((res) => {
        if (res.data?.data) setPackages(res.data.data as PackageProduct[]);
        const p = (res.data as { pagination?: { total: number; page: number; limit: number; totalPages: number } }).pagination;
        setPagination(p || (res.data?.data ? { total: (res.data.data as unknown[]).length, page: 1, limit: (res.data.data as unknown[]).length, totalPages: 1 } : null));
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Gagal memuat data paket');
        setPagination(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, [page, limit, sortBy, sortOrder]);

  const stats = [
    { label: 'Total Paket', value: pagination?.total ?? packages.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aktif', value: packages.filter((p) => p.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Dengan Harga', value: packages.filter((p) => (p.price_general ?? p.price_branch) != null).length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Nama Paket', align: 'left', sortable: true },
    { id: 'days', label: 'Lama (hari)', align: 'center' },
    { id: 'currency', label: 'Mata Uang', align: 'center' },
    { id: 'price', label: 'Harga', align: 'right' },
    { id: 'discount', label: 'Diskon (%)', align: 'center' },
    { id: 'priceAfter', label: 'Harga setelah diskon', align: 'right' },
    { id: 'includes', label: 'Include', align: 'left' },
    { id: 'actions', label: 'Aksi', align: 'center' }
  ];

  const formatPrice = (amount: number | null | undefined, currencyId?: string) => {
    if (amount == null || amount <= 0) return '-';
    const cur = CURRENCIES.find((c) => c.id === (currencyId || 'IDR')) || CURRENCIES[0];
    return `${cur.symbol} ${Number(amount).toLocaleString(cur.locale)}`;
  };

  const getPriceAfterDiscount = (basePrice: number, discountPercent: number) => {
    if (basePrice <= 0) return 0;
    return Math.round(basePrice * (1 - discountPercent / 100));
  };

  const toggleInclude = (id: string) => {
    setForm((f) => ({
      ...f,
      includes: f.includes.includes(id) ? f.includes.filter((x) => x !== id) : [...f.includes, id]
    }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setDaysInput('1');
    setEditingPackage(null);
    setShowModal(true);
  };

  const openEdit = (pkg: PackageProduct) => {
    setEditingPackage(pkg);
    const meta = pkg.meta as { includes?: string[]; discount_percent?: number; days?: number; currency?: string } | undefined;
    const days = Number(meta?.days ?? 1);
    const rates = getRatesFromRates(currencyRates);
    let price_idr = pkg.price_general_idr ?? 0;
    let price_sar = pkg.price_general_sar ?? 0;
    let price_usd = pkg.price_general_usd ?? 0;
    if (price_idr === 0 && price_sar === 0 && price_usd === 0) {
      const base = Number(pkg.price_branch ?? pkg.price_general ?? 0);
      const cur = (meta?.currency || pkg.currency || 'IDR') as 'IDR' | 'SAR' | 'USD';
      const triple = fillFromSource(cur, base, currencyRates);
      price_idr = triple.idr;
      price_sar = triple.sar;
      price_usd = triple.usd;
    }
    const curFirst = price_idr > 0 ? 'IDR' : price_sar > 0 ? 'SAR' : 'USD';
    const valFirst = curFirst === 'IDR' ? price_idr : curFirst === 'SAR' ? price_sar : price_usd;
    setForm({
      name: pkg.name,
      price_currency: curFirst,
      price_value: valFirst,
      days,
      discountPercent: Number(meta?.discount_percent ?? 0),
      includes: meta?.includes ?? []
    });
    setDaysInput(days >= 1 ? String(days) : '1');
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setEditingPackage(null);
      setForm(emptyForm);
      setDaysInput('1');
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Nama paket wajib', 'error');
      return;
    }
    const parsedDays = parseInt(daysInput.trim(), 10);
    const days = (Number.isNaN(parsedDays) || parsedDays < 1) ? 1 : parsedDays;
    const triplePrice = fillFromSource(form.price_currency, form.price_value || 0, currencyRates);
    const hasPrice = triplePrice.idr > 0 || triplePrice.sar > 0 || triplePrice.usd > 0;
    setSaving(true);
    try {
      const meta = {
        includes: form.includes,
        days,
        ...(editingPackage ? { discount_percent: form.discountPercent } : {})
      };
      if (editingPackage) {
        await productsApi.update(editingPackage.id, {
          name: form.name.trim(),
          meta
        });
        const pricesRes = await productsApi.listPrices({ product_id: editingPackage.id });
        const prices = (pricesRes.data as { data?: Array<{ id: string; branch_id: string | null; owner_id: string | null }> })?.data ?? [];
        const generalPrices = prices.filter((p: { branch_id: string | null; owner_id: string | null }) => !p.branch_id && !p.owner_id);
        for (const p of generalPrices) {
          await productsApi.deletePrice(p.id);
        }
        if (hasPrice) {
          await productsApi.createPrice({
            product_id: editingPackage.id,
            branch_id: null,
            owner_id: null,
            amount_idr: triplePrice.idr || undefined,
            amount_sar: triplePrice.sar || undefined,
            amount_usd: triplePrice.usd || undefined
          });
        }
        showToast('Paket berhasil diubah', 'success');
      } else {
        const code = `PKG-${Date.now()}`;
        const createRes = await productsApi.create({
          type: 'package',
          code,
          name: form.name.trim(),
          description: form.includes.length ? `Include: ${form.includes.join(', ')}. ${days} hari.` : `${days} hari.`,
          is_package: true,
          meta
        });
        const productId = (createRes.data as { data?: { id: string } })?.data?.id;
        if (!productId) throw new Error('Product id tidak ditemukan');
        if (hasPrice) {
          await productsApi.createPrice({
            product_id: productId,
            branch_id: null,
            owner_id: null,
            amount_idr: triplePrice.idr || undefined,
            amount_sar: triplePrice.sar || undefined,
            amount_usd: triplePrice.usd || undefined
          });
        }
        showToast('Paket berhasil dibuat', 'success');
      }
      closeModal();
      fetchPackages();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || (editingPackage ? 'Gagal mengubah paket' : 'Gagal membuat paket'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg: PackageProduct) => {
    if (!canCreatePackage) return;
    if (!window.confirm(`Hapus paket "${pkg.name}"? Data akan dihapus permanen dari database.`)) return;
    try {
      await productsApi.delete(pkg.id);
      showToast('Paket berhasil dihapus', 'success');
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      fetchPackages();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menghapus paket', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Memuat data paket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Paket</h2>
          <p className="text-slate-600 text-sm mt-0.5">Harga paket untuk total hari (contoh: Paket 9 hari = harga untuk 9 hari)</p>
        </div>
        {canCreatePackage && (
          <Button variant="primary" className="flex items-center gap-2 shrink-0" onClick={openAdd}>
            <Plus className="w-5 h-5" />
            Buat paket baru
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <Card key={i} padding="sm" className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shrink-0`}>
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Daftar paket</h3>
          <p className="text-sm text-slate-500 mt-0.5">{packages.length} paket</p>
        </div>
        <Table
          columns={tableColumns}
          data={packages}
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
          renderRow={(pkg: PackageProduct) => {
            const basePrice = Number(pkg.price_branch ?? pkg.price_general_idr ?? pkg.price_general_sar ?? pkg.price_general_usd ?? pkg.price_general ?? 0);
            const meta = pkg.meta as { discount_percent?: number; days?: number; currency?: string } | undefined;
            const discountPercent = Number(meta?.discount_percent ?? 0);
            const priceAfter = getPriceAfterDiscount(basePrice, discountPercent);
            const days = Number(meta?.days ?? 1);
            const hasMulti = (pkg.price_general_idr != null || pkg.price_general_sar != null || pkg.price_general_usd != null);
            return (
              <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{pkg.name}</td>
                <td className="px-6 py-4 text-center text-slate-700">{days} hari</td>
                <td className="px-6 py-4 text-center text-slate-700">
                  {hasMulti ? 'IDR / SAR / USD' : (meta?.currency || pkg.currency || 'IDR')}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {hasMulti ? (
                    <span className="text-xs block space-y-0.5">
                      {pkg.price_general_idr != null && pkg.price_general_idr > 0 && <span className="block">{formatPrice(pkg.price_general_idr, 'IDR')}</span>}
                      {pkg.price_general_sar != null && pkg.price_general_sar > 0 && <span className="block text-slate-600">{formatPrice(pkg.price_general_sar, 'SAR')}</span>}
                      {pkg.price_general_usd != null && pkg.price_general_usd > 0 && <span className="block text-slate-600">{formatPrice(pkg.price_general_usd, 'USD')}</span>}
                      {!pkg.price_general_idr && !pkg.price_general_sar && !pkg.price_general_usd && '-'}
                    </span>
                  ) : formatPrice(basePrice, meta?.currency || pkg.currency)}
                </td>
                <td className="px-6 py-4 text-center">
                  {discountPercent > 0 ? <span className="text-amber-600 font-medium">{discountPercent}%</span> : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  {discountPercent > 0 ? (
                    <span className="text-emerald-600 font-medium">{formatPrice(priceAfter, 'IDR')}</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {(pkg.meta?.includes as string[] | undefined)?.map((inc) => {
                      const opt = INCLUDE_OPTIONS.find((o) => o.id === inc);
                      return opt ? <span key={inc} className="text-sm text-slate-700">{opt.label}</span> : null;
                    })}
                    {(!pkg.meta?.includes || (pkg.meta.includes as string[]).length === 0) && (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {canCreatePackage && (
                      <ActionsMenu
                        align="right"
                        items={[
                          { id: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEdit(pkg) },
                          { id: 'delete', label: 'Hapus', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(pkg), danger: true },
                        ] as ActionsMenuItem[]}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingPackage ? 'Update paket' : 'Buat paket baru'}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Admin Pusat / Super Admin</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg" disabled={saving}>
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama paket *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Contoh: Paket Ramadhan 9 day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lama (hari) *</label>
                <p className="text-xs text-slate-500 mb-1">Harga di bawah adalah total untuk seluruh hari (bukan per hari)</p>
                <input
                  type="number"
                  min={1}
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  onBlur={() => {
                    const v = parseInt(daysInput.trim(), 10);
                    const norm = (Number.isNaN(v) || v < 1) ? 1 : v;
                    setForm((f) => ({ ...f, days: norm }));
                    setDaysInput(String(norm));
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Harga – total untuk {(() => { const v = parseInt(daysInput.trim(), 10); return (Number.isNaN(v) || v < 1) ? 1 : v; })()} hari
                </label>
                <p className="text-xs text-slate-500 mb-1">Pilih mata uang, lalu isi harga. Mata uang lain terisi otomatis (konversi).</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm text-slate-600">Input harga dalam:</span>
                  <select
                    value={form.price_currency}
                    onChange={(e) => {
                      const newCur = e.target.value as 'IDR' | 'SAR' | 'USD';
                      const triple = fillFromSource(form.price_currency, form.price_value || 0, currencyRates);
                      const newVal = newCur === 'IDR' ? triple.idr : newCur === 'SAR' ? triple.sar : triple.usd;
                      setForm((f) => ({ ...f, price_currency: newCur, price_value: newVal }));
                    }}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="SAR">SAR (Riyal Saudi)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                  {(['IDR', 'SAR', 'USD'] as const).map((curKey) => {
                    const triple = fillFromSource(form.price_currency, form.price_value || 0, currencyRates);
                    const val = curKey === 'IDR' ? triple.idr : curKey === 'SAR' ? triple.sar : triple.usd;
                    const isEditable = form.price_currency === curKey;
                    return (
                      <div key={curKey}>
                        <label className="block text-xs text-slate-500 mb-0.5">
                          {curKey} {curKey === 'IDR' ? '(Rupiah)' : curKey === 'SAR' ? '(Riyal Saudi)' : '(US Dollar)'}
                          {!isEditable && ' (konversi otomatis)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={curKey === 'IDR' ? 1 : 0.01}
                          value={val || ''}
                          readOnly={!isEditable}
                          onChange={isEditable ? (e) => setForm((f) => ({ ...f, price_value: parseFloat(e.target.value) || 0 })) : undefined}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 ${isEditable ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`}
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {editingPackage && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.discountPercent || ''}
                      onChange={(e) => setForm((f) => ({ ...f, discountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  {form.discountPercent > 0 && (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      <span className="text-slate-600">Harga setelah diskon (IDR): </span>
                      <span className="font-semibold text-emerald-600">
                        {formatPrice(getPriceAfterDiscount(fillFromSource(form.price_currency, form.price_value || 0, currencyRates).idr, form.discountPercent), 'IDR')}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Include – pilih yang termasuk (klik untuk pilih)</label>
                <div className="flex flex-wrap gap-2">
                  {INCLUDE_OPTIONS.map((opt) => {
                    const selected = form.includes.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInclude(opt.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={closeModal} disabled={saving}>Batal</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Menyimpan...' : editingPackage ? 'Simpan perubahan' : 'Simpan paket'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
