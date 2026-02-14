import React from 'react';
import { ShoppingCart, Receipt, Package, DollarSign, TrendingUp, FileText, Users, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'My Orders', value: '23', change: '+5 this month', icon: <ShoppingCart className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Pending Invoices', value: '5', change: formatIDR(145000000), icon: <Receipt className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Total Jamaah', value: '345', change: '+67 this month', icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { title: 'Total Spent', value: formatIDR(856000000), change: 'All time', icon: <DollarSign className="w-6 h-6" />, color: 'from-orange-500 to-red-500' }
  ];

  const recentOrders = [
    { orderNumber: 'ORD-2024-145', packageName: 'Paket Umroh 12 Hari', amount: formatIDR(45500000), status: 'confirmed', date: '2026-02-14' },
    { orderNumber: 'ORD-2024-132', packageName: 'Hotel + Visa', amount: formatIDR(32800000), status: 'processing', date: '2026-02-12' },
    { orderNumber: 'ORD-2024-121', packageName: 'Paket Umroh 9 Hari', amount: formatIDR(28500000), status: 'completed', date: '2026-02-10' }
  ];

  const currentPrices = [
    { category: 'Hotels Makkah', items: ['Fairmont: 1200 SAR', 'Swissotel: 950 SAR', 'Anjum: 600 SAR'] },
    { category: 'Hotels Madinah', items: ['Oberoi: 900 SAR', 'Millennium: 550 SAR', 'Dar Al Taqwa: 350 SAR'] },
    { category: 'Visa', items: ['Standard 30 days: $200', 'Express 15 days: $250'] }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.company_name}! 👋</h1>
        <p className="text-slate-600 mt-1">Owner Dashboard - {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.packageName}</p>
                  </div>
                  <Badge variant={order.status === 'confirmed' ? 'success' : order.status === 'processing' ? 'info' : 'default'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-emerald-600">{order.amount}</span>
                  <span className="text-xs text-slate-500">{order.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Current Prices</h3>
          <div className="space-y-4">
            {currentPrices.map((price, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900 mb-3">{price.category}</p>
                <div className="space-y-2">
                  {price.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.split(':')[0]}</span>
                      <span className="font-semibold text-emerald-600">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" className="flex-col h-24 gap-2">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-sm">New Order</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Receipt className="w-6 h-6" />
            <span className="text-sm">My Invoices</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Package className="w-6 h-6" />
            <span className="text-sm">Browse Packages</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <FileText className="w-6 h-6" />
            <span className="text-sm">Documents</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OwnerDashboard;