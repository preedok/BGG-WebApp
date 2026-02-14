import React, { useState } from 'react';
import { Building2, Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Users } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';

interface Branch {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  manager_name: string;
  total_users: number;
  total_orders: number;
  is_active: boolean;
}

const mockBranches: Branch[] = [
  {
    id: '1',
    code: 'JKT-01',
    name: 'Kantor Pusat Jakarta',
    region: 'Jakarta',
    city: 'Jakarta Selatan',
    address: 'Jl. Gatot Subroto No. 123, Jakarta Selatan',
    phone: '+62 21 8094 5678',
    email: 'jakarta@bintangglobal.com',
    manager_name: 'H. Ahmad Ridwan',
    total_users: 15,
    total_orders: 342,
    is_active: true
  },
  {
    id: '2',
    code: 'SBY-01',
    name: 'Cabang Surabaya',
    region: 'Jawa Timur',
    city: 'Surabaya',
    address: 'Jl. HR Muhammad No. 456, Surabaya',
    phone: '+62 31 5687 4321',
    email: 'surabaya@bintangglobal.com',
    manager_name: 'Hj. Siti Aminah',
    total_users: 8,
    total_orders: 278,
    is_active: true
  }
];

const BranchesPage: React.FC = () => {
  const stats = [
    { label: 'Total Branches', value: mockBranches.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Branches', value: mockBranches.filter(b => b.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Staff', value: mockBranches.reduce((sum, b) => sum + b.total_users, 0), color: 'from-purple-500 to-pink-500' },
    { label: 'Total Orders', value: mockBranches.reduce((sum, b) => sum + b.total_orders, 0), color: 'from-orange-500 to-red-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'code', label: 'Code', align: 'left' },
    { id: 'name', label: 'Branch Name', align: 'left' },
    { id: 'location', label: 'Location', align: 'left' },
    { id: 'manager', label: 'Manager', align: 'left' },
    { id: 'contact', label: 'Contact', align: 'left' },
    { id: 'stats', label: 'Statistics', align: 'center' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branches Management</h1>
          <p className="text-slate-600 mt-1">Manage company branches and regional offices</p>
        </div>
        <Button variant="primary"><Plus className="w-5 h-5 mr-2" />Add Branch</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Building2 className="w-5 h-5" />
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
          data={mockBranches}
          renderRow={(branch: Branch) => (
            <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono text-sm">
                  {branch.code}
                </code>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900">{branch.name}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-semibold">{branch.city}</p>
                    <p className="text-xs text-slate-500">{branch.region}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700">{branch.manager_name}</td>
              <td className="px-6 py-4">
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {branch.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {branch.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-center">
                  <p><span className="font-semibold">{branch.total_users}</span> users</p>
                  <p><span className="font-semibold">{branch.total_orders}</span> orders</p>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={branch.is_active ? 'success' : 'error'}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
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

export default BranchesPage;