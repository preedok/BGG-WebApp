import React from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';

const TicketDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}! 👋</h1>
        <p className="text-slate-600 mt-1">Ticket Dashboard</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ticket Dashboard</h3>
          <p className="text-slate-600">Dashboard content coming soon...</p>
        </div>
      </Card>
    </div>
  );
};

export default TicketDashboard;