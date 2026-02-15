import React from 'react';
import { FileText } from 'lucide-react';
import Card from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import VisaWorkPage from './VisaWorkPage';

const VisaPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'role_visa') {
    return <VisaWorkPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Visa</h1>
        <p className="text-slate-600 mt-1">Penerbitan visa (Nusuk) & dokumen visa jamaah</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Menu Visa</h3>
          <p className="text-slate-600">Untuk mengelola order visa dan penerbitan visa (sistem Nusuk), login sebagai role Visa cabang.</p>
        </div>
      </Card>
    </div>
  );
};

export default VisaPage;
