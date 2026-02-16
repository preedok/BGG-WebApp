import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, XCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { productsApi } from '../../../services/api';

const INCLUDE_OPTIONS = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'makan', label: 'Makan' },
  { id: 'visa', label: 'Visa' },
  { id: 'tiket', label: 'Tiket' },
  { id: 'bis', label: 'Bis' },
  { id: 'handling', label: 'Handling' }
] as const;

/** Produk paket dari API (products is_package=true) */
interface PackageProduct {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  meta?: { includes?: string[]; discount_percent?: number; days?: number } | null;
  is_active: boolean;
  is_package?: boolean;
  price_general?: number | null;
  price_branch?: number | null;
  currency?: string;
}

type FormState = {
  name: string;
  price: number;
  days: number;
  discountPercent: number;
  includes: string[];
};

const emptyForm: FormState = { name: '', price: 0, days: 1, discountPercent: 0, includes: [] };

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

  const canCreatePackage = user?.role === 'super_admin' || user?.role === 'admin_pusat';

  const fetchPackages = () => {
    setLoading(true);
    setError(null);
    productsApi
      .list({ is_package: 'true', with_prices: 'true', include_inactive: 'true' })
      .then((res) => res.data?.data && setPackages(res.data.data as PackageProduct[]))
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat data paket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const stats = [
    { label: 'Total Paket', value: packages.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aktif', value: packages.filter((p) => p.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Dengan Harga', value: packages.filter((p) => (p.price_general ?? p.price_branch) != null).length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Nama Paket', align: 'left' },
    { id: 'days', label: 'Lama (hari)', align: 'center' },
    { id: 'price', label: 'Harga', align: 'right' },
    { id: 'discount', label: 'Diskon (%)', align: 'center' },
    { id: 'priceAfter', label: 'Harga setelah diskon', align: 'right' },
    { id: 'includes', label: 'Include', align: 'left' },
    { id: 'actions', label: 'Aksi', align: 'center' }
  ];

  const formatPrice = (amount: number | null | undefined) => {
    if (amount != null && amount > 0) return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    return '-';
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
    const meta = pkg.meta as { includes?: string[]; discount_percent?: number; days?: number } | undefined;
    const days = Number(meta?.days ?? 1);
    setForm({
      name: pkg.name,
      price: Number(pkg.price_branch ?? pkg.price_general ?? 0),
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
        const general = prices.find((p: { branch_id: string | null; owner_id: string | null }) => !p.branch_id && !p.owner_id);
        if (general) {
          await productsApi.updatePrice(general.id, { amount: form.price });
        } else if (form.price > 0) {
          await productsApi.createPrice({
            product_id: editingPackage.id,
            branch_id: null,
            owner_id: null,
            currency: 'IDR',
            amount: form.price
          });
        }
        showToast('Paket berhasil diubah', 'success');
      } else {
        const code = `PKG-${Date.now()}`;
        const createRes = await productsApi.create({
          type: 'package',
          code,
          name: form.name.trim(),
          description: form.includes.length ? `Include: ${form.includes.join(', ')}. ${form.days} hari.` : `${form.days} hari.`,
          is_package: true,
          meta
        });
        const productId = (createRes.data as { data?: { id: string } })?.data?.id;
        if (!productId) throw new Error('Product id tidak ditemukan');
        if (form.price > 0) {
          await productsApi.createPrice({
            product_id: productId,
            branch_id: null,
            owner_id: null,
            currency: 'IDR',
            amount: form.price
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
    if (!window.confirm(`Hapus paket "${pkg.name}"? Paket akan dinonaktifkan dan tidak tampil di daftar.`)) return;
    try {
      await productsApi.delete(pkg.id);
      showToast('Paket berhasil dihapus', 'success');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Paket</h1>
          <p className="text-slate-600 mt-1">Harga paket untuk total hari (contoh: Paket Ramadhan 9 hari = harga untuk 9 hari)</p>
        </div>
        {canCreatePackage && (
          <Button variant="primary" onClick={openAdd}>
            <Plus className="w-5 h-5 mr-2" />
            Buat paket baru
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Package className="w-5 h-5" />
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
        <Table
          columns={tableColumns}
          data={packages}
          renderRow={(pkg: PackageProduct) => {
            const basePrice = Number(pkg.price_branch ?? pkg.price_general ?? 0);
            const meta = pkg.meta as { discount_percent?: number; days?: number } | undefined;
            const discountPercent = Number(meta?.discount_percent ?? 0);
            const priceAfter = getPriceAfterDiscount(basePrice, discountPercent);
            const days = Number(meta?.days ?? 1);
            return (
              <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{pkg.name}</td>
                <td className="px-6 py-4 text-center text-slate-700">{days} hari</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {formatPrice(basePrice)}
                </td>
                <td className="px-6 py-4 text-center">
                  {discountPercent > 0 ? <span className="text-amber-600 font-medium">{discountPercent}%</span> : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  {discountPercent > 0 ? (
                    <span className="text-emerald-600 font-medium">{formatPrice(priceAfter)}</span>
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
                  <div className="flex items-center justify-center gap-2">
                    {canCreatePackage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(pkg)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Update"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
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
                  Harga (IDR) – total untuk {(() => { const v = parseInt(daysInput.trim(), 10); return (Number.isNaN(v) || v < 1) ? 1 : v; })()} hari
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Contoh: 28000000"
                />
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
                      <span className="text-slate-600">Harga setelah diskon: </span>
                      <span className="font-semibold text-emerald-600">
                        {formatPrice(getPriceAfterDiscount(form.price, form.discountPercent))}
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
