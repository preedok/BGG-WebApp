import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { productsApi, ordersApi, businessRulesApi, branchesApi, ownersApi } from '../../../services/api';
import { formatIDR, formatSAR, formatUSD } from '../../../utils';
import { fillFromSource } from '../../../utils/currencyConversion';

const ORDER_ITEM_TYPES = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'visa', label: 'Visa' },
  { id: 'ticket', label: 'Tiket' },
  { id: 'bus', label: 'Bus' },
  { id: 'handling', label: 'Handling' },
  { id: 'package', label: 'Paket' }
] as const;

/** Tipe kamar hotel → kapasitas jamaah per kamar */
const ROOM_TYPES = [
  { id: 'single', label: 'Single (1 jamaah)', capacity: 1 },
  { id: 'double', label: 'Double (2 jamaah)', capacity: 2 },
  { id: 'triple', label: 'Triple (3 jamaah)', capacity: 3 },
  { id: 'quad', label: 'Quad (4 jamaah)', capacity: 4 },
  { id: 'quint', label: 'Quint (5 jamaah)', capacity: 5 }
] as const;

type ItemType = typeof ORDER_ITEM_TYPES[number]['id'];
type RoomTypeId = typeof ROOM_TYPES[number]['id'];

interface ProductOption {
  id: string;
  name: string;
  code: string;
  type: string;
  is_package?: boolean;
  price_general?: number | null;
  price_branch?: number | null;
  price_owner?: number | null;
  currency?: string;
  meta?: { meal_price?: number; [k: string]: unknown };
  room_breakdown?: Record<string, { quantity: number; price: number }>;
  prices_by_room?: Record<string, { quantity: number; price: number }>;
}

/** Satu baris kamar untuk hotel (bisa banyak tipe dalam satu produk hotel) */
interface HotelRoomLine {
  id: string;
  room_type: RoomTypeId;
  quantity: number;
  unit_price: number;
  /** true = hotel + makan, false = hotel saja */
  with_meal?: boolean;
}

interface OrderItemRow {
  id: string;
  type: ItemType;
  product_id: string;
  product_name: string;
  quantity: number;
  room_type?: RoomTypeId;
  /** Untuk hotel: banyak tipe kamar; kalau ada, dipakai untuk submit & tampilan */
  room_breakdown?: HotelRoomLine[];
  unit_price: number;
}

