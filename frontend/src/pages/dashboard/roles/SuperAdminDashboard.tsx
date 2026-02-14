import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Receipt,
  Building2,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  FileText,
  Package
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Overall System Stats
  const systemStats = [
    {
      title: 'Total Revenue',
      value: formatIDR(2456789000),
      change: '+12.5%',
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.3%',
      trend: 'up' as const,
      icon: <Receipt className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Users',
      value: '156',
      change: '+15.2%',
      trend: 'up' as const,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Optimal',
      trend: 'up' as const,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Role Performance Monitoring
  const rolePerformance = [
    {
      role: 'Admin Pusat',
      icon: <Shield className="w-5 h-5" />,
      totalUsers: 3,
      activeToday: 3,
      tasksCompleted: 45,
      tasksTotal: 52,
      performance: 87,
      status: 'excellent' as const,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      role: 'Admin Cabang',
      icon: <Building2 className="w-5 h-5" />,
      totalUsers: 8,
      activeToday: 7,
      tasksCompleted: 156,
      tasksTotal: 180,
      performance: 87,
      status: 'excellent' as const,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      role: 'Invoice',
      icon: <FileText className="w-5 h-5" />,
      totalUsers: 2,
      activeToday: 2,
      tasksCompleted: 89,
      tasksTotal: 95,
      performance: 94,
      status: 'excellent' as const,
      color: 'from-purple-500 to-pink-500'
    },
    {
      role: 'Handling',
      icon: <Users className="w-5 h-5" />,
      totalUsers: 4,
      activeToday: 4,
      tasksCompleted: 67,
      tasksTotal: 72,
      performance: 93,
      status: 'excellent' as const,
      color: 'from-orange-500 to-red-500'
    },
    {
      role: 'Visa',
      icon: <FileText className="w-5 h-5" />,
      totalUsers: 3,
      activeToday: 2,
      tasksCompleted: 123,
      tasksTotal: 140,
      performance: 88,
      status: 'good' as const,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      role: 'Bus',
      icon: <Package className="w-5 h-5" />,
      totalUsers: 2,
      activeToday: 2,
      tasksCompleted: 34,
      tasksTotal: 40,
      performance: 85,
      status: 'good' as const,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      role: 'Ticket',
      icon: <Receipt className="w-5 h-5" />,
      totalUsers: 3,
      activeToday: 3,
      tasksCompleted: 78,
      tasksTotal: 85,
      performance: 92,
      status: 'excellent' as const,
      color: 'from-pink-500 to-rose-500'
    },
    {
      role: 'Accounting',
      icon: <BarChart3 className="w-5 h-5" />,
      totalUsers: 2,
      activeToday: 2,
      tasksCompleted: 56,
      tasksTotal: 60,
      performance: 93,
      status: 'excellent' as const,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      role: 'Owner',
      icon: <Users className="w-5 h-5" />,
      totalUsers: 45,
      activeToday: 32,
      ordersPlaced: 234,
      ordersTotal: 280,
      performance: 84,
      status: 'good' as const,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // System Alerts
  const systemAlerts = [
    {
      type: 'warning' as const,
      title: 'High Order Volume',
      message: 'Order volume increased 45% compared to last week',
      time: '10 minutes ago'
    },
    {
      type: 'info' as const,
      title: 'New Owner Registered',
      message: '3 new travel owners registered today',
      time: '1 hour ago'
    },
    {
      type: 'success' as const,
      title: 'Payment Processed',
      message: '125 payments successfully verified',
      time: '2 hours ago'
    }
  ];

  // Recent Activities (cross-role)
  const recentActivities = [
    { role: 'Invoice', user: 'Staff Invoice', action: 'Verified payment for INV-2024-145', time: '5 min ago', status: 'success' },
    { role: 'Handling', user: 'Staff Handling', action: 'Updated jamaah progress to 75%', time: '12 min ago', status: 'info' },
    { role: 'Admin Pusat', user: 'Admin Jakarta', action: 'Updated hotel pricing for Makkah', time: '25 min ago', status: 'info' },
    { role: 'Visa', user: 'Staff Visa', action: 'Processed 15 visa applications', time: '45 min ago', status: 'success' },
    { role: 'Owner', user: 'Al-Hijrah Travel', action: 'Placed new order ORD-2024-234', time: '1 hour ago', status: 'info' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: 'success' as const,
      good: 'info' as const,
      average: 'warning' as const,
      poor: 'error' as const
    };
    return variants[status as keyof typeof variants];
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-600 mt-1">Super Admin - System Monitoring & Control Center</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
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

      {/* System Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">System Alerts</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              alert.type === 'success' ? 'bg-emerald-50 border-emerald-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Role Performance Monitoring */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Role Performance Monitoring</h3>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>

            <div className="grid gap-4">
              {rolePerformance.map((role, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color} text-white`}>
                        {role.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{role.role}</h4>
                        <p className="text-sm text-slate-600">
                          {role.activeToday}/{role.totalUsers} active today
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(role.status)}>
                      {role.performance}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {role.role === 'Owner' ? 'Orders' : 'Tasks'} Completed
                      </span>
                      <span className="font-semibold text-slate-900">
                        {role.tasksCompleted || role.ordersPlaced}/{role.tasksTotal || role.ordersTotal}
                      </span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${role.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${role.performance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0">
                  <div className="mt-1">
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{activity.user}</p>
                    <p className="text-sm text-slate-600 mt-1">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" size="sm">{activity.role}</Badge>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Users className="w-6 h-6" />
            <span className="text-sm">User Management</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Building2 className="w-6 h-6" />
            <span className="text-sm">Branch Control</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm">Analytics</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm">System Settings</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;