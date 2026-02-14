import React, { useState } from 'react';
import { 
  Receipt, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  FileText,
  Upload,
  Users,
  Eye,
  Settings,
  Download,
  Play,
  TrendingUp,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const InvoiceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // REKAPITULASI PEKERJAAN INVOICE ROLE
  const stats = [
    {
      title: 'Pending Verification',
      value: '12',
      subtitle: 'Bukti bayar perlu diverifikasi',
      change: 'Need attention',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      urgent: true
    },
    {
      title: 'Verified Today',
      value: '45',
      subtitle: formatIDR(856000000),
      change: '+15 dari kemarin',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Total Invoices',
      value: '234',
      subtitle: 'Managed bulan ini',
      change: '+28 dari bulan lalu',
      icon: <Receipt className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Overdue Invoices',
      value: '3',
      subtitle: 'Requires follow-up',
      change: 'Owner blocked',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500'
    }
  ];

  // PENDING PAYMENT VERIFICATION
  // Invoice role verifikasi bukti bayar yang diupload owner
  const pendingVerifications = [
    {
      invoiceNumber: 'INV-2024-145',
      orderNumber: 'ORD-2024-145',
      ownerName: 'Al-Hijrah Travel',
      totalAmount: formatIDR(45500000),
      claimedPayment: formatIDR(13650000), // 30% DP yang diinput owner
      proofUploaded: '10 min ago',
      proofCount: 1,
      bankName: 'BNI',
      transferDate: '2026-02-15',
      urgent: false
    },
    {
      invoiceNumber: 'INV-2024-142',
      orderNumber: 'ORD-2024-142',
      ownerName: 'Barokah Tour',
      totalAmount: formatIDR(32800000),
      claimedPayment: formatIDR(32800000), // Pelunasan
      proofUploaded: '1 hour ago',
      proofCount: 2,
      bankName: 'BSI',
      transferDate: '2026-02-15',
      urgent: false
    },
    {
      invoiceNumber: 'INV-2024-138',
      orderNumber: 'ORD-2024-138',
      ownerName: 'Madinah Express',
      totalAmount: formatIDR(18200000),
      claimedPayment: formatIDR(5460000), // 30% DP
      proofUploaded: '2 hours ago',
      proofCount: 1,
      bankName: 'BRI',
      transferDate: '2026-02-14',
      urgent: true
    }
  ];

  // OVERDUE INVOICES - Perlu diaktifkan kembali
  // Invoice role yang bisa aktivasi owner yang telat bayar
  const overdueInvoices = [
    {
      invoiceNumber: 'INV-2024-135',
      orderNumber: 'ORD-2024-135',
      ownerName: 'Safar Travel',
      ownerPhone: '+62 812 3456 7890',
      totalAmount: formatIDR(28500000),
      dueDate: '2026-02-12',
      daysOverdue: 3,
      status: 'blocked',
      canActivate: true
    },
    {
      invoiceNumber: 'INV-2024-128',
      orderNumber: 'ORD-2024-128',
      ownerName: 'Nusantara Haji',
      ownerPhone: '+62 813 4567 8901',
      totalAmount: formatIDR(42000000),
      dueDate: '2026-02-10',
      daysOverdue: 5,
      status: 'blocked',
      canActivate: true
    }
  ];

  // OWNER YANG PERLU DIBANTU
  // Invoice role bisa bantu owner yang tidak paham sistem
  const ownersNeedHelp = [
    {
      ownerName: 'Al-Barokah Travel',
      ownerPhone: '+62 815 6789 0123',
      requestType: 'Create Order',
      packageRequested: 'Paket Ramadhan 12 Hari',
      jamaahCount: 38,
      requestedAt: '30 min ago',
      status: 'pending'
    },
    {
      ownerName: 'Hijrah Express',
      ownerPhone: '+62 816 7890 1234',
      requestType: 'Upload Manifest',
      packageRequested: 'Hotel + Visa',
      jamaahCount: 25,
      requestedAt: '1 hour ago',
      status: 'pending'
    }
  ];

  // HARGA KHUSUS YANG DIKONFIGURASI
  // Invoice role bisa set harga khusus (perlu approval admin cabang)
  const specialPriceConfigs = [
    {
      ownerName: 'Al-Hijrah Travel',
      productType: 'Hotel',
      productName: 'Fairmont Makkah - Quad Room',
      generalPrice: formatIDR(1200) + ' SAR',
      specialPrice: formatIDR(1050) + ' SAR',
      discount: '12.5%',
      approvedBy: 'Admin Cabang Jakarta',
      effectiveDate: '2024-02-01',
      status: 'active'
    },
    {
      ownerName: 'Barokah Tour',
      productType: 'Package',
      productName: 'Paket Ramadhan 12 Hari',
      generalPrice: formatIDR(25000000),
      specialPrice: formatIDR(22000000),
      discount: '12%',
      approvedBy: 'Admin Cabang Surabaya',
      effectiveDate: '2024-02-10',
      status: 'pending_approval'
    }
  ];

  // RECENT VERIFICATIONS
  const recentVerifications = [
    {
      invoiceNumber: 'INV-2024-140',
      ownerName: 'Al-Hijrah Travel',
      amount: formatIDR(45500000),
      verifiedAt: '2 hours ago',
      verifiedBy: user?.name
    },
    {
      invoiceNumber: 'INV-2024-139',
      ownerName: 'Madinah Express',
      amount: formatIDR(32800000),
      verifiedAt: '3 hours ago',
      verifiedBy: user?.name
    },
    {
      invoiceNumber: 'INV-2024-137',
      ownerName: 'Safar Travel',
      amount: formatIDR(18200000),
      verifiedAt: '5 hours ago',
      verifiedBy: user?.name
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoice Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Payment Verification, Owner Helper & Configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* REKAPITULASI PEKERJAAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover className={stat.urgent ? 'border-2 border-yellow-300' : ''}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              {stat.urgent && (
                <Badge variant="warning" size="sm">Urgent</Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
            <p className="text-xs text-emerald-600 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* PENDING PAYMENT VERIFICATION */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            Pending Payment Verification
            <Badge variant="warning" className="ml-3">{pendingVerifications.length} pending</Badge>
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          {pendingVerifications.map((item, i) => (
            <div key={i} className={`p-4 rounded-xl ${
              item.urgent ? 'bg-red-50 border-2 border-red-200' : 'bg-slate-50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-slate-900">{item.invoiceNumber}</p>
                    <Badge variant="info" size="sm">{item.orderNumber}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">{item.ownerName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded {item.proofUploaded} • {item.proofCount} proof(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Invoice</p>
                  <p className="text-lg font-bold text-slate-900">{item.totalAmount}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg mb-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Claimed Payment</p>
                    <p className="font-bold text-emerald-600">{item.claimedPayment}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Bank</p>
                    <p className="font-semibold text-slate-900">{item.bankName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Transfer Date</p>
                    <p className="font-semibold text-slate-900">{item.transferDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify & Approve
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Proof
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Invoice Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* OVERDUE INVOICES - Aktivasi Owner */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Overdue Invoices
              <Badge variant="error" className="ml-3">{overdueInvoices.length} blocked</Badge>
            </h3>
          </div>

          <div className="space-y-4">
            {overdueInvoices.map((item, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{item.invoiceNumber}</p>
                    <p className="text-sm text-slate-700 font-semibold">{item.ownerName}</p>
                    <p className="text-xs text-slate-600">{item.ownerPhone}</p>
                  </div>
                  <Badge variant="error">Blocked</Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-bold text-slate-900">{item.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Due Date:</span>
                    <span className="font-semibold text-red-600">{item.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Days Overdue:</span>
                    <Badge variant="error" size="sm">{item.daysOverdue} hari</Badge>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg mb-3">
                  <p className="text-xs text-slate-600 mb-2">
                    ⚠️ Owner diblokir karena telat bayar. Invoice role bisa mengaktifkan kembali.
                  </p>
                </div>

                {item.canActivate && (
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Activate Owner
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* OWNER YANG PERLU DIBANTU */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Owner Need Help
              <Badge variant="info" className="ml-3">{ownersNeedHelp.length} requests</Badge>
            </h3>
          </div>

          <div className="space-y-4">
            {ownersNeedHelp.map((owner, i) => (
              <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{owner.ownerName}</p>
                    <p className="text-xs text-slate-600">{owner.ownerPhone}</p>
                  </div>
                  <Badge variant="warning">{owner.requestType}</Badge>
                </div>

                <div className="bg-white p-3 rounded-lg mb-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Package:</span>
                      <span className="font-semibold text-slate-900">{owner.packageRequested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Jamaah:</span>
                      <span className="font-semibold text-slate-900">{owner.jamaahCount} orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Requested:</span>
                      <span className="text-slate-600">{owner.requestedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-2 rounded text-xs text-slate-700 mb-3">
                  💡 Invoice role bisa bantu owner create order karena tidak semua owner paham sistem
                </div>

                <Button variant="primary" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Help Create Order
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* HARGA KHUSUS CONFIGURATION */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            Special Price Configuration
            <Badge variant="info" className="ml-3">{specialPriceConfigs.length} configs</Badge>
          </h3>
          <Button variant="primary" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            New Configuration
          </Button>
        </div>

        <div className="space-y-4">
          {specialPriceConfigs.map((config, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">{config.ownerName}</p>
                    <Badge variant={config.status === 'active' ? 'success' : 'warning'} size="sm">
                      {config.status === 'active' ? 'Active' : 'Pending Approval'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{config.productType}: {config.productName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">General Price</p>
                  <p className="font-semibold text-slate-900">{config.generalPrice}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Special Price</p>
                  <p className="font-bold text-emerald-600">{config.specialPrice}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Discount</p>
                  <p className="font-bold text-blue-600">{config.discount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-600">
                    Approved by: <span className="font-semibold text-slate-900">{config.approvedBy}</span>
                  </p>
                  <p className="text-xs text-slate-500">Effective: {config.effectiveDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* RECENT VERIFICATIONS */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Verifications</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <div className="space-y-3">
          {recentVerifications.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">{item.invoiceNumber}</p>
                  <p className="text-sm text-slate-600">{item.ownerName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{item.amount}</p>
                <p className="text-xs text-slate-500">{item.verifiedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* QUICK ACTIONS */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Plus className="w-6 h-6" />
            <span className="text-sm">Help Owner Order</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Upload className="w-6 h-6" />
            <span className="text-sm">Upload Payment</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Settings className="w-6 h-6" />
            <span className="text-sm">Price Config</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Download className="w-6 h-6" />
            <span className="text-sm">Export Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDashboard;