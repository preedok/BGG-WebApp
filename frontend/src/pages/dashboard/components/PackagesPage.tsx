import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';

interface PackageType {
  id: string;
  package_code: string;
  package_name: string;
  duration_days: number;
  base_price_sar: number;
  final_price_sar: number;
  quota: number;
  used_quota: number;
  valid_from: string;
  valid_until: string;
  is_featured: boolean;
  is_active: boolean;
}

const mockPackages: PackageType[] = [
  {
    id: '1',
    package_code: 'PKG-9D-001',
    package_name: 'Paket Umroh Ekonomis 9 Hari',
    duration_days: 9,
    base_price_sar: 8500,
    final_price_sar: 9500,
    quota: 100,
    used_quota: 45,
    valid_from: '2026-03-01',
    valid_until: '2026-12-31',
    is_featured: false,
    is_active: true
  },
  {
    id: '2',
    package_code: 'PKG-12D-001',
    package_name: 'Paket Umroh Plus 12 Hari',
    duration_days: 12,
    base_price_sar: 12000,
    final_price_sar: 13500,
    quota: 80,
    used_quota: 38,
    valid_from: '2026-03-01',
    valid_until: '2026-12-31',
    is_featured: true,
    is_active: true
  }
];

const PackagesPage: React.FC = () => {
  const stats = [
    { label: 'Total Packages', value: mockPackages.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Packages', value: mockPackages.filter(p => p.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Quota', value: mockPackages.reduce((sum, p) => sum + p.quota, 0), color: 'from-purple-500 to-pink-500' },
    { label: 'Sold', value: mockPackages.reduce((sum, p) => sum + p.used_quota, 0), color: 'from-orange-500 to-red-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'code', label: 'Package Code', align: 'left' },
    { id: 'name', label: 'Package Name', align: 'left' },
    { id: 'duration', label: 'Duration', align: 'center' },
    { id: 'price', label: 'Final Price', align: 'right' },
    { id: 'quota', label: 'Quota', align: 'center' },
    { id: 'validity', label: 'Valid Period', align: 'left' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Packages Management</h1>
          <p className="text-slate-600 mt-1">Manage bundled umroh packages and pricing</p>
        </div>
        <Button variant="primary"><Plus className="w-5 h-5 mr-2" />Create Package</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Package className="w-5 h-5" />
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
        <Table
          columns={tableColumns}
          data={mockPackages}
          renderRow={(pkg: PackageType) => (
            <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono text-sm">
                    {pkg.package_code}
                  </code>
                  {pkg.is_featured && <Badge variant="warning" size="sm">Featured</Badge>}
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900">{pkg.package_name}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant="info">{pkg.duration_days} days</Badge>
              </td>
              <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                {pkg.final_price_sar.toLocaleString()} SAR
              </td>
              <td className="px-6 py-4 text-center">
                <div className="text-sm">
                  <p className="font-semibold">{pkg.used_quota}/{pkg.quota}</p>
                  <p className="text-slate-500">{Math.round((pkg.used_quota/pkg.quota)*100)}% sold</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {pkg.valid_from} - {pkg.valid_until}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={pkg.is_active ? 'success' : 'error'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default PackagesPage;