import React, { useState, useEffect } from 'react';
import {
  Hotel as HotelIcon,
  Plus,
  Search,
  MapPin,
  Bed,
  Edit,
  Trash2,
  Eye,
  XCircle,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import HotelWorkPage from './HotelWorkPage';
import { productsApi, adminPusatApi, businessRulesApi } from '../../../services/api';

const ROOM_TYPES = ['single', 'double', 'triple', 'quad', 'quint'] as const;
const DEFAULT_ROOM = { quantity: 0, price: 0 };

/** Product hotel dari API (products type=hotel dengan harga) */
export interface HotelProduct {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  meta?: { room_types?: string[]; location?: string } | null;
  is_active: boolean;
  price_general?: number | null;
  price_branch?: number | null;
  price_special?: number | null;
  currency?: string;
  special_prices_count?: number;
}

const HotelsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<HotelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'makkah' | 'madinah'>('all');
  const [selectedHotel, setSelectedHotel] = useState<HotelProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    location: 'makkah' as 'makkah' | 'madinah',
    meal_price: 0,
    rooms: { single: { ...DEFAULT_ROOM }, double: { ...DEFAULT_ROOM }, triple: { ...DEFAULT_ROOM }, quad: { ...DEFAULT_ROOM }, quint: { ...DEFAULT_ROOM } }
  });
  const [handlingConfigOpen, setHandlingConfigOpen] = useState(false);
  const [handlingPrice, setHandlingPrice] = useState(100);
  const [handlingConfigLoading, setHandlingConfigLoading] = useState(false);
  const [handlingConfigSaving, setHandlingConfigSaving] = useState(false);

  const canAddHotel = user?.role === 'super_admin' || user?.role === 'admin_pusat';

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    productsApi
      .list({ type: 'hotel', with_prices: 'true' })
      .then((res) => res.data?.data && setHotels(res.data.data as HotelProduct[]))
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat data hotel'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!canAddHotel) return;
    setHandlingConfigLoading(true);
    businessRulesApi.get()
      .then((res) => {
        const d = res.data?.data as { handling_default_sar?: number } | undefined;
        if (d != null && typeof d.handling_default_sar === 'number') setHandlingPrice(d.handling_default_sar);
        else if (d != null && d.handling_default_sar != null) setHandlingPrice(Number(d.handling_default_sar) || 100);
      })
      .catch(() => {})
      .finally(() => setHandlingConfigLoading(false));
  }, [canAddHotel]);

  const handleSaveHandling = async () => {
    if (!canAddHotel) return;
    setHandlingConfigSaving(true);
    try {
      await businessRulesApi.set({ rules: { handling_default_sar: handlingPrice } });
      showToast('Harga handling disimpan', 'success');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setHandlingConfigSaving(false);
    }
  };

  if (user?.role === 'role_hotel') {
    return <HotelWorkPage />;
  }

  const filteredHotels = hotels.filter((hotel: HotelProduct) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const loc = hotel.meta?.location?.toLowerCase();
    const matchesLocation =
      locationFilter === 'all' ||
      (loc && (loc === 'makkah' || loc === 'madinah') && loc === locationFilter);
    return matchesSearch && (locationFilter === 'all' || matchesLocation);
  });

  const stats = [
    {
      label: 'Total Hotels',
      value: hotels.length,
      icon: <HotelIcon className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Makkah',
      value: hotels.filter((h: HotelProduct) => h.meta?.location === 'makkah').length,
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Madinah',
      value: hotels.filter((h: HotelProduct) => h.meta?.location === 'madinah').length,
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Aktif',
      value: hotels.filter((h: HotelProduct) => h.is_active).length,
      icon: <Bed className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Nama Hotel', align: 'left' },
    { id: 'code', label: 'Kode', align: 'left' },
    { id: 'location', label: 'Lokasi', align: 'left' },
    { id: 'price', label: 'Harga', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Aksi', align: 'center' }
  ];

  const handleViewDetail = (hotel: HotelProduct) => {
    setSelectedHotel(hotel);
    setShowDetailModal(true);
  };

  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      code: '',
      location: 'makkah',
      meal_price: 0,
      rooms: { single: { ...DEFAULT_ROOM }, double: { ...DEFAULT_ROOM }, triple: { ...DEFAULT_ROOM }, quad: { ...DEFAULT_ROOM }, quint: { ...DEFAULT_ROOM } }
    });
    setShowAddModal(true);
  };

  const handleAddHotel = async () => {
    if (!addForm.name.trim() || !addForm.code.trim()) {
      showToast('Nama dan kode hotel wajib', 'error');
      return;
    }
    setSaving(true);
    try {
      const meta: Record<string, unknown> = {
        location: addForm.location,
        room_types: ROOM_TYPES,
        meal_price: addForm.meal_price
      };
      const createRes = await productsApi.create({
        type: 'hotel',
        code: addForm.code.trim(),
        name: addForm.name.trim(),
        meta
      });
      const productId = (createRes.data as { data?: { id: string } })?.data?.id;
      if (!productId) throw new Error('Product id tidak ditemukan');

      for (const rt of ROOM_TYPES) {
        const { price } = addForm.rooms[rt];
        if (price > 0) {
          await productsApi.createPrice({
            product_id: productId,
            branch_id: null,
            owner_id: null,
            currency: 'IDR',
            amount: price,
            meta: { room_type: rt, with_meal: false }
          });
          await productsApi.createPrice({
            product_id: productId,
            branch_id: null,
            owner_id: null,
            currency: 'IDR',
            amount: price + addForm.meal_price,
            meta: { room_type: rt, with_meal: true }
          });
        }
      }

      const totalQty = ROOM_TYPES.reduce((s, rt) => s + addForm.rooms[rt].quantity, 0);
      const roomMeta: Record<string, number> = {};
      ROOM_TYPES.forEach((rt) => { roomMeta[rt] = addForm.rooms[rt].quantity; });
      await adminPusatApi.setProductAvailability(productId, { quantity: totalQty, meta: { room_types: roomMeta } });

      showToast('Hotel berhasil ditambahkan', 'success');
      setShowAddModal(false);
      fetchProducts();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal menambah hotel', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (p: HotelProduct) => {
    const amount = p.price_branch ?? p.price_general ?? p.price_special ?? 0;
    const cur = p.currency || 'IDR';
    if (amount) return `${Number(amount).toLocaleString('id-ID')} ${cur}`;
    return '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Memuat data hotel...</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Hotel</h1>
          <p className="text-slate-600 mt-1">Produk hotel dari database – harga & ketersediaan dikelola Admin Pusat</p>
        </div>
        {canAddHotel && (
          <Button variant="primary" className="flex items-center gap-2" onClick={handleOpenAdd}>
            <Plus className="w-5 h-5" />
            Tambah Hotel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {canAddHotel && (
        <Card>
          <button
            type="button"
            onClick={() => setHandlingConfigOpen((o) => !o)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 font-semibold text-slate-900">
              <Settings className="w-5 h-5" />
              Konfigurasi Handling
            </span>
            {handlingConfigOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {handlingConfigOpen && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
              {handlingConfigLoading ? (
                <p className="text-slate-600">Memuat...</p>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga default handling (SAR)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={handlingPrice}
                      onChange={(e) => setHandlingPrice(Number(e.target.value) || 0)}
                      className="w-full max-w-xs border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <Button variant="primary" onClick={handleSaveHandling} disabled={handlingConfigSaving}>
                    {handlingConfigSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={locationFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={locationFilter === 'makkah' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('makkah')}
            >
              Makkah
            </Button>
            <Button
              variant={locationFilter === 'madinah' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('madinah')}
            >
              Madinah
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">Daftar Hotel</h3>
          <p className="text-sm text-slate-600 mt-1">
            Menampilkan {filteredHotels.length} dari {hotels.length} hotel
          </p>
        </div>

        <Table
          columns={tableColumns}
          data={filteredHotels}
          renderRow={(hotel: HotelProduct) => (
            <tr key={hotel.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-900">{hotel.name}</p>
                {hotel.description && (
                  <p className="text-sm text-slate-600 line-clamp-1">{hotel.description}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">{hotel.code}</code>
              </td>
              <td className="px-6 py-4">
                <span className="capitalize text-slate-700">{hotel.meta?.location || '-'}</span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                {formatPrice(hotel)}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={hotel.is_active ? 'success' : 'error'}>
                  {hotel.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleViewDetail(hotel)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Lihat detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast(`Edit harga/ketersediaan: ${hotel.name}`, 'info')}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast('Hapus hotel – hanya Super Admin', 'info')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {showDetailModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{selectedHotel.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Kode</p>
                  <p className="font-semibold text-slate-900">{selectedHotel.code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Lokasi</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedHotel.meta?.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Harga umum</p>
                  <p className="font-semibold text-slate-900">{formatPrice(selectedHotel)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge variant={selectedHotel.is_active ? 'success' : 'error'}>
                    {selectedHotel.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Deskripsi</p>
                  <p className="text-slate-700">{selectedHotel.description || '-'}</p>
                </div>
                {selectedHotel.meta?.room_types && selectedHotel.meta.room_types.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600 mb-2">Tipe kamar</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHotel.meta.room_types.map((roomType: string, index: number) => (
                        <Badge key={index} variant="info">
                          {roomType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !saving && setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Tambah Hotel (Mekkah / Madinah)</h2>
              <button type="button" onClick={() => !saving && setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><XCircle className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Hotel *</label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Contoh: Hotel Al Haram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode *</label>
                <input
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Contoh: HTL-MKK-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                <select
                  value={addForm.location}
                  onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value as 'makkah' | 'madinah' }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="makkah">Makkah</option>
                  <option value="madinah">Madinah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Makan (IDR) per kamar</label>
                <input
                  type="number"
                  min={0}
                  value={addForm.meal_price || ''}
                  onChange={(e) => setAddForm((f) => ({ ...f, meal_price: Number(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="75000"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Tipe kamar: jumlah & harga (IDR)</p>
                <div className="space-y-2">
                  {ROOM_TYPES.map((rt) => (
                    <div key={rt} className="grid grid-cols-3 gap-2 items-center">
                      <span className="capitalize text-slate-700">{rt}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Jumlah"
                        value={addForm.rooms[rt].quantity || ''}
                        onChange={(e) => setAddForm((f) => ({
                          ...f,
                          rooms: { ...f.rooms, [rt]: { ...f.rooms[rt], quantity: Number(e.target.value) || 0 } }
                        }))}
                        className="border border-slate-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Harga"
                        value={addForm.rooms[rt].price || ''}
                        onChange={(e) => setAddForm((f) => ({
                          ...f,
                          rooms: { ...f.rooms, [rt]: { ...f.rooms[rt], price: Number(e.target.value) || 0 } }
                        }))}
                        className="border border-slate-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={saving}>Batal</Button>
                <Button variant="primary" onClick={handleAddHotel} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Hotel'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsPage;
