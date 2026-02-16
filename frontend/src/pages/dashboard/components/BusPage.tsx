import React, { useState, useEffect } from 'react';
import { Bus, Settings, Users, AlertCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { businessRulesApi } from '../../../services/api';
import BusWorkPage from './BusWorkPage';

const BusPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bus_min_pack: 35, bus_penalty_idr: 500000 });

  const canConfig = user?.role === 'super_admin' || user?.role === 'admin_pusat';

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <header className="flex flex-wrap items-start gap-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 shrink-0">
          <Bus className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bus Saudi</h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed max-w-xl">
            Atur minimal paket dan penalti bus. Order, tiket, dan status harian dikelola oleh tim Bus cabang.
          </p>
        </div>
      </header>

      {canConfig && (
        <div className="space-y-6">
          {/* Summary + form in one flow */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="p-5 border border-slate-200/80 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Minimal paket</p>
                  <p className="text-xl font-bold text-slate-900">{form.bus_min_pack || 0} <span className="text-base font-normal text-slate-600">orang</span></p>
                </div>
              </div>
            </Card>
            <Card className="p-5 border border-slate-200/80 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Penalti bus</p>
                  <p className="text-xl font-bold text-slate-900">
                    Rp {Number(form.bus_penalty_idr || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Konfigurasi – selalu tampil, tidak pakai collapse */}
          <Card className="p-6 sm:p-8 border border-slate-200/80 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ubah konfigurasi</h2>
                <p className="text-sm text-slate-500">Minimal paket & penalti bus</p>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-sm">Memuat...</div>
            ) : (
              <div className="flex flex-wrap items-end gap-6">
                <div className="min-w-0 w-full sm:max-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimal paket (orang)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.bus_min_pack || ''}
                    onChange={(e) => setForm((f) => ({ ...f, bus_min_pack: Number(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="min-w-0 w-full sm:max-w-[220px]">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Penalti bus (IDR)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.bus_penalty_idr || ''}
                    onChange={(e) => setForm((f) => ({ ...f, bus_penalty_idr: Number(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <Button variant="primary" onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 shrink-0">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Info */}
      <Card className="p-5 border border-slate-200/80 bg-slate-50/80 rounded-2xl">
        <div className="flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
            <Bus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 mb-0.5 text-sm">Order & tiket bus</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Untuk mengelola order bus, tiket bis, dan status kedatangan/keberangkatan/kepulangan, gunakan akun <strong>role Bus Saudi cabang</strong>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusPage;
