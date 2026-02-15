import React from 'react';
import { Plane } from 'lucide-react';
import Card from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import TicketWorkPage from './TicketWorkPage';

const TicketsPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'role_ticket') {
    return <TicketWorkPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tiket</h1>
        <p className="text-slate-600 mt-1">Penerbitan tiket & dokumen tiket jamaah</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <Plane className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Menu Tiket</h3>
          <p className="text-slate-600">Untuk mengelola order tiket dan penerbitan tiket, login sebagai role Tiket cabang.</p>
        </div>
      </Card>
    </div>
  );
};

export default TicketsPage;
