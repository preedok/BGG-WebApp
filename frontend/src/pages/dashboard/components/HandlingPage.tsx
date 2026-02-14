import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Plane, Calendar, MapPin, FileText } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

interface JamaahProgress {
  id: string;
  order_number: string;
  owner_name: string;
  total_jamaah: number;
  departure_date: string;
  return_date: string;
  status: 'preparation' | 'departed' | 'in_umroh' | 'returned' | 'completed';
  progress_percentage: number;
}

const mockJamaahProgress: JamaahProgress[] = [
  {
    id: '1',
    order_number: 'ORD-2024-001',
    owner_name: 'Al-Hijrah Travel',
    total_jamaah: 45,
    departure_date: '2026-03-15',
    return_date: '2026-03-27',
    status: 'preparation',
    progress_percentage: 25
  },
  {
    id: '2',
    order_number: 'ORD-2024-002',
    owner_name: 'Barokah Tour',
    total_jamaah: 32,
    departure_date: '2026-03-20',
    return_date: '2026-03-29',
    status: 'in_umroh',
    progress_percentage: 75
  }
];

const HandlingPage: React.FC = () => {
  const stats = [
    { label: 'Total Groups', value: mockJamaahProgress.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Jamaah', value: mockJamaahProgress.filter(j => j.status === 'in_umroh').reduce((sum, j) => sum + j.total_jamaah, 0), color: 'from-emerald-500 to-teal-500' },
    { label: 'Preparing', value: mockJamaahProgress.filter(j => j.status === 'preparation').length, color: 'from-purple-500 to-pink-500' },
    { label: 'Completed', value: mockJamaahProgress.filter(j => j.status === 'completed').length, color: 'from-orange-500 to-red-500' }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
      preparation: 'warning',
      departed: 'info',
      in_umroh: 'info',
      returned: 'info',
      completed: 'success'
    };
    return variants[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Handling & Jamaah Progress</h1>
        <p className="text-slate-600 mt-1">Track jamaah groups from departure to return</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        {mockJamaahProgress.map((progress) => (
          <Card key={progress.id}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{progress.order_number}</h3>
                  <p className="text-slate-600">{progress.owner_name}</p>
                </div>
                <Badge variant={getStatusBadge(progress.status)} className="capitalize">
                  {progress.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Total Jamaah</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {progress.total_jamaah} pax
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Departure</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {progress.departure_date}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Return</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {progress.return_date}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Progress</p>
                  <p className="font-semibold text-emerald-600">{progress.progress_percentage}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Overall Progress</span>
                  <span className="font-semibold text-slate-900">{progress.progress_percentage}%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Location
                </Button>
                <Button variant="primary" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Update Progress
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HandlingPage;