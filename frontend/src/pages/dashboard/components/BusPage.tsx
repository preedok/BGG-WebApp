import React from 'react';
import { Bus } from 'lucide-react';
import Card from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import BusWorkPage from './BusWorkPage';

const BusPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'role_bus') {
    return <BusWorkPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bus Saudi</h1>
        <p className="text-slate-600 mt-1">Order bus, tiket bis, kedatangan, keberangkatan, kepulangan</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <Bus className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Menu Bus</h3>
          <p className="text-slate-600">Untuk mengelola order bus dan update tiket bis serta status kedatangan/keberangkatan/kepulangan, login sebagai role Bus Saudi cabang.</p>
        </div>
      </Card>
    </div>
  );
};

export default BusPage;
