import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { branchesApi, type Branch, type BranchCreateBody } from '../../../services/api';
import { TableColumn } from '../../../types';

const BranchesPage: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BranchCreateBody & { create_admin_account?: { name: string; email: string; password: string } }>({
    code: '',
    name: '',
    city: '',
    region: '',
    manager_name: '',
    phone: '',
    email: '',
    address: '',
    create_admin_account: undefined
  });
  const [createWithAccount, setCreateWithAccount] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canCreateBranch = user?.role === 'super_admin' || user?.role === 'admin_pusat';

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await branchesApi.list();
      if (res.data.success && res.data.data) setBranches(res.data.data);
    } catch {
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      code: '',
      name: '',
      city: '',
      region: '',
      manager_name: '',
      phone: '',
      email: '',
      address: '',
      create_admin_account: undefined
    });
    setCreateWithAccount(false);
    setModalOpen(true);
    setMessage(null);
  };

  const openEdit = (b: Branch) => {
    setEditingId(b.id);
    setForm({
      code: b.code,
      name: b.name,
      city: b.city,
      region: b.region || '',
      manager_name: b.manager_name || '',
      phone: b.phone || '',
      email: b.email || '',
      address: b.address || ''
    });
    setModalOpen(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);
    try {
      if (editingId) {
        await branchesApi.update(editingId, {
          code: form.code,
          name: form.name,
          city: form.city,
          region: form.region || undefined,
          manager_name: form.manager_name || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined
        });
        setMessage({ type: 'success', text: 'Cabang berhasil diperbarui' });
      } else {
        const body: BranchCreateBody = {
          code: form.code,
          name: form.name,
          city: form.city,
          region: form.region || undefined,
          manager_name: form.manager_name || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined
        };
        if (createWithAccount && form.create_admin_account?.name && form.create_admin_account?.email && form.create_admin_account?.password) {
          body.create_admin_account = {
            name: form.create_admin_account.name,
            email: form.create_admin_account.email,
            password: form.create_admin_account.password
          };
        }
        await branchesApi.create(body);
        setMessage({ type: 'success', text: body.create_admin_account ? 'Cabang dan akun admin cabang berhasil dibuat' : 'Cabang berhasil dibuat' });
        setModalOpen(false);
        fetchBranches();
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Gagal menyimpan' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const tableColumns: TableColumn[] = [
    { id: 'code', label: 'Kode', align: 'left' },
    { id: 'name', label: 'Nama Cabang', align: 'left' },
    { id: 'location', label: 'Lokasi', align: 'left' },
    { id: 'manager', label: 'Manager', align: 'left' },
    { id: 'contact', label: 'Kontak', align: 'left' },
    { id: 'status', label: 'Status', align: 'center' },
    ...(canCreateBranch ? [{ id: 'actions', label: 'Aksi', align: 'center' as const }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Cabang</h1>
          <p className="text-slate-600 mt-1">Daftar cabang dan buka cabang baru beserta akun admin cabang</p>
        </div>
        {canCreateBranch && (
          <Button variant="primary" onClick={openCreate}><Plus className="w-5 h-5 mr-2" />Tambah Cabang</Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Cabang</p>
              <p className="text-2xl font-bold text-slate-900">{branches.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <p className="text-slate-500 py-8 text-center">Memuat...</p>
        ) : (
          <Table
            columns={tableColumns}
            data={branches}
            renderRow={(branch: Branch) => (
              <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono text-sm">{branch.code}</code>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{branch.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-semibold">{branch.city}</p>
                      {branch.region && <p className="text-xs text-slate-500">{branch.region}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{branch.manager_name || '-'}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm text-slate-700">
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {branch.phone}
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {branch.email}
                      </div>
                    )}
                    {!branch.phone && !branch.email && '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={branch.is_active !== false ? 'success' : 'error'}>
                    {branch.is_active !== false ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                {canCreateBranch && (
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button type="button" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={() => openEdit(branch)}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )}
          />
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Edit Cabang' : 'Tambah Cabang'}</h3>
            {message && (
              <div className={`mb-4 rounded-lg px-4 py-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required disabled={!!editingId} placeholder="Contoh: JKT-01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Cabang</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                <input type="text" value={form.region || ''} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
                <input type="text" value={form.manager_name || ''} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                <input type="text" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={2} />
              </div>

              {!editingId && canCreateBranch && (
                <>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="createAccount" checked={createWithAccount} onChange={(e) => setCreateWithAccount(e.target.checked)} />
                    <label htmlFor="createAccount" className="text-sm text-slate-700">Buat akun admin cabang untuk cabang ini</label>
                  </div>
                  {createWithAccount && (
                    <div className="space-y-3 pl-6 border-l-2 border-slate-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama admin</label>
                        <input type="text" value={form.create_admin_account?.name ?? ''} onChange={(e) => setForm({ ...form, create_admin_account: { name: e.target.value, email: form.create_admin_account?.email ?? '', password: form.create_admin_account?.password ?? '' } })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Nama lengkap" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email admin</label>
                        <input type="email" value={form.create_admin_account?.email ?? ''} onChange={(e) => setForm({ ...form, create_admin_account: { name: form.create_admin_account?.name ?? '', email: e.target.value, password: form.create_admin_account?.password ?? '' } })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="email@contoh.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password admin</label>
                        <input type="password" value={form.create_admin_account?.password ?? ''} onChange={(e) => setForm({ ...form, create_admin_account: { name: form.create_admin_account?.name ?? '', email: form.create_admin_account?.email ?? '', password: e.target.value } })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Min. 6 karakter" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>{submitLoading ? 'Menyimpan...' : editingId ? 'Simpan' : 'Buat Cabang'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
