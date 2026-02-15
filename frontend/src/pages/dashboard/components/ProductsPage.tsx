import React, { useState, useEffect } from 'react';
import { Package, DollarSign, RefreshCw, Plus } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';
import { productsApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const typeLabels: Record<string, string> = {
  hotel: 'Hotel',
  visa: 'Visa',
  ticket: 'Tiket',
  bus: 'Bus',
  handling: 'Handling',
  package: 'Paket'
};

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { with_prices: 'true' };
      if (user?.branch_id) params.branch_id = user.branch_id;
      if (user?.role === 'owner') params.owner_id = user.id;
      if (filterType) params.type = filterType;
      const res = await productsApi.list(params);
      if (res.data.success) setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterType, user?.branch_id, user?.id]);

  const filtered = filterType ? products.filter(p => p.type === filterType) : products;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produk & Harga</h1>
          <p className="text-slate-600 mt-1">
            Informasi harga: general (pusat), perubahan cabang, dan harga khusus owner.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Semua tipe</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada produk. Admin pusat dapat menambah master produk.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">Kode</th>
                  <th className="text-left py-3 px-4">Nama</th>
                  <th className="text-left py-3 px-4">Tipe</th>
                  <th className="text-right py-3 px-4">Harga General (Pusat)</th>
                  <th className="text-right py-3 px-4">Harga Cabang</th>
                  {(user?.role === 'owner' || user?.role === 'role_invoice') && (
                    <th className="text-right py-3 px-4">Harga Khusus</th>
                  )}
                  <th className="text-left py-3 px-4">Mata Uang</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{p.code}</td>
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4">{typeLabels[p.type] || p.type}</td>
                    <td className="py-3 px-4 text-right">{p.price_general != null ? formatIDR(p.price_general) : '-'}</td>
                    <td className="py-3 px-4 text-right">{p.price_branch != null ? formatIDR(p.price_branch) : '-'}</td>
                    {(user?.role === 'owner' || user?.role === 'role_invoice') && (
                      <td className="py-3 px-4 text-right">{p.price_special != null ? formatIDR(p.price_special) : '-'}</td>
                    )}
                    <td className="py-3 px-4">{p.currency || 'IDR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductsPage;
