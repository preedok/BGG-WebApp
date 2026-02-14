import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Receipt, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Plus,
  Calendar,
  MapPin,
  Bell
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // REKAPITULASI LENGKAP - Owner dapat melihat semua statistik
  const stats = [
    {
      title: 'Total Orderan',
      value: '23',
      subtitle: '+5 bulan ini',
      change: '+27.8%',
      trend: 'up' as const,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Total Transaksi',
      value: formatIDR(856000000),
      subtitle: 'Yang sudah dibayar ke Bintang Global',
      change: '+12.3%',
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Jamaah',
      value: '345',
      subtitle: 'Yang sudah diberangkatkan',
      change: '+67 bulan ini',
      trend: 'up' as const,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Invoice Status',
      value: '5 Pending',
      subtitle: formatIDR(145000000) + ' outstanding',
      change: '3 tenggat hari ini',
      trend: 'neutral' as const,
      icon: <Receipt className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  // HARGA KHUSUS STATUS
  const hasSpecialPrice = user?.has_special_price || false;

  // FEATURED PACKAGES - Product preview
  const featuredPackages = [
    {
      id: 'pkg-1',
      name: 'Paket Ramadhan 12 Hari',
      price: formatIDR(25000000),
      specialPrice: hasSpecialPrice ? formatIDR(22000000) : null,
      priceType: 'per pack',
      duration: '12 hari',
      includes: 'Tiket, Visa, Hotel, Makan, Handling',
      badge: 'Promo Ramadhan',
      quota: '234/500 sold'
    },
    {
      id: 'pkg-2',
      name: 'Paket Super Promo 12 Hari',
      price: formatIDR(35000000),
      specialPrice: null,
      priceType: 'per orang',
      duration: '12 hari',
      includes: 'Fairmont + Oberoi + Full Service',
      badge: 'Super Promo - DP 50%',
      quota: '156/200 sold',
      isSuper: true
    }
  ];

  // RECENT ORDERS dengan Status Tracking
  const recentOrders = [
    {
      orderNumber: 'ORD-2024-145',
      packageName: 'Paket Ramadhan 12 Hari',
      amount: formatIDR(45500000),
      status: 'processing',
      date: '2026-02-14',
      jamaahCount: 45,
      progress: {
        visa: { status: 'processing', label: 'Diproses konsulat' },
        ticket: { status: 'issued', label: 'Tiket terbit - Download' },
        hotel: { status: 'allocated', label: 'Kamar dialokasi' },
        bus: { status: 'allocated', label: 'Seat 1-45' }
      }
    },
    {
      orderNumber: 'ORD-2024-132',
      packageName: 'Hotel + Visa Makkah',
      amount: formatIDR(32800000),
      status: 'confirmed',
      date: '2026-02-12',
      jamaahCount: 32,
      progress: {
        visa: { status: 'pending', label: 'Menunggu dokumen' },
        hotel: { status: 'confirmed', label: 'Booking confirmed' }
      }
    },
    {
      orderNumber: 'ORD-2024-121',
      packageName: 'Paket Ekonomis 9 Hari',
      amount: formatIDR(28500000),
      status: 'completed',
      date: '2026-02-10',
      jamaahCount: 28,
      progress: {
        visa: { status: 'issued', label: 'Visa terbit - Download' },
        ticket: { status: 'issued', label: 'Tiket terbit - Download' },
        hotel: { status: 'checkout', label: 'Completed' },
        bus: { status: 'completed', label: 'Completed' }
      }
    }
  ];

  // PENDING PAYMENTS
  const pendingPayments = [
    {
      invoiceNumber: 'INV-2024-145',
      orderNumber: 'ORD-2024-145',
      totalAmount: formatIDR(45500000),
      paidAmount: formatIDR(13650000), // 30% DP
      remainingAmount: formatIDR(31850000),
      dueDate: '2026-02-28',
      daysLeft: 13,
      status: 'definite'
    },
    {
      invoiceNumber: 'INV-2024-142',
      orderNumber: 'ORD-2024-142',
      totalAmount: formatIDR(32800000),
      paidAmount: formatIDR(0),
      remainingAmount: formatIDR(32800000),
      dueDate: '2026-02-17',
      daysLeft: 2,
      status: 'tentative',
      urgent: true
    }
  ];

  // UPCOMING DEPARTURES
  const upcomingDepartures = [
    {
      orderNumber: 'ORD-2024-089',
      packageName: 'Paket Premium 16 Hari',
      departureDate: '2026-03-05',
      jamaahCount: 42,
      status: 'preparation',
      location: 'Indonesia'
    },
    {
      orderNumber: 'ORD-2024-076',
      packageName: 'Paket Ramadhan 12 Hari',
      departureDate: '2026-03-15',
      jamaahCount: 38,
      status: 'preparation',
      location: 'Indonesia'
    }
  ];

  // NOTIFICATIONS
  const notifications = [
    { type: 'success', message: 'Tiket untuk ORD-2024-145 telah terbit. Download sekarang!', time: '10 min ago' },
    { type: 'warning', message: 'Invoice INV-2024-142 jatuh tempo dalam 2 hari', time: '1 hour ago' },
    { type: 'info', message: 'Visa untuk ORD-2024-145 sedang diproses konsulat', time: '2 hours ago' }
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      completed: 'success',
      processing: 'info',
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'error',
      tentative: 'warning',
      definite: 'info',
      lunas: 'success'
    };
    return map[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Selamat Datang, {user?.company_name}! 👋
        </h1>
        <p className="text-slate-600 mt-1">
          {user?.name} - Dashboard Owner
          {hasSpecialPrice && (
            <Badge variant="success" className="ml-3">
              ⭐ Dapat Harga Khusus
            </Badge>
          )}
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[
          { value: 'today', label: 'Hari Ini' },
          { value: 'week', label: 'Minggu Ini' },
          { value: 'month', label: 'Bulan Ini' },
          { value: 'year', label: 'Tahun Ini' }
        ].map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* REKAPITULASI LENGKAP - Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              {stat.trend === 'up' && (
                <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" className="flex-col h-24 gap-2" onClick={() => navigate('/dashboard/orders')}>
            <Plus className="w-6 h-6" />
            <span className="text-sm">Create Order</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/dashboard/packages')}>
            <Package className="w-6 h-6" />
            <span className="text-sm">Browse Products</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/dashboard/invoices')}>
            <Receipt className="w-6 h-6" />
            <span className="text-sm">My Invoices</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <MapPin className="w-6 h-6" />
            <span className="text-sm">Track Status</span>
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FEATURED PACKAGES - Product Preview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Featured Packages</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/packages')}>View All</Button>
            </div>
            <div className="space-y-4">
              {featuredPackages.map((pkg, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900">{pkg.name}</h4>
                        {pkg.isSuper && (
                          <Badge variant="error" size="sm">SUPER PROMO - DP 50%</Badge>
                        )}
                        {!pkg.isSuper && pkg.badge && (
                          <Badge variant="warning" size="sm">{pkg.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{pkg.includes}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {pkg.specialPrice ? (
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-slate-500 line-through">{pkg.price}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-emerald-600">{pkg.specialPrice}</p>
                              <Badge variant="success" size="sm">Harga Khusus</Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-slate-900">{pkg.price}</p>
                      )}
                      <p className="text-xs text-slate-500">{pkg.priceType} • {pkg.duration}</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/orders')}>Order Now</Button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600">Quota: {pkg.quota}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* NOTIFICATIONS */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {notifications.map((notif, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  notif.type === 'success' ? 'bg-emerald-50' :
                  notif.type === 'warning' ? 'bg-yellow-50' :
                  'bg-blue-50'
                }`}>
                  <p className="text-sm text-slate-900 mb-1">{notif.message}</p>
                  <p className="text-xs text-slate-500">{notif.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* RECENT ORDERS dengan Status Tracking */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Orders & Status</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>View All</Button>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <Badge variant={getStatusBadge(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{order.packageName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.jamaahCount} jamaah • {order.date}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600">{order.amount}</p>
              </div>

              {/* Progress Tracking */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
                {order.progress.visa && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-slate-700">Visa</span>
                    </div>
                    <p className="text-xs text-slate-600">{order.progress.visa.label}</p>
                    {order.progress.visa.status === 'issued' && (
                      <Button variant="ghost" size="sm" className="mt-1 text-xs">
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                )}
                
                {order.progress.ticket && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">Tiket</span>
                    </div>
                    <p className="text-xs text-slate-600">{order.progress.ticket.label}</p>
                    {order.progress.ticket.status === 'issued' && (
                      <Button variant="ghost" size="sm" className="mt-1 text-xs">
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                )}
                
                {order.progress.hotel && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">Hotel</span>
                    </div>
                    <p className="text-xs text-slate-600">{order.progress.hotel.label}</p>
                  </div>
                )}
                
                {order.progress.bus && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-semibold text-slate-700">Bus</span>
                    </div>
                    <p className="text-xs text-slate-600">{order.progress.bus.label}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Documents
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* PENDING PAYMENTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Pending Payments</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/invoices')}>View All</Button>
          </div>
          <div className="space-y-4">
            {pendingPayments.map((payment, i) => (
              <div key={i} className={`p-4 rounded-xl ${
                payment.urgent ? 'bg-red-50 border-2 border-red-300' : 'bg-slate-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{payment.invoiceNumber}</p>
                    <p className="text-sm text-slate-600">{payment.orderNumber}</p>
                  </div>
                  <Badge variant={getStatusBadge(payment.status)}>{payment.status}</Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total:</span>
                    <span className="font-semibold text-slate-900">{payment.totalAmount}</span>
                  </div>
                  {payment.paidAmount !== formatIDR(0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Terbayar:</span>
                      <span className="font-semibold text-emerald-600">{payment.paidAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Sisa:</span>
                    <span className="font-bold text-red-600">{payment.remainingAmount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Jatuh tempo: {payment.dueDate}
                    </span>
                    {payment.urgent && (
                      <Badge variant="error" size="sm">{payment.daysLeft} hari lagi!</Badge>
                    )}
                  </div>
                </div>

                <Button variant="primary" size="sm" className="w-full mt-3" onClick={() => navigate('/dashboard/invoices')}>
                  Upload Bukti Bayar
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* UPCOMING DEPARTURES */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Upcoming Departures</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>View All</Button>
          </div>
          <div className="space-y-4">
            {upcomingDepartures.map((departure, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{departure.orderNumber}</p>
                    <p className="text-sm text-slate-600">{departure.packageName}</p>
                  </div>
                  <Badge variant="info">{departure.status}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{departure.departureDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{departure.jamaahCount} jamaah</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{departure.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;