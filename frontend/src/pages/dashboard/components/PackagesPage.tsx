import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { productsApi } from '../../../services/api';

/** Produk paket dari API (products is_package=true) */
interface PackageProduct {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  meta?: Record<string, unknown> | null;
  is_active: boolean;
  is_package?: boolean;
  price_general?: number | null;
  price_branch?: number | null;
  currency?: string;
}

const PackagesPage: React.FC = () => {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<PackageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list({ is_package: 'true', with_prices: 'true' })
      .then((res) => {
        if (!cancelled && res.data?.data) setPackages(res.data.data as PackageProduct[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Gagal memuat data paket');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: 'Total Paket', value: packages.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aktif', value: packages.filter((p: PackageProduct) => p.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Dengan Harga', value: packages.filter((p: PackageProduct) => (p.price_general ?? p.price_branch) != null).length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'code', label: 'Kode', align: 'left' },
    { id: 'name', label: 'Nama Paket', align: 'left' },
    { id: 'price', label: 'Harga', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Aksi', align: 'center' }
  ];

  const formatPrice = (p: PackageProduct) => {
    const amount = p.price_branch ?? p.price_general ?? 0;
    const cur = p.currency || 'IDR';
    if (amount) return `${Number(amount).toLocaleString('id-ID')} ${cur}`;
    return '-';
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
          <p className="text-slate-600 mt-1">Produk paket umroh dari database – kelola via Admin Pusat / Super Admin</p>
        </div>
        <Button variant="primary" onClick={() => showToast('Buat paket baru – Admin Pusat / Super Admin', 'info')}>
          <Plus className="w-5 h-5 mr-2" />Buat Paket
        </Button>
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
          renderRow={(pkg: PackageProduct) => (
            <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono text-sm">
                  {pkg.code}
                </code>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900">{pkg.name}</td>
              <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                {formatPrice(pkg)}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={pkg.is_active ? 'success' : 'error'}>
                  {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => showToast(`Detail: ${pkg.name}`, 'info')} title="Lihat"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={() => showToast(`Edit: ${pkg.name}`, 'info')} title="Edit"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => showToast('Hapus paket – Super Admin', 'info')} title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default PackagesPage;
