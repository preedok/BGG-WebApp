import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Settings, Building2, Save, Edit2, Trash2 } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import ActionsMenu from '../../../components/common/ActionsMenu';
import type { ActionsMenuItem } from '../../../components/common/ActionsMenu';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { businessRulesApi, branchesApi } from '../../../services/api';
import { fillFromSource } from '../../../utils/currencyConversion';
import type { Branch } from '../../../services/api';
import TicketWorkPage from './TicketWorkPage';

type TicketForm = {
  ticket_general_idr: number;
  ticket_lion_idr: number;
  ticket_super_air_jet_idr: number;
  ticket_garuda_idr: number;
};

type TicketBranchRow = TicketForm & {
  branchId: string;
  branchName: string;
  branchCode: string;
};

const MASKAPAI: Array<{ key: keyof TicketForm; label: string }> = [
  { key: 'ticket_lion_idr', label: 'Lion' },
  { key: 'ticket_super_air_jet_idr', label: 'Super Air Jet' },
  { key: 'ticket_garuda_idr', label: 'Garuda' }
];

const emptyForm: TicketForm = {
  ticket_general_idr: 0,
  ticket_lion_idr: 0,
  ticket_super_air_jet_idr: 0,
  ticket_garuda_idr: 0
};

function toForm(d: Record<string, unknown> | undefined): TicketForm {
  if (!d) return { ...emptyForm };
  return {
    ticket_general_idr: Number(d.ticket_general_idr) || 0,
    ticket_lion_idr: Number(d.ticket_lion_idr) || 0,
    ticket_super_air_jet_idr: Number(d.ticket_super_air_jet_idr) || 0,
    ticket_garuda_idr: Number(d.ticket_garuda_idr) || 0
  };
}

