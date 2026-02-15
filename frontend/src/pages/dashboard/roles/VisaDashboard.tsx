import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { visaApi } from '../../../services/api';

const STATUS_LABELS: Record<string, string> = {
  document_received: 'Dokumen Diterima',
  submitted: 'Terkirim (Nusuk)',
  in_process: 'Dalam Proses',
  approved: 'Disetujui',
  issued: 'Visa Terbit'
};

const VisaDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await visaApi.getDashboard();
      if (res.data.success) setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await visaApi.exportExcel();
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-visa-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const d = data || {};
  const byStatus = d.by_status || {};
  const pending = d.pending_list || [];

  const stats = [
    { title: 'Total Order (Visa)', value: d.total_orders ?? 0, subtitle: 'Order dengan item visa', icon: <FileText className="w-6 h-6" />, color: 'from-violet-500 to-purple-600' },
    { title: 'Total Item Visa', value: d.total_visa_items ?? 0, subtitle: 'Baris item visa', icon: <FileText className="w-6 h-6" />, color: 'from-indigo-500 to-blue-500' },
    { title: 'Belum Terbit', value: pending.length, subtitle: 'Perlu diproses', icon: <Clock className="w-6 h-6" />, color: 'from-amber-500 to-orange-500' },
    { title: 'Visa Terbit', value: byStatus.issued ?? 0, subtitle: 'Sudah terbit', icon: <CheckCircle className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Visa</h1>
          <p className="text-slate-600 mt-1">Rekapitulasi pekerjaan penerbitan visa (Nusuk) cabang Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exporting}>
            <FileSpreadsheet className={`w-4 h-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
            </div>
            <p className="text-sm text-slate-600 mt-2">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </Card>
        ))}
      </div>

      {pending.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Perlu Tindakan (Proses hingga Terbit)</h3>
          <div className="space-y-3">
            {pending.slice(0, 15).map((p: any) => (
              <div key={p.order_item_id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-900">{p.order_number}</p>
                  <p className="text-sm text-slate-600">{p.owner_name} · Qty: {p.quantity}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {STATUS_LABELS[p.status] || p.status}</p>
                </div>
                <Button size="sm" onClick={() => navigate('/dashboard/visa?order=' + p.order_id)}>
                  <Eye className="w-4 h-4 mr-2" /> Kerjakan
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/dashboard/visa')}>
          Daftar Order Visa
        </Button>
      </div>

      {!data && !loading && (
        <Card>
          <p className="text-slate-600 text-center py-8">Belum ada order dengan item visa di cabang Anda.</p>
        </Card>
      )}
    </div>
  );
};

export default VisaDashboard;
