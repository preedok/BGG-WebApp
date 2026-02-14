import React from 'react';
import { Users, Plane, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const HandlingDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Active Groups', value: '12', change: 'Currently in journey', icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Departing Soon', value: '5', change: 'Next 7 days', icon: <Plane className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500' },
    { title: 'Total Jamaah', value: '567', change: 'Active now', icon: <Users className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Completed', value: '234', change: 'This month', icon: <CheckCircle className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' }
  ];

  const activeGroups = [
    { order: 'ORD-2024-145', owner: 'Al-Hijrah Travel', jamaah: 45, status: 'in_umroh', progress: 75, location: 'Madinah' },
    { order: 'ORD-2024-142', owner: 'Barokah Tour', jamaah: 32, status: 'in_umroh', progress: 60, location: 'Makkah' },
    { order: 'ORD-2024-138', owner: 'Madinah Express', jamaah: 28, status: 'preparation', progress: 25, location: 'Indonesia' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Handling Dashboard</h1>
        <p className="text-slate-600 mt-1">Jamaah Progress Tracking & Coordination</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 w-fit`}>{stat.icon}</div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Active Jamaah Groups</h3>
        <div className="space-y-4">
          {activeGroups.map((group, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{group.order}</p>
                  <p className="text-sm text-slate-600">{group.owner} - {group.jamaah} jamaah</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-600">{group.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold">{group.progress}%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${group.progress}%` }} />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="primary" size="sm">Update Progress</Button>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HandlingDashboard;