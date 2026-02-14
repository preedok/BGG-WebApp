import React from 'react';
import { Hotel, FileText, Plane, DollarSign, TrendingUp, Users, Package, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const AdminPusatDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Hotels Managed', value: '6', change: '+2 this month', icon: <Hotel className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Visa Packages', value: '12', change: '+3 new', icon: <FileText className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Active Packages', value: '8', change: '4 featured', icon: <Package className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { title: 'Price Updates', value: '45', change: 'Today', icon: <Settings className="w-6 h-6" />, color: 'from-orange-500 to-red-500' }
  ];

  const recentPriceUpdates = [
    { item: 'Fairmont Makkah - Quad Room', oldPrice: '1150 SAR', newPrice: '1200 SAR', updatedBy: 'Admin Jakarta', time: '10 min ago' },
    { item: 'Visa Umroh Standard', oldPrice: '190 USD', newPrice: '200 USD', updatedBy: 'Admin Jakarta', time: '1 hour ago' },
    { item: 'SAR Exchange Rate', oldPrice: '4100 IDR', newPrice: '4200 IDR', updatedBy: 'Admin Jakarta', time: '2 hours ago' }
  ];

  const pendingApprovals = [
    { type: 'Package', name: 'Paket Premium 16 Hari', requestedBy: 'Admin Cabang Surabaya', status: 'pending' },
    { type: 'Price', name: 'Hotel Anjum Makkah - Price Update', requestedBy: 'Admin Cabang Bandung', status: 'pending' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}! 👋</h1>
        <p className="text-slate-600 mt-1">Admin Pusat - Master Data Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-emerald-600 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Price Updates</h3>
          <div className="space-y-4">
            {recentPriceUpdates.map((update, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900">{update.item}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-red-600 line-through">{update.oldPrice}</span>
                  <span className="text-emerald-600 font-bold">{update.newPrice}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>By {update.updatedBy}</span>
                  <span>{update.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Pending Approvals</h3>
          <div className="space-y-4">
            {pendingApprovals.map((approval, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="warning" size="sm" className="mb-2">{approval.type}</Badge>
                    <p className="font-semibold text-slate-900">{approval.name}</p>
                    <p className="text-sm text-slate-600 mt-1">Requested by {approval.requestedBy}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm">Approve</Button>
                  <Button variant="outline" size="sm">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Hotel className="w-6 h-6" />
            <span className="text-sm">Manage Hotels</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <FileText className="w-6 h-6" />
            <span className="text-sm">Update Visa</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm">Exchange Rates</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Package className="w-6 h-6" />
            <span className="text-sm">Manage Packages</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPusatDashboard;