import React, { useState, useEffect } from 'react';
import { Receipt, Filter, CheckCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { accountingApi } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingReconciliationPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciled, setReconciled] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: { reconciled?: string; date_from?: string; date_to?: string } = {};
      if (reconciled) params.reconciled = reconciled;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await accountingApi.getReconciliation(params);
      if (res.data.success && res.data.data) setPayments(res.data.data);
      else setPayments([]);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleReconcile = async (id: string) => {
    try {
      await accountingApi.reconcilePayment(id);
      fetchList();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menandai rekonsiliasi');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rekonsiliasi Bank</h1>
        <p className="text-slate-600 mt-1">Cocokkan bukti pembayaran dengan rekening koran, tandai yang sudah direkonsiliasi</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status Rekonsiliasi</label>
            <select value={reconciled} onChange={(e) => setReconciled(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
              <option value="">Semua</option>
              <option value="true">Sudah direkonsiliasi</option>
              <option value="false">Belum direkonsiliasi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Dari</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sampai</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <Button variant="primary" onClick={fetchList} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan'}</Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="text-center py-8 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 pr-4">Tanggal</th>
                  <th className="pb-2 pr-4">Invoice / Order</th>
                  <th className="pb-2 pr-4">Owner</th>
                  <th className="pb-2 pr-4">Cabang</th>
                  <th className="pb-2 pr-4">Jumlah</th>
                  <th className="pb-2 pr-4">Bank</th>
                  <th className="pb-2 pr-4">Verifikasi</th>
                  <th className="pb-2">Rekonsiliasi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4">{p.transfer_date || (p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-')}</td>
                    <td className="py-3 pr-4">{p.Invoice?.invoice_number} / {p.Invoice?.Order?.order_number}</td>
                    <td className="py-3 pr-4">{p.Invoice?.User?.name || '-'}</td>
                    <td className="py-3 pr-4">{p.Invoice?.Branch?.name || '-'}</td>
                    <td className="py-3 pr-4 font-medium">{formatIDR(parseFloat(p.amount || 0))}</td>
                    <td className="py-3 pr-4">{p.bank_name || '-'}</td>
                    <td className="py-3 pr-4">{p.verified_at ? <Badge variant="success">Terverifikasi</Badge> : <Badge variant="warning">Pending</Badge>}</td>
                    <td className="py-3 pr-4">
                      {p.reconciled_at ? (
                        <Badge variant="success">Direkonsiliasi</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleReconcile(p.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Tandai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && payments.length === 0 && <p className="text-slate-500 py-8 text-center">Tidak ada data pembayaran</p>}
      </Card>
    </div>
  );
};

export default AccountingReconciliationPage;
