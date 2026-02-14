import React from 'react';
import { Receipt, CheckCircle, Clock, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR } from '../../../utils';

const InvoiceDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Pending Verification', value: '12', change: 'Need attention', icon: <Clock className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500' },
    { title: 'Verified Today', value: '45', change: formatIDR(856000000), icon: <CheckCircle className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
    { title: 'Total Invoices', value: '234', change: 'This month', icon: <Receipt className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Overdue', value: '3', change: 'Requires follow-up', icon: <AlertCircle className="w-6 h-6" />, color: 'from-red-500 to-pink-500' }
  ];

  const pendingPayments = [
    { invoice: 'INV-2024-145', owner: 'Al-Hijrah Travel', amount: formatIDR(45500000), uploadedAt: '10 min ago', proofCount: 1 },
    { invoice: 'INV-2024-142', owner: 'Barokah Tour', amount: formatIDR(32800000), uploadedAt: '1 hour ago', proofCount: 2 },
    { invoice: 'INV-2024-138', owner: 'Madinah Express', amount: formatIDR(18200000), uploadedAt: '2 hours ago', proofCount: 1 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoice Dashboard</h1>
        <p className="text-slate-600 mt-1">Payment Verification & Invoice Management</p>
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
        <h3 className="text-xl font-bold text-slate-900 mb-6">Pending Payment Verification</h3>
        <div className="space-y-4">
          {pendingPayments.map((payment, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{payment.invoice}</p>
                  <p className="text-sm text-slate-600">{payment.owner}</p>
                </div>
                <p className="font-bold text-emerald-600">{payment.amount}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{payment.proofCount} proof(s) uploaded</span>
                  <span className="text-xs text-slate-500">{payment.uploadedAt}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Verify</Button>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDashboard;