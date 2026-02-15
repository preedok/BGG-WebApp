import React, { useState, useEffect } from 'react';
import { FileText, Filter } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { accountingApi, type AccountingFinancialReportData } from '../../../services/api';
import { formatIDR } from '../../../utils';

const AccountingFinancialReportPage: React.FC = () => {
  const [data, setData] = useState<AccountingFinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await accountingApi.getFinancialReport({ period, year: String(year), month: String(month) });
      if (res.data.success && res.data.data) setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Laporan Keuangan</h1>
        <p className="text-slate-600 mt-1">Pendapatan per periode dan per cabang (dari pembayaran terverifikasi)</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Periode</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Jenis</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
              <option value="month">Bulanan</option>
              <option value="quarter">Triwulanan</option>
              <option value="year">Tahunan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tahun</label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)} min={2020} max={2030} className="border border-slate-300 rounded-lg px-3 py-2 w-24" />
          </div>
          {period === 'month' && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Bulan</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} className="border border-slate-300 rounded-lg px-3 py-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
            </div>
          )}
          <Button variant="primary" onClick={fetchReport} disabled={loading}>{loading ? 'Memuat...' : 'Tampilkan'}</Button>
        </div>
      </Card>

      {loading && !data && <div className="text-center py-12 text-slate-500">Memuat...</div>}

      {data && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Total Pendapatan</h3>
              <p className="text-3xl font-bold text-emerald-600">{formatIDR(data.total_revenue)}</p>
              <p className="text-sm text-slate-500 mt-1">{data.invoice_count} invoice dalam periode</p>
            </Card>
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Periode</h3>
              <p className="text-slate-700">
                {new Date(data.period.start).toLocaleDateString('id-ID')} – {new Date(data.period.end).toLocaleDateString('id-ID')}
              </p>
            </Card>
          </div>
          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Pendapatan per Cabang</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4">Cabang</th>
                    <th className="pb-2 pr-4 text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_branch.map((row) => (
                    <tr key={row.branch_id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium">{row.branch_name || row.branch_id}</td>
                      <td className="py-3 pr-4 text-right">{formatIDR(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.by_branch.length === 0 && <p className="text-slate-500 py-4 text-center">Belum ada data</p>}
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountingFinancialReportPage;
