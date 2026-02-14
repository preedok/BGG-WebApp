import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';

interface VisaPackage {
  id: string;
  package_name: string;
  visa_type: 'umroh' | 'hajj' | 'tourist' | 'business';
  duration_days: number;
  price_usd: number;
  processing_time_days: number;
  quota: number;
  used_quota: number;
  status: 'available' | 'limited' | 'unavailable';
  is_active: boolean;
}

const mockVisas: VisaPackage[] = [
  {
    id: '1',
    package_name: 'Visa Umroh Standard 30 Days',
    visa_type: 'umroh',
    duration_days: 30,
    price_usd: 200,
    processing_time_days: 7,
    quota: 1000,
    used_quota: 432,
    status: 'available',
    is_active: true
  },
  {
    id: '2',
    package_name: 'Visa Umroh Express 15 Days',
    visa_type: 'umroh',
    duration_days: 15,
    price_usd: 250,
    processing_time_days: 3,
    quota: 500,
    used_quota: 387,
    status: 'available',
    is_active: true
  },
  {
    id: '3',
    package_name: 'Visa Umroh Premium 45 Days',
    visa_type: 'umroh',
    duration_days: 45,
    price_usd: 350,
    processing_time_days: 7,
    quota: 300,
    used_quota: 245,
    status: 'available',
    is_active: true
  }
];

const VisaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisa, setSelectedVisa] = useState<VisaPackage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredVisas = mockVisas.filter(visa =>
    visa.package_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Packages',
      value: mockVisas.length,
      icon: <FileText className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Visas',
      value: mockVisas.filter(v => v.is_active).length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Total Quota',
      value: mockVisas.reduce((sum, v) => sum + v.quota, 0).toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Used Quota',
      value: mockVisas.reduce((sum, v) => sum + v.used_quota, 0).toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'package', label: 'Package Name', align: 'left' },
    { id: 'type', label: 'Type', align: 'left' },
    { id: 'duration', label: 'Duration', align: 'center' },
    { id: 'price', label: 'Price', align: 'right' },
    { id: 'processing', label: 'Processing Time', align: 'center' },
    { id: 'quota', label: 'Quota', align: 'center' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' => {
    const variants = {
      available: 'success' as const,
      limited: 'warning' as const,
      unavailable: 'error' as const
    };
    return variants[status as keyof typeof variants];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visa Management</h1>
          <p className="text-slate-600 mt-1">Manage visa packages and quotas</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Visa Package
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search visa packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">Visa Packages</h3>
          <p className="text-sm text-slate-600 mt-1">
            Showing {filteredVisas.length} of {mockVisas.length} packages
          </p>
        </div>

        <Table
          columns={tableColumns}
          data={filteredVisas}
          renderRow={(visa: VisaPackage) => (
            <tr key={visa.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-900">{visa.package_name}</p>
              </td>
              <td className="px-6 py-4">
                <Badge variant="info" className="capitalize">{visa.visa_type}</Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{visa.duration_days} days</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">{visa.price_usd} USD</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{visa.processing_time_days} days</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{visa.used_quota} / {visa.quota}</p>
                  <p className="text-slate-500">
                    {Math.round((visa.used_quota / visa.quota) * 100)}% used
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={getStatusBadgeVariant(visa.status)} className="capitalize">
                  {visa.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedVisa(visa);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {showDetailModal && selectedVisa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Visa Package Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Package Name</p>
                  <p className="font-semibold text-slate-900">{selectedVisa.package_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Visa Type</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedVisa.visa_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="font-semibold text-slate-900">{selectedVisa.duration_days} days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Price</p>
                  <p className="font-semibold text-emerald-600">${selectedVisa.price_usd} USD</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Processing Time</p>
                  <p className="font-semibold text-slate-900">{selectedVisa.processing_time_days} days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Quota Remaining</p>
                  <p className="font-semibold text-slate-900">
                    {selectedVisa.quota - selectedVisa.used_quota} of {selectedVisa.quota}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaPage;