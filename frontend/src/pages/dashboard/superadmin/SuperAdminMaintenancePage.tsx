import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { superAdminApi } from '../../../services/api';

interface Notice {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  CreatedBy?: { name: string; email: string };
}

export const SuperAdminMaintenancePage: React.FC = () => {
  const [list, setList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState({ title: '', message: '', type: 'maintenance', is_active: true, starts_at: '', ends_at: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.listMaintenance();
      if (res.data.success) setList(res.data.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', message: '', type: 'maintenance', is_active: true, starts_at: '', ends_at: '' });
    setModalOpen(true);
  };

  const openEdit = (n: Notice) => {
    setEditing(n);
    setForm({
      title: n.title,
      message: n.message,
      type: n.type,
      is_active: n.is_active,
      starts_at: n.starts_at ? n.starts_at.slice(0, 16) : '',
      ends_at: n.ends_at ? n.ends_at.slice(0, 16) : ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editing) {
        await superAdminApi.updateMaintenance(editing.id, {
          title: form.title,
          message: form.message,
          type: form.type,
          is_active: form.is_active,
          starts_at: form.starts_at || null,
          ends_at: form.ends_at || null
        });
      } else {
        await superAdminApi.createMaintenance({
          title: form.title,
          message: form.message,
          type: form.type,
          starts_at: form.starts_at || undefined,
          ends_at: form.ends_at || undefined
        });
      }
      setModalOpen(false);
      fetchList();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pemberitahuan.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus pemberitahuan ini?')) return;
    try {
      await superAdminApi.deleteMaintenance(id);
      fetchList();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Maintenance & Notices</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Notice
        </Button>
      </div>

      <Card>
        <p className="text-sm text-slate-600 mb-4">Pemberitahuan pemeliharaan atau bug akan ditampilkan ke semua pengguna aplikasi.</p>
        {loading ? (
          <div className="py-8 text-center text-slate-500"><RefreshCw className="w-6 h-6 animate-spin inline" /></div>
        ) : list.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Belum ada pemberitahuan.</div>
        ) : (
          <div className="space-y-3">
            {list.map((n) => (
              <div key={n.id} className="p-4 border border-slate-200 rounded-xl flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{n.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${n.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {n.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="capitalize text-xs text-slate-500">{n.type}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {n.starts_at && `From: ${new Date(n.starts_at).toLocaleString()}`}
                    {n.ends_at && ` — Until: ${new Date(n.ends_at).toLocaleString()}`}
                    {n.CreatedBy && ` · By: ${n.CreatedBy.name}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(n)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(n.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editing ? 'Edit Notice' : 'New Notice'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 min-h-[100px]"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="bug">Bug</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              {editing && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                  <span className="text-sm">Active</span>
                </label>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Starts at (optional)</label>
                  <input type="datetime-local" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ends at (optional)</label>
                  <input type="datetime-local" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitLoading}>{submitLoading ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMaintenancePage;
