import React from 'react';
import {
    TrendingUp,
    DollarSign,
    Receipt,
    Users,
    Building2,
    CheckCircle,
    Clock,
    MoreVertical,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrders, mockUsers } from '../../data';
import { formatIDR, formatCompactNumber } from '../../utils';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Order, TableColumn } from '../../types';

const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuth();

    // Calculate stats from mock data
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.reduce((sum, order) => {
        const amount = parseFloat(order.amount.replace(/[^\d]/g, ''));
        return sum + amount;
    }, 0);
    const activePartners = mockUsers.filter(u => u.role === 'owner' && u.is_active).length;

    const stats = [
        {
            title: 'Total Revenue',
            value: formatIDR(totalRevenue),
            change: '+12.5%',
            trend: 'up' as const,
            icon: <DollarSign className="w-6 h-6" />,
            color: 'from-emerald-500 to-teal-500'
        },
        {
            title: 'Total Orders',
            value: totalOrders.toString(),
            change: '+8.3%',
            trend: 'up' as const,
            icon: <Receipt className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Active Partners',
            value: activePartners.toString(),
            change: '+15.2%',
            trend: 'up' as const,
            icon: <Users className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Total Jamaah',
            value: formatCompactNumber(12845),
            change: '+23.1%',
            trend: 'up' as const,
            icon: <Building2 className="w-6 h-6" />,
            color: 'from-orange-500 to-red-500'
        }
    ];

    // Get recent orders from mock data
    const recentOrders = mockOrders.slice(0, 5);

    const branchPerformance = [
        { name: 'Jakarta Pusat', orders: 342, revenue: 'Rp 856M', growth: 15 },
        { name: 'Surabaya', orders: 278, revenue: 'Rp 623M', growth: 12 },
        { name: 'Bandung', orders: 189, revenue: 'Rp 445M', growth: 8 },
        { name: 'Medan', orders: 156, revenue: 'Rp 378M', growth: 10 },
        { name: 'Makassar', orders: 142, revenue: 'Rp 324M', growth: 18 }
    ];

    const productStats = [
        { name: 'Hotel Mekkah', count: 425, percentage: 68 },
        { name: 'Hotel Madinah', count: 398, percentage: 64 },
        { name: 'Visa Umroh', count: 512, percentage: 82 },
        { name: 'Paket Lengkap', count: 287, percentage: 46 },
        { name: 'Tiket Pesawat', count: 456, percentage: 74 }
    ];

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'success' | 'warning' | 'info' | 'error' | 'default'
        > = {
            confirmed: 'success',
            pending: 'warning',
            processing: 'info',
            cancelled: 'error',
            completed: 'success',
            draft: 'default'
        };
        return variants[status] || 'default';
    };

    const tableColumns: TableColumn[] = [
        { id: 'order_number', label: 'Order ID', align: 'left' },
        { id: 'owner_name', label: 'Owner', align: 'left' },
        { id: 'package_name', label: 'Package', align: 'left' },
        { id: 'amount', label: 'Amount', align: 'right' },
        { id: 'status', label: 'Status', align: 'center' },
        { id: 'date', label: 'Date', align: 'left' },
        { id: 'actions', label: 'Actions', align: 'center' }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-slate-600">Here's what's happening with your platform today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} hover className="relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                                {stat.icon}
                            </div>
                            <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold">
                                <TrendingUp className="w-4 h-4" />
                                <span>{stat.change}</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        <Table
                            columns={tableColumns}
                            data={recentOrders}
                            renderRow={(order: Order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-900">{order.order_number}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{order.owner_name}</td>
                                    <td className="px-6 py-4 text-slate-700">{order.package_name}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                        {order.amount}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant={getStatusBadge(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{order.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )}
                        />
                    </Card>
                </div>

                {/* Branch Performance */}
                <div>
                    <Card>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Branch Performance</h3>
                        <p className="text-sm text-slate-600 mb-6">Top performing branches this month</p>

                        <div className="space-y-4">
                            {branchPerformance.map((branch, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">{branch.name}</span>
                                        <span className="text-sm text-slate-600">{branch.orders} orders</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${branch.growth * 5}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600">+{branch.growth}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Revenue: {branch.revenue}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Product Statistics */}
                <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Product Statistics</h3>
                    <p className="text-sm text-slate-600 mb-6">Most ordered products this month</p>

                    <div className="space-y-4">
                        {productStats.map((product, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900">{product.name}</span>
                                    <span className="text-sm text-slate-600">{product.count} orders</span>
                                </div>
                                <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${product.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions & System Status */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="flex-col h-20 space-y-1">
                                <Receipt className="w-5 h-5" />
                                <span className="text-sm">New Order</span>
                            </Button>
                            <Button variant="outline" className="flex-col h-20 space-y-1">
                                <Users className="w-5 h-5" />
                                <span className="text-sm">Add Partner</span>
                            </Button>
                            <Button variant="outline" className="flex-col h-20 space-y-1">
                                <Building2 className="w-5 h-5" />
                                <span className="text-sm">Manage Hotels</span>
                            </Button>
                            <Button variant="outline" className="flex-col h-20 space-y-1">
                                <ArrowUpRight className="w-5 h-5" />
                                <span className="text-sm">View Reports</span>
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">System Status</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'API Status', status: 'Operational', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
                                { label: 'Database', status: 'Connected', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
                                { label: 'Queue Jobs', status: 'Processing', icon: <Clock className="w-5 h-5 text-yellow-500" /> },
                                { label: 'Email Service', status: 'Active', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {item.icon}
                                        <span className="font-semibold text-slate-900">{item.label}</span>
                                    </div>
                                    <span className="text-sm text-slate-600">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;