const formatPrice = (n: number) => (n != null && n > 0 ? `Rp ${Number(n).toLocaleString('id-ID')}` : '-');

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [branchRows, setBranchRows] = useState<TicketBranchRow[]>([]);
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currencyRates, setCurrencyRates] = useState<{ SAR_TO_IDR?: number; USD_TO_IDR?: number }>({});
  const [ticketGeneralCurrency, setTicketGeneralCurrency] = useState<'IDR' | 'SAR' | 'USD'>('IDR');

  const isPusat = user?.role === 'super_admin' || user?.role === 'admin_pusat';

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
  const isBranch = false;
  const canConfig = isPusat || isBranch;

  const branchIdForApi = isBranch && user?.branch_id
    ? user.branch_id
    : selectedBranchId || undefined;

  const fetchTicketList = useCallback(() => {
    if (!canConfig) return;
    setListLoading(true);
    if (isPusat) {
      Promise.all([businessRulesApi.get(), branchesApi.list()])
        .then(([rulesRes, branchesRes]) => {
          const branchList = (branchesRes.data?.data || []) as Branch[];
          setBranches(branchList);
          if (branchList.length === 0) {
            setBranchRows([]);
            setListLoading(false);
            return;
          }
          Promise.all(branchList.map((b) => businessRulesApi.get({ branch_id: b.id })))
            .then((branchRules) => {
              const rows: TicketBranchRow[] = branchRules.map((res, i) => {
                const d = res.data?.data as Record<string, unknown> | undefined;
                const b = branchList[i];
                return {
                  ...toForm(d),
                  branchId: b.id,
                  branchName: b.name,
                  branchCode: b.code
                };
              });
              setBranchRows(rows);
            })
            .finally(() => setListLoading(false));
        })
        .catch(() => setListLoading(false));
    } else if (isBranch && user?.branch_id) {
      businessRulesApi.get({ branch_id: user.branch_id })
        .then(() => {
          setBranchRows([]);
        })
        .catch(() => {})
        .finally(() => setListLoading(false));
    } else {
      setListLoading(false);
    }
  }, [canConfig, isPusat, isBranch, user?.branch_id]);

  useEffect(() => {
    if (canConfig) fetchTicketList();
  }, [canConfig, fetchTicketList]);

  useEffect(() => {
    if (!canConfig) return;
    setLoading(true);
    const params = branchIdForApi ? { branch_id: branchIdForApi } : undefined;
    businessRulesApi.get(params)
      .then((res) => {
        const d = res.data?.data as Record<string, unknown> | undefined;
        setForm(toForm(d));
      })
      .catch(() => setForm(emptyForm))
      .finally(() => setLoading(false));
  }, [canConfig, branchIdForApi]);

  useEffect(() => {
    if (isPusat && branches.length === 0) {
      branchesApi.list().then((res) => res.data?.data && setBranches(res.data.data)).catch(() => {});
    }
  }, [isPusat, branches.length]);

  const handleSaveConfig = async () => {
    if (!canConfig) return;
    setSaving(true);
    try {
      const rules = {
        ticket_general_idr: form.ticket_general_idr,
        ticket_lion_idr: form.ticket_lion_idr,
        ticket_super_air_jet_idr: form.ticket_super_air_jet_idr,
        ticket_garuda_idr: form.ticket_garuda_idr
      };
      const body = branchIdForApi ? { branch_id: branchIdForApi, rules } : { rules };
      await businessRulesApi.set(body);
      const msg = isBranch ? 'Harga tiket cabang disimpan' : branchIdForApi ? 'Harga tiket cabang disimpan' : 'Harga tiket global disimpan';
      showToast(msg, 'success');
      fetchTicketList();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!isPusat) return;
    if (!window.confirm('Hapus harga tiket cabang ini? Cabang akan mengikuti harga global.')) return;
    setDeletingId(branchId);
    try {
      await businessRulesApi.set({
        branch_id: branchId,
        rules: {
          ticket_general_idr: 0,
          ticket_lion_idr: 0,
          ticket_super_air_jet_idr: 0,
          ticket_garuda_idr: 0
        }
      });
      showToast('Harga tiket cabang dihapus', 'success');
      fetchTicketList();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Gagal menghapus', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const onEditBranch = (row: TicketBranchRow) => {
    setSelectedBranchId(row.branchId);
    setForm({
      ticket_general_idr: row.ticket_general_idr,
      ticket_lion_idr: row.ticket_lion_idr,
      ticket_super_air_jet_idr: row.ticket_super_air_jet_idr,
      ticket_garuda_idr: row.ticket_garuda_idr
    });
  };

  const updateForm = (key: keyof TicketForm, value: number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const formatInputValue = (n: number) => (n === 0 ? '' : String(n));
  const parseInputValue = (raw: string): number => {
    if (raw === '' || raw === '-') return 0;
    const n = Number(raw.replace(/\D/g, ''));
    return Number.isNaN(n) ? 0 : n;
  };

  if (user?.role === 'tiket_koordinator') {
    return <TicketWorkPage />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Tiket</h2>
        <p className="text-slate-600 text-sm mt-0.5">
          Harga general dan per cabang per maskapai (Lion, Super Air Jet, Garuda).
        </p>
      </div>

      {canConfig && (
        <>
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Konfigurasi tiket</h3>
            {listLoading ? (
              <p className="text-slate-500 text-sm py-4">Memuat...</p>
            ) : (
              <>
                <div className="pt-0">
                  {isPusat && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Edit untuk</label>
                      <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                      >
                        <option value="">Global</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {isBranch && <p className="text-sm text-slate-600 mb-4">Mengatur harga tiket untuk cabang Anda.</p>}
                  {(
                    <>
                      {loading ? (
                        <p className="text-slate-500 text-sm py-2">Memuat...</p>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-4 items-end">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Harga general</label>
                              <p className="text-xs text-slate-500 mb-1">Pilih mata uang, lalu isi harga. Lainnya konversi otomatis (read-only).</p>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <select
                                  value={ticketGeneralCurrency}
                                  onChange={(e) => setTicketGeneralCurrency(e.target.value as 'IDR' | 'SAR' | 'USD')}
                                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                                >
                                  <option value="IDR">IDR (input)</option>
                                  <option value="SAR">SAR (input)</option>
                                  <option value="USD">USD (input)</option>
                                </select>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {(['IDR', 'SAR', 'USD'] as const).map((curKey) => {
                                  const triple = fillFromSource('IDR', form.ticket_general_idr || 0, currencyRates);
                                  const val = curKey === 'IDR' ? triple.idr : curKey === 'SAR' ? triple.sar : triple.usd;
                                  const isEditable = ticketGeneralCurrency === curKey;
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
                                          updateForm('ticket_general_idr', Math.round(next.idr));
                                        } : undefined}
                                        className={`w-full max-w-[120px] border rounded-xl px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 ${isEditable ? 'bg-white' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}`}
                                        placeholder="0"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {MASKAPAI.map((m) => (
                              <div key={m.key}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{m.label} (IDR)</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={formatInputValue(form[m.key] as number)}
                                  onChange={(e) => updateForm(m.key as keyof TicketForm, parseInputValue(e.target.value))}
                                  className="w-full max-w-[140px] border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                  placeholder="0"
                                />
                              </div>
                            ))}
                            <Button variant="primary" onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 shrink-0">
                              <Save className="w-4 h-4" />
                              {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Tabel harga per cabang (Admin Pusat) */}
          {isPusat && (
            <Card>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Harga per cabang</h3>
              {listLoading ? (
                <p className="text-slate-500 text-sm py-2">Memuat...</p>
              ) : branchRows.length === 0 ? (
                <p className="text-slate-500 text-sm py-2">Belum ada cabang.</p>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Cabang</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">General</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Lion</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Super Air Jet</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Garuda</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700 w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchRows.map((row) => (
                        <tr key={row.branchId} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-900">{row.branchName}</span>
                            <span className="text-slate-500 ml-1">({row.branchCode})</span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-700">{formatPrice(row.ticket_general_idr)}</td>
                          <td className="py-3 px-4 text-right text-slate-700">{formatPrice(row.ticket_lion_idr)}</td>
                          <td className="py-3 px-4 text-right text-slate-700">{formatPrice(row.ticket_super_air_jet_idr)}</td>
                          <td className="py-3 px-4 text-right text-slate-700">{formatPrice(row.ticket_garuda_idr)}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <ActionsMenu
                                align="right"
                                items={[
                                  { id: 'edit', label: 'Ubah', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEditBranch(row) },
                                  { id: 'delete', label: 'Hapus', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDeleteBranch(row.branchId), danger: true, disabled: deletingId === row.branchId },
                                ] as ActionsMenuItem[]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
        <Plane className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-slate-900 text-sm">Penerbitan tiket</h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Order dan penerbitan tiket jamaah dikelola dengan akun role Tiket cabang.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
