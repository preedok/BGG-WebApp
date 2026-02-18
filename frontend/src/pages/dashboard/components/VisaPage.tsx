import React, { useState, useEffect, useCallback } from 'react';
import { Save, Building2, Globe } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { businessRulesApi, branchesApi } from '../../../services/api';
import { fillFromSource } from '../../../utils/currencyConversion';
import type { Branch } from '../../../services/api';
import VisaWorkPage from './VisaWorkPage';

type VisaConfigItem = {
  type: 'global' | 'branch';
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  visa_default_idr: number;
  require_hotel_with_visa: boolean;
};

const VisaPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visaList, setVisaList] = useState<VisaConfigItem[]>([]);
  const [form, setForm] = useState({ visa_default_idr: 0, require_hotel_with_visa: true });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});
  /** Mata uang untuk input harga; hanya field ini yang bisa diisi */
  const [visaPriceCurrency, setVisaPriceCurrency] = useState<'IDR' | 'SAR' | 'USD'>('IDR');
  /** '' = Global, atau id cabang */
  const [editTarget, setEditTarget] = useState<string>('');

  const isPusat = user?.role === 'super_admin' || user?.role === 'admin_pusat';
  const isBranch = false;
  const canConfig = isPusat || isBranch;

  const branchIdForApi = isBranch && user?.branch_id
    ? user.branch_id
    : editTarget === ''
      ? undefined
      : editTarget;

  const fetchVisaList = useCallback(() => {
    if (!canConfig) return;
    setLoading(true);
    if (isPusat) {
      Promise.all([businessRulesApi.get(), branchesApi.list()])
        .then(([rulesRes, branchesRes]) => {
          const globalData = rulesRes.data?.data as Record<string, unknown> | undefined;
          const branchList = (branchesRes.data?.data || []) as Branch[];
          setBranches(branchList);
          const globalItem: VisaConfigItem = {
            type: 'global',
            visa_default_idr: Number(globalData?.visa_default_idr) || 0,
            require_hotel_with_visa: globalData?.require_hotel_with_visa === true || globalData?.require_hotel_with_visa === 'true'
          };
          if (branchList.length === 0) {
            setVisaList([globalItem]);
            setLoading(false);
            return;
          }
          Promise.all(branchList.map((b) => businessRulesApi.get({ branch_id: b.id })))
            .then((branchRules) => {
              const branchItems: VisaConfigItem[] = branchRules.map((res, i) => {
                const d = res.data?.data as Record<string, unknown> | undefined;
                const b = branchList[i];
                return {
                  type: 'branch',
                  branchId: b.id,
                  branchName: b.name,
                  branchCode: b.code,
                  visa_default_idr: Number(d?.visa_default_idr) || 0,
                  require_hotel_with_visa: d?.require_hotel_with_visa === true || d?.require_hotel_with_visa === 'true'
                };
              });
              setVisaList([globalItem, ...branchItems]);
            })
            .finally(() => setLoading(false));
        })
        .catch(() => setLoading(false));
    } else if (isBranch && user?.branch_id) {
      Promise.all([branchesApi.list(), businessRulesApi.get({ branch_id: user.branch_id })])
        .then(([branchesRes, rulesRes]) => {
          const branchList = (branchesRes.data?.data || []) as Branch[];
          setBranches(branchList);
          const b = branchList.find((x) => x.id === user.branch_id) || { id: user.branch_id, name: 'Cabang ini', code: '' };
          const d = rulesRes.data?.data as Record<string, unknown> | undefined;
          setVisaList([{
            type: 'branch',
            branchId: b.id,
            branchName: b.name,
            branchCode: b.code,
            visa_default_idr: Number(d?.visa_default_idr) || 0,
            require_hotel_with_visa: d?.require_hotel_with_visa === true || d?.require_hotel_with_visa === 'true'
          }]);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [canConfig, isPusat, isBranch, user?.branch_id]);

  useEffect(() => {
    if (canConfig) fetchVisaList();
  }, [canConfig, fetchVisaList]);

  useEffect(() => {
    if (!canConfig) return;
    const params = branchIdForApi ? { branch_id: branchIdForApi } : undefined;
    businessRulesApi.get(params)
      .then((res) => {
        const d = res.data?.data as Record<string, unknown> | undefined;
        if (d) {
          setForm({
            visa_default_idr: Number(d.visa_default_idr) || 0,
            require_hotel_with_visa: d.require_hotel_with_visa === true || d.require_hotel_with_visa === 'true'
          });
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, [canConfig, branchIdForApi]);

  useEffect(() => {
    if (visaList.length === 0) return;
    if (editTarget === '') {
      const g = visaList.find((x) => x.type === 'global');
      if (g) setForm({ visa_default_idr: g.visa_default_idr, require_hotel_with_visa: g.require_hotel_with_visa });
    } else {
      const b = visaList.find((x) => x.branchId === editTarget);
      if (b) setForm({ visa_default_idr: b.visa_default_idr, require_hotel_with_visa: b.require_hotel_with_visa });
    }
  }, [editTarget, visaList]);

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

  const handleSaveConfig = async () => {
    if (!canConfig) return;
    setSaving(true);
    try {
      const rules = { visa_default_idr: form.visa_default_idr, require_hotel_with_visa: form.require_hotel_with_visa };
      const body = branchIdForApi ? { branch_id: branchIdForApi, rules } : { rules };
      await businessRulesApi.set(body);
      const msg = isBranch ? 'Harga visa cabang disimpan' : branchIdForApi ? 'Harga visa cabang disimpan' : 'Harga visa global disimpan';
      showToast(msg, 'success');
      fetchVisaList();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === 'visa_koordinator') {
    return <VisaWorkPage />;
  }

  return (
    <div className="space-y-5">
      {canConfig && (
        <>
          {/* Satu card: pilih target (dropdown) + form + simpan */}
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Atur harga visa</h3>

            {isPusat && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Edit untuk</label>
                <select
                  value={editTarget}
                  onChange={(e) => {
                    setEditTarget(e.target.value);
                    const id = e.target.value;
                    if (id === '') {
                      const g = visaList.find((x) => x.type === 'global');
                      if (g) setForm({ visa_default_idr: g.visa_default_idr, require_hotel_with_visa: g.require_hotel_with_visa });
                    } else {
                      const b = visaList.find((x) => x.branchId === id);
                      if (b) setForm({ visa_default_idr: b.visa_default_idr, require_hotel_with_visa: b.require_hotel_with_visa });
                    }
                  }}
                  className="w-full max-w-xs border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option value="">
                    {visaList.find((x) => x.type === 'global') ? 'Global (default)' : 'Global'}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            )}

            {isBranch && (
              <p className="text-sm text-slate-600 mb-4">Mengatur harga visa untuk cabang Anda.</p>
            )}

            {loading ? (
              <p className="text-slate-500 text-sm py-2">Memuat...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga visa</label>
                    <p className="text-xs text-slate-500 mb-1">Pilih mata uang, lalu isi harga. Lainnya konversi otomatis (read-only).</p>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <select
                        value={visaPriceCurrency}
                        onChange={(e) => setVisaPriceCurrency(e.target.value as 'IDR' | 'SAR' | 'USD')}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="IDR">IDR (input)</option>
                        <option value="SAR">SAR (input)</option>
                        <option value="USD">USD (input)</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {(['IDR', 'SAR', 'USD'] as const).map((curKey) => {
                        const triple = fillFromSource('IDR', form.visa_default_idr || 0, currencyRates);
                        const val = curKey === 'IDR' ? triple.idr : curKey === 'SAR' ? triple.sar : triple.usd;
                        const isEditable = visaPriceCurrency === curKey;
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
                                setForm((f) => ({ ...f, visa_default_idr: Math.round(next.idr) }));
                              } : undefined}
                              className={`w-full max-w-[140px] border rounded-xl px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500 ${isEditable ? 'bg-white' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}`}
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 shrink-0">
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.require_hotel_with_visa}
                      onChange={(e) => setForm((f) => ({ ...f, require_hotel_with_visa: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Wajib punya hotel untuk visa</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">Centang jika visa hanya bisa dipesan bersama pemesanan hotel.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Tabel ringkasan: baca saja */}
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Ringkasan harga visa</h3>
            {loading ? (
              <p className="text-slate-500 text-sm py-2">Memuat...</p>
            ) : visaList.length === 0 ? (
              <p className="text-slate-500 text-sm py-2">Belum ada data. Atur harga di atas lalu simpan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600">Untuk</th>
                      <th className="text-right py-2.5 px-3 font-medium text-slate-600">Harga (IDR)</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-600">Wajib hotel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visaList.map((item) => (
                      <tr key={item.type === 'global' ? 'global' : item.branchId} className="border-b border-slate-100">
                        <td className="py-2.5 px-3">
                          <span className="flex items-center gap-2">
                            {item.type === 'global' ? (
                              <Globe className="w-4 h-4 text-violet-600 shrink-0" />
                            ) : (
                              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            {item.type === 'global' ? 'Global' : `${item.branchName || 'Cabang'} (${item.branchCode || '-'})`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                          Rp {Number(item.visa_default_idr || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {item.require_hotel_with_visa ? 'Ya' : 'Tidak'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default VisaPage;
