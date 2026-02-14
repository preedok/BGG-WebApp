import React, { useState } from 'react';
import { Bus, Plus, Search, Edit, Trash2, Users, Settings } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

interface BusType {
  id: string;
  bus_number: string;
  type: 'standard' | 'premium' | 'vip' | 'executive';
  capacity: number;
  ideal_capacity: number;
  base_price_sar: number;
  penalty_per_person_sar: number;
  route: string;
  status: 'available' | 'in_service' | 'maintenance';
  is_active: boolean;
}

const mockBuses: BusType[] = [
  {
    id: '1',
    bus_number: 'BUS-001',
    type: 'vip',
    capacity: 35,
    ideal_capacity: 35,
    base_price_sar: 800,
    penalty_per_person_sar: 25,
    route: 'Jeddah - Makkah - Madinah',
    status: 'available',
    is_active: true
  },
  {
    id: '2',
    bus_number: 'BUS-002',
    type: 'premium',
    capacity: 40,
    ideal_capacity: 40,
    base_price_sar: 600,
    penalty_per_person_sar: 20,
    route: 'Jeddah - Makkah - Madinah',
    status: 'available',
    is_active: true
  }
];

const BusPage: React.FC = () => {
  const { showToast } = useToast();

  const stats = [
    { label: 'Total Buses', value: mockBuses.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Available', value: mockBuses.filter(b => b.status === 'available').length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Capacity', value: mockBuses.reduce((sum, b) => sum + b.capacity, 0), color: 'from-purple-500 to-pink-500' },
    { label: 'In Service', value: mockBuses.filter(b => b.status === 'in_service').length, color: 'from-orange-500 to-red-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'bus_number', label: 'Bus Number', align: 'left' },
    { id: 'type', label: 'Type', align: 'left' },
    { id: 'route', label: 'Route', align: 'left' },
    { id: 'capacity', label: 'Capacity', align: 'center' },
    { id: 'price', label: 'Base Price', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bus Fleet Management</h1>
          <p className="text-slate-600 mt-1">Manage bus fleet and transportation services</p>
        </div>
        <Button variant="primary" onClick={() => showToast('Tambah bus baru – role Bus / Admin Cabang (demo)', 'info')}><Plus className="w-5 h-5 mr-2" />Add Bus</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Bus className="w-5 h-5" />
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
          data={mockBuses}
          renderRow={(bus: BusType) => (
            <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-900">{bus.bus_number}</td>
              <td className="px-6 py-4">
                <Badge variant="info" className="capitalize">{bus.type}</Badge>
              </td>
              <td className="px-6 py-4 text-slate-700">{bus.route}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{bus.capacity} seats</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">{bus.base_price_sar} SAR</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={bus.status === 'available' ? 'success' : bus.status === 'in_service' ? 'info' : 'warning'}>
                  {bus.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={() => showToast(`Edit bus / konfigurasi penalty: ${bus.bus_number} (demo)`, 'info')} title="Edit"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => showToast(`Konfigurasi seat & penalty: ${bus.bus_number} (demo)`, 'info')} title="Settings"><Settings className="w-4 h-4" /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => showToast('Hapus bus – role Bus (demo)', 'info')} title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default BusPage;