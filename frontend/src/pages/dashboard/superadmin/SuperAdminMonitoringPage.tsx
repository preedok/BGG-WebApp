import React, { useState, useEffect } from 'react';
import { DollarSign, Receipt, Users, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { superAdminApi } from '../../../services/api';
import { formatIDR } from '../../../utils';

interface MonitoringData {
  overview: {
    total_orders: number;
    orders_today: number;
    total_invoices: number;
    invoices_today: number;
    total_revenue: number;
    revenue_today: number;
    active_users_24h: number;
    total_users: number;
    active_branches: number;
  };
  orders_by_status: Record<string, number>;
  performance: {
    database: string;
    memory_mb: number;
    uptime_seconds: number;
    uptime_human: string;
  };
}

const SuperAdminMonitoringPage: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await superAdminApi.getMonitoring();
      if (res.data.success) setData(res.data.data);
      else setError(res.data.message || 'Failed to load');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={fetchData}>Retry</Button>
      </Card>
    );
  }

  const o = data!.overview;
  const perf = data!.performance;

  const statCards = [
    { title: 'Total Revenue', value: formatIDR(o.total_revenue), sub: `Today: ${formatIDR(o.revenue_today)}`, icon: <DollarSign className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Total Orders', value: String(o.total_orders), sub: `Today: ${o.orders_today}`, icon: <Receipt className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Active Users (24h)', value: String(o.active_users_24h), sub: `Total users: ${o.total_users}`, icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { title: 'System Health', value: perf.database === 'ok' ? 'OK' : 'Error', sub: perf.uptime_human, icon: <Activity className="w-6 h-6" />, color: perf.database === 'ok' ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Realtime Monitoring</h1>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} hover className="overflow-hidden">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
              <span className="text-xs text-slate-500">{stat.sub}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Orders by Status</h3>
          <div className="space-y-2">
            {data && Object.entries(data.orders_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="capitalize text-slate-700">{status}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {data && Object.keys(data.orders_by_status || {}).length === 0 && (
              <p className="text-slate-500 text-sm">No orders yet</p>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-slate-600">Database</span><span className={perf.database === 'ok' ? 'text-emerald-600' : 'text-red-600'}>{perf.database}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Memory</span><span className="font-medium">{perf.memory_mb} MB</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Uptime</span><span className="font-medium">{perf.uptime_human}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminMonitoringPage;
