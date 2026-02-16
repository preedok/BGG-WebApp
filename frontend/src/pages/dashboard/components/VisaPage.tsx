import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Settings, Building2, Globe, Save, Edit2 } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { businessRulesApi, branchesApi } from '../../../services/api';
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
  const [listLoading, setListLoading] = useState(false);
  const [visaList, setVisaList] = useState<VisaConfigItem[]>([]);
  const [form, setForm] = useState({ visa_default_idr: 0, require_hotel_with_visa: true });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [mode, setMode] = useState<'global' | 'branch'>('global');

  const isPusat = user?.role === 'super_admin' || user?.role === 'admin_pusat';
  const isBranch = user?.role === 'admin_cabang';
  const canConfig = isPusat || isBranch;

  const branchIdForApi = isBranch && user?.branch_id
    ? user.branch_id
    : mode === 'branch' && selectedBranchId
      ? selectedBranchId
      : undefined;

  const fetchVisaList = useCallback(() => {
    if (!canConfig) return;
    setListLoading(true);
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
            setListLoading(false);
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
            .finally(() => setListLoading(false));
        })
        .catch(() => setListLoading(false));
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
        .finally(() => setListLoading(false));
    } else {
      setListLoading(false);
    }
  }, [canConfig, isPusat, isBranch, user?.branch_id]);

  useEffect(() => {
    if (canConfig) fetchVisaList();
  }, [canConfig, fetchVisaList]);

  useEffect(() => {
    if (!canConfig) return;
    setLoading(true);
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
      .finally(() => setLoading(false));
  }, [canConfig, branchIdForApi]);

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

  const onEditCard = (item: VisaConfigItem) => {
    if (item.type === 'global') {
      setMode('global');
      setSelectedBranchId('');
      setForm({ visa_default_idr: item.visa_default_idr, require_hotel_with_visa: item.require_hotel_with_visa });
    } else if (item.branchId) {
      setMode('branch');
      setSelectedBranchId(item.branchId);
      setForm({ visa_default_idr: item.visa_default_idr, require_hotel_with_visa: item.require_hotel_with_visa });
    }
  };

  if (user?.role === 'role_visa') {
    return <VisaWorkPage />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <header className="flex flex-wrap items-start gap-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 shrink-0">
          <FileText className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visa</h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed max-w-xl">
            Atur harga default (global) dan harga per cabang. Opsi wajib hotel untuk visa dapat diaktifkan per cabang.
          </p>
        </div>
      </header>

      {/* Card list */}
      {canConfig && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">List konfigurasi visa</h2>
          {listLoading ? (
            <p className="text-slate-500 text-sm py-4">Memuat list...</p>
          ) : visaList.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">Belum ada data. Gunakan form di bawah untuk mengatur.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visaList.map((item) => (
                <Card
                  key={item.type === 'global' ? 'global' : item.branchId}
                  className="p-5 border border-slate-200/80 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'global' ? (
                          <Globe className="w-4 h-4 text-violet-600 shrink-0" />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 truncate">
                          {item.type === 'global' ? 'Global' : `${item.branchName || 'Cabang'} (${item.branchCode || '-'})`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Harga: <span className="font-medium text-slate-900">Rp {Number(item.visa_default_idr || 0).toLocaleString('id-ID')}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Wajib hotel: {item.require_hotel_with_visa ? 'Ya' : 'Tidak'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEditCard(item)}
                      className="shrink-0 p-2 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      title="Ubah"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {canConfig && (
        <div className="space-y-6">
          {isPusat && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Tampilkan:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('global')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'global' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  <Globe className="w-4 h-4" />
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setMode('branch')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'branch' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  <Building2 className="w-4 h-4" />
                  Per cabang
                </button>
              </div>
            </div>
          )}

          {isPusat && mode === 'branch' && (
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 flex-1 max-w-xs">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cabang</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option value="">Pilih cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              {selectedBranchId && (
                <p className="text-sm text-slate-500 pb-1">Pengaturan di bawah hanya untuk cabang ini.</p>
              )}
            </div>
          )}

          {(mode === 'global' || selectedBranchId || isBranch) && (
            <Card className="p-6 sm:p-8 border border-slate-200/80 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {isPusat && mode === 'global' && 'Harga visa global'}
                    {isPusat && mode === 'branch' && selectedBranchId && 'Harga visa cabang'}
                    {isBranch && 'Harga visa cabang ini'}
                  </h2>
                  <p className="text-sm text-slate-500">Simpan setelah mengubah nilai.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-slate-500 text-sm">Memuat...</div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga default visa (IDR)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.visa_default_idr || ''}
                        onChange={(e) => setForm((f) => ({ ...f, visa_default_idr: Number(e.target.value) || 0 }))}
                        className="w-full max-w-xs border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-slate-50/50"
                        placeholder="0"
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.require_hotel_with_visa}
                        onChange={(e) => setForm((f) => ({ ...f, require_hotel_with_visa: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Wajib punya hotel untuk visa</span>
                    </label>
                  </div>
                  <Button variant="primary" onClick={handleSaveConfig} disabled={saving} className="flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto sm:min-w-[140px]">
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default VisaPage;
