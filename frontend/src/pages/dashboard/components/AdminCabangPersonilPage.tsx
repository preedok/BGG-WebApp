import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { adminCabangApi } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';

const ROLE_OPTIONS = [
  { value: 'role_hotel', label: 'Role Hotel' },
  { value: 'role_visa', label: 'Role Visa' },
  { value: 'role_ticket', label: 'Role Tiket' },
  { value: 'role_bus', label: 'Role Bus' },
  { value: 'role_accounting', label: 'Role Accounting' }
];

const AdminCabangPersonilPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('role_hotel');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Nama, email, dan password wajib diisi.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }
    setLoading(true);
    try {
      await adminCabangApi.createUser({ name: name.trim(), email: email.trim(), password, role });
      showToast('Akun personil berhasil dibuat.', 'success');
      setName('');
      setEmail('');
      setPassword('');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal membuat akun', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Personil Cabang</h1>
          <p className="text-slate-600 mt-1">Buat akun baru untuk role yang bekerja di cabang Anda</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              placeholder="Min. 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" /> {loading ? 'Membuat...' : 'Buat Akun'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/users')}>
              Lihat Daftar User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCabangPersonilPage;