const newHotelLineId = () => `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const newRow = (): OrderItemRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'hotel',
  product_id: '',
  product_name: '',
  quantity: 1,
  unit_price: 0,
  room_breakdown: []
});

const roomCapacity = (roomType: RoomTypeId | undefined): number => {
  if (!roomType) return 0;
  const r = ROOM_TYPES.find((t) => t.id === roomType);
  return r ? r.capacity : 0;
};

/** Hanya owner dan invoice_koordinator yang boleh tambah/edit/hapus order. Role lain hanya lihat di Order & Invoice. */
const canCreateOrEditOrder = (role: string | undefined) => role === 'owner' || role === 'invoice_koordinator';

/** Item daftar owner dari API (termasuk AssignedBranch untuk ambil cabang) */
interface OwnerListItem {
  id: string;
  user_id: string;
  assigned_branch_id?: string;
  User?: { id: string; name?: string; company_name?: string };
  AssignedBranch?: { id: string; code: string; name: string };
}

const OrderFormPage: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(orderId);
  /** Harga satuan hanya boleh diedit oleh role invoice dan admin; owner tidak bisa mengubah harga */
  const canEditPrice = ['invoice_koordinator', 'role_invoice_saudi', 'super_admin', 'admin_pusat', 'admin_koordinator'].includes(user?.role ?? '');

  /** Redirect ke Order & Invoice jika role tidak boleh aksi order (tambah/edit) */
  useEffect(() => {
    if (user && !canCreateOrEditOrder(user.role)) {
      navigate('/dashboard/orders-invoices', { replace: true });
    }
  }, [user, navigate]);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [order, setOrder] = useState<{ branch_id?: string; owner_id?: string; OrderItems?: Array<{ type: string; product_ref_id: string; quantity: number; unit_price: number; subtotal?: number; Product?: { name: string } }> } | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(isEdit);
  const [items, setItems] = useState<OrderItemRow[]>([newRow()]);
  const [saving, setSaving] = useState(false);
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});
  /** Mata uang untuk input harga satuan (hanya field ini yang bisa diisi); hanya dipakai jika canEditPrice */
  const [orderFormPriceCurrency, setOrderFormPriceCurrency] = useState<'IDR' | 'SAR' | 'USD'>('IDR');
  /** Daftar cabang untuk dropdown (saat buat order baru); pilihan cabang saat user tidak punya branch_id */
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  /** Untuk invoice_koordinator / role_invoice_saudi: pilih owner sesuai wilayah (cabang) saat buat order baru */
  const [ownersList, setOwnersList] = useState<OwnerListItem[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  /** Role invoice: tidak pilih cabang; cabang diambil dari owner yang dipilih. Role lain: branch dari order / dropdown / user */
  const isOwner = user?.role === 'owner';
  const canSelectOwner = !isEdit && ['invoice_koordinator', 'role_invoice_saudi'].includes(user?.role ?? '');
  const selectedOwnerProfile = canSelectOwner && selectedOwnerId ? ownersList.find((o) => (o.User?.id ?? o.user_id) === selectedOwnerId) : null;
  const branchIdFromOwner = selectedOwnerProfile?.AssignedBranch?.id ?? selectedOwnerProfile?.assigned_branch_id ?? null;
  const branchId = order?.branch_id || (canSelectOwner ? branchIdFromOwner : null) || selectedBranchId || user?.branch_id || undefined;
  const ownerId = isOwner ? user?.id : (isEdit ? order?.owner_id : canSelectOwner ? selectedOwnerId : undefined) ?? order?.owner_id ?? user?.id;

  /** Daftar cabang hanya untuk role yang bukan invoice (invoice cukup pilih owner sesuai wilayah) */
  useEffect(() => {
    if (!isEdit && !isOwner && !canSelectOwner) {
      branchesApi.list({ limit: 500 }).then((res) => {
        const data = (res.data as { data?: { id: string; code: string; name: string }[] })?.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setBranches(list);
        setSelectedBranchId((prev) => {
          if (prev) return prev;
          if (user?.branch_id && list.some((b) => b.id === user.branch_id)) return user.branch_id;
          return list[0]?.id || '';
        });
      }).catch(() => setBranches([]));
    }
  }, [isEdit, isOwner, canSelectOwner, user?.branch_id]);

  useEffect(() => {
    if (isEdit && order?.branch_id) setSelectedBranchId(order.branch_id);
  }, [isEdit, order?.branch_id]);

  /** Muat daftar owner sesuai wilayah untuk invoice_koordinator / role_invoice_saudi (tanpa pilih cabang) */
  useEffect(() => {
    if (!canSelectOwner) {
      setOwnersList([]);
      return;
    }
    ownersApi.list({}).then((res) => {
      const raw = (res.data as { success?: boolean; data?: unknown })?.data;
      const data = Array.isArray(raw) ? (raw as OwnerListItem[]) : [];
      setOwnersList(data);
      setSelectedOwnerId((prev) => {
        const first = data[0];
        const firstId = first?.User?.id ?? first?.user_id;
        return firstId && !prev ? firstId : prev;
      });
    }).catch(() => setOwnersList([]));
  }, [canSelectOwner]);

  useEffect(() => {
    const params = branchId ? { branch_id: branchId } : undefined;
    businessRulesApi.get(params).then((res) => {
      const data = (res.data as { data?: { currency_rates?: unknown } })?.data;
      let cr = data?.currency_rates;
      if (typeof cr === 'string') {
        try {
          cr = JSON.parse(cr) as { SAR_TO_IDR?: number; USD_TO_IDR?: number };
        } catch {
          cr = null;
        }
      }
      const rates = cr as { SAR_TO_IDR?: number; USD_TO_IDR?: number } | null;
      if (rates && typeof rates === 'object') {
        setCurrencyRates({
          SAR_TO_IDR: typeof rates.SAR_TO_IDR === 'number' ? rates.SAR_TO_IDR : 4200,
          USD_TO_IDR: typeof rates.USD_TO_IDR === 'number' ? rates.USD_TO_IDR : 15500
        });
      } else {
        setCurrencyRates({ SAR_TO_IDR: 4200, USD_TO_IDR: 15500 });
      }
    }).catch(() => setCurrencyRates({ SAR_TO_IDR: 4200, USD_TO_IDR: 15500 }));
  }, [branchId]);

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);
    const params: Record<string, string | number> = {
      with_prices: 'true',
      include_inactive: 'false',
      limit: 500
    };
    if (branchId) params.branch_id = branchId;
    if (ownerId) params.owner_id = ownerId;
    productsApi
      .list(params)
      .then((res) => {
        const data = (res.data as { data?: ProductOption[] })?.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => showToast('Gagal memuat produk dan paket', 'error'))
      .finally(() => setLoadingProducts(false));
  }, [branchId, ownerId, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!orderId) return;
    setLoadingOrder(true);
    ordersApi
      .getById(orderId)
      .then((res) => {
        const data = (res.data as { data?: any })?.data;
        setOrder(data || null);
      })
      .catch(() => {
        showToast('Order tidak ditemukan', 'error');
        navigate('/dashboard/orders-invoices?tab=orders');
      })
      .finally(() => setLoadingOrder(false));
  }, [orderId, navigate, showToast]);

  /** Isi items dari order (setelah order + products + currencyRates ada); konversi IDR → SAR untuk produk SAR */
  useEffect(() => {
    if (!orderId || !order?.OrderItems?.length || !products.length) return;
    const orderItems: any[] = order.OrderItems;
    const sarToIdr = currencyRates.SAR_TO_IDR || 4200;
    const toDisplayPrice = (apiPrice: number, productId: string) => {
      const p = products.find((x) => x.id === productId);
      return p?.currency === 'SAR' ? (apiPrice || 0) / sarToIdr : (apiPrice || 0);
    };
    const seenHotelByProduct = new Set<string>();
    const rows: OrderItemRow[] = [];
    for (const oi of orderItems) {
      const meta = typeof oi.meta === 'object' ? oi.meta : {};
      const oiType = (oi.type || 'hotel') as ItemType;
      if (oiType === 'hotel' && oi.product_ref_id) {
        if (!seenHotelByProduct.has(oi.product_ref_id)) {
          seenHotelByProduct.add(oi.product_ref_id);
          const group = orderItems.filter(
            (o: any) => o.type === 'hotel' && o.product_ref_id === oi.product_ref_id
          );
          const room_breakdown: HotelRoomLine[] = group.map((o: any) => {
            const oMeta = typeof o.meta === 'object' ? o.meta : {};
            return {
              id: o.id || newHotelLineId(),
              room_type: (oMeta.room_type || o.room_type || 'quad') as RoomTypeId,
              quantity: o.quantity ?? 1,
              unit_price: toDisplayPrice(parseFloat(o.unit_price) || 0, oi.product_ref_id),
              with_meal: oMeta.with_meal ?? oMeta.meal ?? false
            };
          });
          const firstPrice = parseFloat(oi.unit_price) || 0;
          rows.push({
            id: oi.id || `row-${oi.product_ref_id}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'hotel',
            product_id: oi.product_ref_id,
            product_name: oi.Product?.name || '',
            quantity: group.reduce((s: number, o: any) => s + (o.quantity || 0), 0),
            unit_price: toDisplayPrice(firstPrice, oi.product_ref_id),
            room_breakdown
          });
        }
      } else {
        rows.push({
          id: oi.id || `row-${oi.product_ref_id}-${Math.random().toString(36).slice(2, 8)}`,
          type: oiType,
          product_id: oi.product_ref_id || '',
          product_name: oi.Product?.name || '',
          quantity: oi.quantity ?? 1,
          room_type: (meta.room_type || oi.room_type) as RoomTypeId | undefined,
          unit_price: toDisplayPrice(parseFloat(oi.unit_price) || 0, oi.product_ref_id || '')
        });
      }
    }
    setItems(rows.length > 0 ? rows : [newRow()]);
  }, [orderId, order, products, currencyRates.SAR_TO_IDR]);

  const productsByType = (type: ItemType): ProductOption[] => {
    if (type === 'package') {
      return products.filter((p) => p.is_package === true);
    }
    return products.filter((p) => !p.is_package && p.type === type);
  };

  const getEffectivePrice = (p: ProductOption): number => {
    const n = p.price_owner ?? p.price_branch ?? p.price_general;
    return typeof n === 'number' && !Number.isNaN(n) ? n : 0;
  };

  /** Harga kamar hotel: dari room_breakdown/prices_by_room per tipe; with_meal menambah meta.meal_price */
  const getHotelRoomPrice = (prod: ProductOption | undefined, roomType: RoomTypeId, withMeal: boolean): number => {
    if (!prod) return 0;
    const rb = prod.room_breakdown ?? prod.prices_by_room ?? {};
    const base = (rb[roomType]?.price ?? getEffectivePrice(prod)) ?? 0;
    const mealPrice = (prod.meta?.meal_price as number | undefined) ?? 0;
    return withMeal ? base + mealPrice : base;
  };

  /** Mata uang baris dari produk (untuk konversi Total SAR → IDR) */
  const rowCurrency = (row: OrderItemRow): 'SAR' | 'IDR' => {
    const p = products.find((x) => x.id === row.product_id);
    return (p?.currency === 'SAR' ? 'SAR' : 'IDR') as 'SAR' | 'IDR';
  };

  /** Konversi harga dari mata uang baris ke IDR */
  const priceToIDR = (price: number, row: OrderItemRow): number =>
    rowCurrency(row) === 'SAR' ? price * (currencyRates.SAR_TO_IDR || 4200) : price;

  /** Dapatkan harga dalam mata uang tertentu (dari harga dalam rowCurrency) */
  const getPriceInCurrency = (priceInRow: number, row: OrderItemRow, target: 'IDR' | 'SAR' | 'USD') => {
    const idr = priceToIDR(priceInRow, row);
    const triple = fillFromSource('IDR', idr, currencyRates);
    return target === 'IDR' ? triple.idr : target === 'SAR' ? triple.sar : triple.usd;
  };

  /** Set unit_price baris dari nilai dalam mata uang target */
  const setRowPriceFromCurrency = (rowId: string, targetCurrency: 'IDR' | 'SAR' | 'USD', value: number) => {
    const row = items.find((r) => r.id === rowId);
    if (!row) return;
    const idr = targetCurrency === 'IDR' ? value : targetCurrency === 'SAR' ? value * (currencyRates.SAR_TO_IDR || 4200) : value * (currencyRates.USD_TO_IDR || 15500);
    const newInRow = rowCurrency(row) === 'SAR' ? idr / (currencyRates.SAR_TO_IDR || 4200) : idr;
    updateRow(rowId, { unit_price: newInRow });
  };

  /** Set unit_price line hotel dari nilai dalam mata uang target */
  const setHotelLinePriceFromCurrency = (rowId: string, lineId: string, targetCurrency: 'IDR' | 'SAR' | 'USD', value: number) => {
    const row = items.find((r) => r.id === rowId);
    if (!row || row.type !== 'hotel') return;
    const idr = targetCurrency === 'IDR' ? value : targetCurrency === 'SAR' ? value * (currencyRates.SAR_TO_IDR || 4200) : value * (currencyRates.USD_TO_IDR || 15500);
    const newInRow = rowCurrency(row) === 'SAR' ? idr / (currencyRates.SAR_TO_IDR || 4200) : idr;
    updateHotelRoomLine(rowId, lineId, { unit_price: newInRow });
  };

  const addRow = () => setItems((prev) => [...prev, newRow()]);
  const removeRow = (rowId: string) => {
    setItems((prev) => {
      const next = prev.filter((r) => r.id !== rowId);
      return next.length > 0 ? next : [newRow()];
    });
  };

  const addHotelRoomLine = (rowId: string) => {
    const row = items.find((r) => r.id === rowId);
    if (!row || row.type !== 'hotel') return;
    const prod = productsByType('hotel').find((p) => p.id === row.product_id);
    const basePrice = getHotelRoomPrice(prod, 'quad', false);
    const newLine: HotelRoomLine = {
      id: newHotelLineId(),
      room_type: 'quad',
      quantity: 1,
      unit_price: basePrice,
      with_meal: false
    };
    setItems((prev) =>
      prev.map((r) =>
        r.id !== rowId
          ? r
          : { ...r, room_breakdown: [...(r.room_breakdown || []), newLine] }
      )
    );
  };

  const removeHotelRoomLine = (rowId: string, lineId: string) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id !== rowId
          ? r
          : { ...r, room_breakdown: (r.room_breakdown || []).filter((l) => l.id !== lineId) }
      )
    );
  };

  const updateHotelRoomLine = (rowId: string, lineId: string, updates: Partial<HotelRoomLine>) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== rowId || !r.room_breakdown) return r;
        return {
          ...r,
          room_breakdown: r.room_breakdown.map((l) =>
            l.id !== lineId ? l : { ...l, ...updates }
          )
        };
      })
    );
  };

  const updateRow = (rowId: string, updates: Partial<OrderItemRow>) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const next = { ...r, ...updates };
        if (updates.product_id != null) {
          const list = productsByType(next.type);
          const prod = list.find((x) => x.id === updates.product_id);
          if (prod) {
            next.product_name = prod.name;
            const price = getEffectivePrice(prod);
            if (next.unit_price === 0 || updates.product_id !== r.product_id) {
              next.unit_price = price;
            }
            if (next.type === 'hotel' && (!next.room_breakdown || next.room_breakdown.length === 0)) {
              const roomPrice = getHotelRoomPrice(prod, 'quad', false);
              next.room_breakdown = [
                { id: newHotelLineId(), room_type: 'quad', quantity: 1, unit_price: roomPrice, with_meal: false }
              ];
            }
          }
        }
        if (updates.type != null && updates.type !== r.type) {
          next.product_id = '';
          next.product_name = '';
          next.unit_price = 0;
          if (updates.type !== 'hotel') {
            next.room_type = undefined;
            next.room_breakdown = undefined;
          } else {
            next.room_breakdown = next.room_breakdown ?? [];
          }
        }
        return next;
      })
    );
  };

  const rowSubtotal = (r: OrderItemRow): number => {
    if (r.type === 'hotel' && r.room_breakdown?.length) {
      return r.room_breakdown.reduce((s, l) => s + Math.max(0, l.quantity) * (l.unit_price || 0), 0);
    }
    return Math.max(0, r.quantity) * (r.unit_price || 0);
  };
  const rowJamaah = (r: OrderItemRow): number => {
    if (r.type === 'hotel' && r.room_breakdown?.length) {
      return r.room_breakdown.reduce(
        (s, l) => s + Math.max(0, l.quantity) * roomCapacity(l.room_type),
        0
      );
    }
    if (r.type === 'hotel' && r.room_type) return Math.max(0, r.quantity) * roomCapacity(r.room_type);
    return 0;
  };
  const subtotal = items.reduce((sum, r) => sum + rowSubtotal(r), 0);
  /** Subtotal baris dalam SAR (harga asli admin pusat); IDR dikonversi ke SAR */
  const rowSubtotalInSAR = (r: OrderItemRow): number => {
    const raw = rowSubtotal(r);
    return rowCurrency(r) === 'SAR' ? raw : raw / (currencyRates.SAR_TO_IDR || 4200);
  };
  const totalSAR = items.reduce((sum, r) => sum + rowSubtotalInSAR(r), 0);
  const totalIDR = totalSAR * (currencyRates.SAR_TO_IDR || 4200);
  const totalJamaah = items.reduce((sum, r) => sum + rowJamaah(r), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((r) => {
      if (!r.product_id) return false;
      if (r.type === 'hotel') {
        const hasBreakdown = r.room_breakdown?.length && r.room_breakdown.some((l) => l.quantity > 0);
        const hasLegacy = r.room_type && r.quantity > 0;
        return Boolean(hasBreakdown || hasLegacy);
      }
      return r.quantity > 0;
    });
    if (validItems.length === 0) {
      showToast('Minimal satu item dengan produk dan qty > 0', 'warning');
      return;
    }
    if (!isEdit && !isOwner && !canSelectOwner && !branchId) {
      showToast('Pilih cabang di atas untuk membuat order.', 'warning');
      return;
    }
    if (canSelectOwner && !selectedOwnerId) {
      showToast('Pilih owner untuk order ini.', 'warning');
      return;
    }
    if (canSelectOwner && selectedOwnerId && !branchIdFromOwner) {
      showToast('Owner yang dipilih belum memiliki cabang. Pilih owner lain.', 'warning');
      return;
    }
    const sarToIdr = currencyRates.SAR_TO_IDR || 4200;
    const toIDR = (price: number, row: OrderItemRow) =>
      rowCurrency(row) === 'SAR' ? price * sarToIdr : price;

    const payloadItems: Record<string, unknown>[] = [];
    for (const r of validItems) {
      if (r.type === 'hotel' && r.room_breakdown?.length) {
        for (const line of r.room_breakdown) {
          if (line.quantity <= 0) continue;
          const withMeal = line.with_meal ?? false;
          payloadItems.push({
            product_id: r.product_id,
            type: 'hotel',
            product_ref_type: 'product',
            quantity: line.quantity,
            unit_price: toIDR(line.unit_price, r),
            room_type: line.room_type,
            meal: withMeal,
            meta: { room_type: line.room_type, with_meal: withMeal }
          });
        }
      } else if (r.type === 'hotel' && r.room_type) {
        payloadItems.push({
          product_id: r.product_id,
          type: 'hotel',
          product_ref_type: 'product',
          quantity: Math.max(1, r.quantity),
          unit_price: toIDR(r.unit_price, r),
          room_type: r.room_type,
          meta: { room_type: r.room_type }
        });
      } else {
        payloadItems.push({
          product_id: r.product_id,
          type: r.type,
          product_ref_type: r.type === 'package' ? 'package' : 'product',
          quantity: Math.max(1, r.quantity),
          unit_price: toIDR(r.unit_price, r)
        });
      }
    }
    const payload = { items: payloadItems };
    setSaving(true);
    if (isEdit && orderId) {
      ordersApi
        .update(orderId, payload)
        .then(() => {
          showToast('Order berhasil diperbarui. Invoice (jika ada) ikut diperbarui.', 'success');
          navigate('/dashboard/orders-invoices?tab=orders');
        })
        .catch((err) => showToast(err.response?.data?.message || 'Gagal memperbarui order', 'error'))
        .finally(() => setSaving(false));
    } else {
      const body: Record<string, unknown> = { ...payload };
      // Owner: backend ambil cabang dari OwnerProfile. Invoice role: backend ambil cabang dari owner yang dipilih.
      if (!isOwner && !canSelectOwner && branchId) body.branch_id = branchId;
      if (ownerId && user?.role !== 'owner') body.owner_id = ownerId;
      ordersApi
        .create(body)
        .then((res) => {
          const data = (res.data as { data?: { id: string } })?.data;
          showToast('Order berhasil dibuat', 'success');
          navigate('/dashboard/orders-invoices', { state: { refreshList: true } });
        })
        .catch((err) => showToast(err.response?.data?.message || 'Gagal membuat order', 'error'))
        .finally(() => setSaving(false));
    }
  };

  if (loadingOrder && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-slate-500">Memuat order...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders-invoices?tab=orders')}>
          <ArrowLeft className="w-4 h-5 mr-1" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Order' : 'Buat Order Baru'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && !isOwner && !canSelectOwner && branches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Cabang</label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setSelectedOwnerId('');
                }}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[200px] focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Pilih cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              <span className="text-xs text-slate-500">Wajib untuk membuat order</span>
            </div>
          )}
          {canSelectOwner && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Owner</label>
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[200px] focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Pilih owner</option>
                {ownersList.map((o) => {
                  const uid = o.User?.id ?? o.user_id;
                  const label = o.User?.company_name || o.User?.name || uid;
                  return <option key={o.id} value={uid}>{label}</option>;
                })}
              </select>
              <span className="text-xs text-slate-500">Owner sesuai wilayah Anda. Order dan cabang mengikuti owner yang dipilih.</span>
            </div>
          )}
          {loadingProducts ? (
            <p className="text-slate-500">Memuat produk dan paket...</p>
          ) : (
            <>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800">Item order (produk & paket)</h2>
                <div className="flex items-center gap-2">
                  {canEditPrice && (
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <span>Input harga satuan dalam:</span>
                      <select
                        value={orderFormPriceCurrency}
                        onChange={(e) => setOrderFormPriceCurrency(e.target.value as 'IDR' | 'SAR' | 'USD')}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="IDR">IDR</option>
                        <option value="SAR">SAR</option>
                        <option value="USD">USD</option>
                      </select>
                      <span className="text-xs text-slate-500">(lainnya konversi otomatis)</span>
                    </label>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah baris
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                      <th className="pb-2 pr-2">Tipe</th>
                      <th className="pb-2 pr-2">Produk / Paket</th>
                      <th className="pb-2 pr-2 w-28">Tipe Kamar</th>
                      <th className="pb-2 pr-2 w-20">Qty</th>
                      <th className="pb-2 pr-2 w-20">Jamaah</th>
                      <th className="pb-2 pr-2 w-36">Harga satuan</th>
                      <th className="pb-2 pr-2 w-32">Subtotal</th>
                      <th className="pb-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 align-top">
                        <td className="py-2 pr-2">
                          <select
                            value={row.type}
                            onChange={(e) => updateRow(row.id, { type: e.target.value as ItemType })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          >
                            {ORDER_ITEM_TYPES.map((t) => (
                              <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            value={row.product_id}
                            onChange={(e) => {
                              const opt = productsByType(row.type).find((p) => p.id === e.target.value);
                              updateRow(row.id, {
                                product_id: e.target.value,
                                product_name: opt?.name ?? '',
                                unit_price: opt ? getEffectivePrice(opt) : 0
                              });
                            }}
                            className="w-full min-w-[200px] border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Pilih produk / paket</option>
                            {productsByType(row.type).map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          {row.type === 'hotel' ? (
                            <div className="space-y-2 min-w-[200px]">
                              {(() => {
                                const hotelProd = productsByType('hotel').find((p) => p.id === row.product_id);
                                return (row.room_breakdown || []).map((line) => (
                                <div key={line.id} className="flex flex-wrap items-center gap-1">
                                  <select
                                    value={line.room_type}
                                    onChange={(e) => {
                                      const rt = e.target.value as RoomTypeId;
                                      updateHotelRoomLine(row.id, line.id, {
                                        room_type: rt,
                                        unit_price: getHotelRoomPrice(hotelProd, rt, line.with_meal ?? false)
                                      });
                                    }}
                                    className="flex-1 min-w-[100px] border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                                  >
                                    {ROOM_TYPES.map((rt) => (
                                      <option key={rt.id} value={rt.id}>{rt.label}</option>
                                    ))}
                                  </select>
                                  <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={line.with_meal ?? false}
                                      onChange={() =>
                                        updateHotelRoomLine(row.id, line.id, {
                                          with_meal: !(line.with_meal ?? false),
                                          unit_price: getHotelRoomPrice(hotelProd, line.room_type, !(line.with_meal ?? false))
                                        })
                                      }
                                      className="rounded border-slate-300"
                                    />
                                    Makan
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">Kamar</span>
                                    <input
                                      type="number"
                                      min={1}
                                      value={line.quantity <= 0 ? '' : line.quantity}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === '') {
                                          updateHotelRoomLine(row.id, line.id, { quantity: 0 });
                                          return;
                                        }
                                        const num = parseInt(raw, 10);
                                        if (!Number.isNaN(num) && num >= 0)
                                          updateHotelRoomLine(row.id, line.id, { quantity: num });
                                      }}
                                      className="w-14 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                                      placeholder="0"
                                      title="Jumlah kamar"
                                    />
                                  </div>
                                  {(line.with_meal ?? false) && (
                                    <span className="text-xs text-slate-600 whitespace-nowrap" title="Jumlah makan = jumlah orang (kamar × kapasitas tipe kamar)">
                                      Makan: {Math.max(0, line.quantity) * roomCapacity(line.room_type)} orang
                                    </span>
                                  )}
                                  {canEditPrice ? (
                                    <div className="flex flex-col gap-0.5">
                                      {(['IDR', 'SAR', 'USD'] as const).map((cur) => {
                                        const val = getPriceInCurrency(line.unit_price || 0, row, cur);
                                        const isEditable = orderFormPriceCurrency === cur;
                                        return (
                                          <div key={cur} className="flex items-center gap-0.5">
                                            <span className="text-slate-400 text-xs w-5">{cur}</span>
                                            <input
                                              type="number"
                                              min={0}
                                              step={cur === 'IDR' ? 1000 : 0.01}
                                              value={val || ''}
                                              readOnly={!isEditable}
                                              onChange={isEditable ? (e) => setHotelLinePriceFromCurrency(row.id, line.id, cur, parseFloat(e.target.value) || 0) : undefined}
                                              className={`w-20 rounded px-1.5 py-1 text-xs ${isEditable ? 'border border-slate-300 bg-white' : 'border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'}`}
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 text-xs w-20">
                                      {new Intl.NumberFormat('id-ID').format(line.unit_price || 0)}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeHotelRoomLine(row.id, line.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Hapus tipe kamar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ));
                              })()}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => addHotelRoomLine(row.id)}
                              >
                                <Plus className="w-3 h-3 mr-1 inline" />
                                Tambah tipe kamar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          {row.type === 'hotel' ? (
                            <span className="text-sm text-slate-700">
                              {(row.room_breakdown || []).reduce((s, l) => s + Math.max(0, l.quantity), 0)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={row.quantity <= 0 ? '' : row.quantity}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  updateRow(row.id, { quantity: 0 });
                                  return;
                                }
                                const num = parseInt(raw, 10);
                                if (!Number.isNaN(num) && num >= 0) updateRow(row.id, { quantity: num });
                              }}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                          )}
                        </td>
                        <td className="py-2 pr-2 text-sm text-slate-700">
                          {row.type === 'hotel' ? rowJamaah(row) : '-'}
                        </td>
                        <td className="py-2 pr-2">
                          {row.type === 'hotel' ? (
                            (row.room_breakdown?.length && row.room_breakdown[0]) ? (
                              canEditPrice ? (
                                <span className="text-slate-700 text-sm">
                                  {rowCurrency(row) === 'SAR'
                                    ? `${(row.room_breakdown[0].unit_price || 0).toLocaleString('id-ID')} SAR`
                                    : new Intl.NumberFormat('id-ID').format(row.room_breakdown[0].unit_price || 0)}
                                  <span className="text-slate-400 text-xs block">(edit per tipe di kolom Tipe Kamar)</span>
                                </span>
                              ) : (
                                <span className="text-slate-700 text-sm">
                                  {rowCurrency(row) === 'SAR'
                                    ? `${(row.room_breakdown[0].unit_price || 0).toLocaleString('id-ID')} SAR`
                                    : new Intl.NumberFormat('id-ID').format(row.room_breakdown[0].unit_price || 0)}
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )
                          ) : canEditPrice ? (
                            <div className="flex flex-col gap-1">
                              {(['IDR', 'SAR', 'USD'] as const).map((cur) => {
                                const val = getPriceInCurrency(row.unit_price || 0, row, cur);
                                const isEditable = orderFormPriceCurrency === cur;
                                return (
                                  <div key={cur} className="flex items-center gap-1">
                                    <span className="text-slate-500 text-xs w-6">{cur}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={cur === 'IDR' ? 1000 : 0.01}
                                      value={val || ''}
                                      readOnly={!isEditable}
                                      onChange={isEditable ? (e) => setRowPriceFromCurrency(row.id, cur, parseFloat(e.target.value) || 0) : undefined}
                                      className={`w-full rounded px-2 py-1 text-sm ${isEditable ? 'border border-slate-300 bg-white' : 'border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`}
                                      placeholder="0"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-700 text-sm">
                              {rowCurrency(row) === 'SAR'
                                ? `${(row.unit_price || 0).toLocaleString('id-ID')} SAR`
                                : new Intl.NumberFormat('id-ID').format(row.unit_price || 0)}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2 text-sm font-medium text-slate-700">
                          {rowCurrency(row) === 'SAR'
                            ? `${rowSubtotal(row).toLocaleString('id-ID')} SAR`
                            : new Intl.NumberFormat('id-ID').format(rowSubtotal(row))}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">Ringkasan Total</h3>
                <p className="text-xs text-slate-500">
                  {canEditPrice && (
                    <>Pilih mata uang input di atas; hanya field mata uang tersebut yang bisa diisi, lainnya konversi otomatis (read-only). </>
                  )}
                  Harga satuan & subtotal per baris mengikuti mata uang produk (IDR atau SAR). Total akhir dikonversi otomatis ke <strong>IDR</strong>, <strong>SAR</strong>, dan <strong>USD</strong> untuk memudahkan pembayaran.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total SAR</span>
                      <span className="font-semibold text-emerald-700">{formatSAR(totalSAR)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total IDR (dari Total SAR × kurs)</span>
                      <span className="font-semibold text-slate-900">{formatIDR(totalIDR)}</span>
                    </div>
                    {totalJamaah > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Jamaah</span>
                        <span className="font-semibold text-slate-900">{totalJamaah} orang</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div>Kurs referensi (dari business rules):</div>
                    <div>1 SAR = {formatIDR(currencyRates.SAR_TO_IDR ?? 4200)}</div>
                    <div>1 USD = {formatIDR(currencyRates.USD_TO_IDR ?? 15500)}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Total order dalam ketiga mata uang (konversi otomatis):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Total IDR (Rupiah)</div>
                      <div className="text-lg font-bold text-slate-900">{formatIDR(totalIDR)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Untuk tagihan / pembayaran Rupiah</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Total SAR (Riyal Saudi)</div>
                      <div className="text-lg font-bold text-emerald-800">{formatSAR(totalSAR)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Harga referensi dari admin pusat</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Total USD (US Dollar)</div>
                      <div className="text-lg font-bold text-blue-700">
                        {formatUSD(totalIDR / (currencyRates.USD_TO_IDR || 15500))}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Konversi dari IDR untuk pembayaran USD
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/orders-invoices?tab=orders')}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={saving || loadingProducts}>
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Buat order'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OrderFormPage;
