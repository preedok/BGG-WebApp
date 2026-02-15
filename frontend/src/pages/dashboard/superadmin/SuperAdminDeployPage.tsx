import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

/** Halaman Deploy telah dihapus. Redirect ke dashboard. */
export const SuperAdminDeployPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card className="p-8 text-center">
      <p className="text-slate-600 mb-4">Fitur deploy tidak lagi tersedia.</p>
      <Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
    </Card>
  );
};

export default SuperAdminDeployPage;
