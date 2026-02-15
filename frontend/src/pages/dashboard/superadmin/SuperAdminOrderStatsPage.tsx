import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { superAdminApi } from '../../../services/api';
import { formatIDR, DONUT_COLORS } from '../../../utils';

type Period = 'today' | 'week' | 'month';

export const SuperAdminOrderStatsPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getOrderStatistics({ period });
      if (res.data.success) setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Order Statistics</h1>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <Button key={p} variant={period === p ? 'primary' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <Card><div className="py-12 text-center text-slate-500">Loading...</div></Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <p className="text-sm text-slate-600">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{data.total_orders}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">Confirmed Orders</p>
              <p className="text-2xl font-bold text-slate-900">{data.confirmed_orders}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">{formatIDR(data.total_revenue)}</p>
            </Card>
          </div>
          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">By Status</h3>
            {data.by_status && Object.keys(data.by_status).length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.by_status).map(([name, count]: [string, any]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value: Number(count)
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {Object.entries(data.by_status).map((_: [string, any], i: number) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, 'Jumlah']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-8">Tidak ada data order</p>
            )}
          </Card>
          {data.by_branch && data.by_branch.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-slate-900 mb-4">By Branch (Order)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.by_branch.map((b: any) => ({
                        name: (b.branch_name || 'Branch').substring(0, 15),
                        value: b.count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {data.by_branch.map((_: any, i: number) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, 'Order']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto mt-4 border-t border-slate-100 pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2">Branch</th>
                      <th className="text-right py-2">Orders</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_branch.map((b: any) => (
                      <tr key={b.branch_id} className="border-b border-slate-100">
                        <td className="py-2">{b.branch_name}</td>
                        <td className="text-right">{b.count}</td>
                        <td className="text-right font-medium">{formatIDR(b.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card><p className="text-slate-500">Failed to load statistics.</p></Card>
      )}
    </div>
  );
};

export default SuperAdminOrderStatsPage;
