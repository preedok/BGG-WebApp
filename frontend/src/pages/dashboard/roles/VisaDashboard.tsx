import React from 'react';
import { FileText, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const VisaDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Pending Applications', value: '28', change: 'Need processing', icon: <Clock className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500' },
    { title: 'Processed Today', value: '67', change: '+15 from yesterday', icon: <CheckCircle className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Total Applicants', value: '456', change: 'This month', icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Incomplete Docs', value: '8', change: 'Waiting documents', icon: <AlertCircle className="w-6 h-6" />, color: 'from-red-500 to-pink-500' }
  ];

  const pendingApplications = [
    { orderId: 'ORD-2024-145', owner: 'Al-Hijrah Travel', totalJamaah: 45, docsComplete: 42, status: 'reviewing' },
    { orderId: 'ORD-2024-142', owner: 'Barokah Tour', totalJamaah: 32, docsComplete: 32, status: 'ready' },
    { orderId: 'ORD-2024-138', owner: 'Madinah Express', totalJamaah: 28, docsComplete: 25, status: 'incomplete' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Visa Processing Dashboard</h1>
        <p className="text-slate-600 mt-1">Visa Application Management & Document Verification</p>
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
        <h3 className="text-xl font-bold text-slate-900 mb-6">Pending Visa Applications</h3>
        <div className="space-y-4">
          {pendingApplications.map((app, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{app.orderId}</p>
                  <p className="text-sm text-slate-600">{app.owner}</p>
                </div>
                <Badge variant={app.status === 'ready' ? 'success' : app.status === 'incomplete' ? 'error' : 'warning'}>
                  {app.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Documents: {app.docsComplete}/{app.totalJamaah} complete
                </span>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Process</Button>
                  <Button variant="outline" size="sm">View Docs</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VisaDashboard;