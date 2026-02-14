import React, { useState } from 'react';
import { Receipt, Plus, Search, Filter, Eye, Edit, Trash2, Download } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { mockOrders, Order } from '../../../data/mockOrders';
import { TableColumn } from '../../../types';

const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: mockOrders.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Confirmed', value: mockOrders.filter(o => o.status === 'confirmed').length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Pending', value: mockOrders.filter(o => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
    { label: 'Completed', value: mockOrders.filter(o => o.status === 'completed').length, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'order_number', label: 'Order ID', align: 'left' },
    { id: 'owner_name', label: 'Owner', align: 'left' },
    { id: 'package_name', label: 'Package', align: 'left' },
    { id: 'amount', label: 'Amount', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      confirmed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'error',
      completed: 'success',
      draft: 'default'
    };
    return variants[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-1">View and manage all orders from travel partners</p>
        </div>
        <Button variant="primary"><Plus className="w-5 h-5 mr-2" />New Order</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'processing', 'completed'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Table
          columns={tableColumns}
          data={filteredOrders}
          renderRow={(order: Order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-900">{order.order_number}</td>
              <td className="px-6 py-4 text-slate-700">{order.owner_name}</td>
              <td className="px-6 py-4 text-slate-700">{order.package_name}</td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">{order.amount}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={getStatusBadge(order.status)}>{order.status}</Badge>
              </td>
              <td className="px-6 py-4 text-slate-600 text-sm">{order.date}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><Download className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;