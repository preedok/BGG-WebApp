import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { adminPusatApi, branchesApi } from '../../../services/api';

const ROLES = [
  { value: 'role_bus', label: 'Role Bus (Saudi)' },
  { value: 'role_hotel', label: 'Role Hotel (Saudi)' },
  { value: 'admin_cabang', label: 'Admin Cabang' }
];

const AdminPusatCreateUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('role_bus');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    branchesApi.list().then((r) => {
      if (r.data.success && r.data.data) setBranches(r.data.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Nama, email, dan password wajib diisi' });
      return;
    }
    if (role === 'admin_cabang' && !branchId) {
      setMessage({ type: 'error', text: 'Admin cabang wajib memilih cabang' });
      return;
    }
    setLoading(true);
    try {
      const body: any = { name: name.trim(), email: email.trim().toLowerCase(), password, role };
      if (role === 'admin_cabang') body.branch_id = branchId;
      await adminPusatApi.createUser(body);
      setMessage({ type: 'success', text: 'Akun berhasil dibuat' });
      setName('');
      setEmail('');
      setPassword('');
      setBranchId('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Gagal membuat akun' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buat Akun</h1>
        <p className="text-slate-600 mt-1">Buka akun untuk Role Bus, Role Hotel (Saudi), atau Admin Cabang</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`rounded-lg px-4 py-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" placeholder="email@contoh.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" placeholder="Min. 6 karakter" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {role === 'admin_cabang' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cabang</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Pilih cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>
          )}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Buat Akun'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminPusatCreateUserPage;
