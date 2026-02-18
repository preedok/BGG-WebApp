import React, { useState, useEffect } from 'react';
import { Bus, Settings, Users, AlertCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { businessRulesApi } from '../../../services/api';
import { fillFromSource } from '../../../utils/currencyConversion';
import BusWorkPage from './BusWorkPage';

const BusPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bus_min_pack: 35, bus_penalty_idr: 500000 });
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});
  const [penaltyCurrency, setPenaltyCurrency] = useState<'IDR' | 'SAR' | 'USD'>('IDR');

  const canConfig = user?.role === 'super_admin' || user?.role === 'admin_pusat';

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

  const fetchBusConfig = () => {
    if (!canConfig) return;
    setLoading(true);
    businessRulesApi.get()
      .then((res) => {
        const d = res.data?.data;
        if (d) setForm({
          bus_min_pack: Number(d.bus_min_pack) || 35,
          bus_penalty_idr: Number(d.bus_penalty_idr) || 500000
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBusConfig();
  }, [canConfig]);

  const handleSaveConfig = async () => {
    if (!canConfig) return;
    setSaving(true);
    try {
      await businessRulesApi.set({ rules: { bus_min_pack: form.bus_min_pack, bus_penalty_idr: form.bus_penalty_idr } });
      showToast('Konfigurasi bus disimpan', 'success');
      fetchBusConfig();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === 'role_bus') {
    return <BusWorkPage />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bus Saudi</h2>
        <p className="text-slate-600 text-sm mt-0.5">
          Atur minimal paket dan penalti bus. Order & tiket dikelola tim Bus cabang.
        </p>
      </div>

      {canConfig && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card padding="sm" className="!p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Minimal paket</p>
                  <p className="text-xl font-bold text-slate-900 tabular-nums">{form.bus_min_pack || 0} <span className="text-sm font-normal text-slate-600">orang</span></p>
                </div>
              </div>
            </Card>
            <Card padding="sm" className="!p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Penalti bus</p>
                  <p className="text-xl font-bold text-slate-900 tabular-nums">Rp {Number(form.bus_penalty_idr || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">Ubah konfigurasi</h3>
                <p className="text-sm text-slate-500">Minimal paket & penalti bus</p>
              </div>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm py-4">Memuat...</p>
            ) : (
              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Minimal paket (orang)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.bus_min_pack || ''}
                    onChange={(e) => setForm((f) => ({ ...f, bus_min_pack: Number(e.target.value) || 0 }))}
                    className="w-full max-w-[160px] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Penalti bus</label>
                  <p className="text-xs text-slate-500 mb-1">Pilih mata uang, lalu isi harga. Lainnya konversi otomatis (read-only).</p>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <select
                      value={penaltyCurrency}
                      onChange={(e) => setPenaltyCurrency(e.target.value as 'IDR' | 'SAR' | 'USD')}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="IDR">IDR (input)</option>
                      <option value="SAR">SAR (input)</option>
                      <option value="USD">USD (input)</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(['IDR', 'SAR', 'USD'] as const).map((curKey) => {
                      const triple = fillFromSource('IDR', form.bus_penalty_idr || 0, currencyRates);
                      const val = curKey === 'IDR' ? triple.idr : curKey === 'SAR' ? triple.sar : triple.usd;
                      const isEditable = penaltyCurrency === curKey;
                      return (
                        <div key={curKey}>
                          <span className="text-xs text-slate-500 block mb-0.5">{curKey}{!isEditable && ' (konversi)'}</span>
                          <input
                            type="number"
                            min={0}
                            step={curKey === 'IDR' ? 1 : 0.01}
                            value={val || ''}
                            readOnly={!isEditable}
                            onChange={isEditable ? (e) => {
                              const v = parseFloat(e.target.value) || 0;
                              const next = fillFromSource(curKey, v, currencyRates);
                              setForm((f) => ({ ...f, bus_penalty_idr: Math.round(next.idr) }));
                            } : undefined}
                            className={`w-full max-w-[120px] border rounded-xl px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 ${isEditable ? 'bg-white' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}`}
                            placeholder="0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Button variant="primary" onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 shrink-0">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
        <Bus className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-slate-900 text-sm">Order & tiket bus</h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Order bus, tiket, dan status kedatangan/keberangkatan dikelola dengan akun <strong>role Bus Saudi cabang</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusPage;
