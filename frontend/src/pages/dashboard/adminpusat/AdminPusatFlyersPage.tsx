import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Send } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { adminPusatApi, type FlyerTemplate } from '../../../services/api';

const AdminPusatFlyersPage: React.FC = () => {
  const [flyers, setFlyers] = useState<FlyerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPublished, setFilterPublished] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'product' as 'product' | 'package', product_id: '', design_content: '' });

  const fetchFlyers = async () => {
    setLoading(true);
    try {
      const params = filterPublished !== '' ? { is_published: filterPublished } : {};
      const res = await adminPusatApi.listFlyers(params);
      if (res.data.success && res.data.data) setFlyers(res.data.data);
    } catch {
      setFlyers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlyers();
  }, [filterPublished]);

  const handleCreate = () => {
    setEditingId(null);
    setForm({ name: '', type: 'product', product_id: '', design_content: '' });
    setModalOpen(true);
  };

  const handleEdit = (f: FlyerTemplate) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      type: f.type,
      product_id: f.product_id || '',
      design_content: f.design_content || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminPusatApi.updateFlyer(editingId, { name: form.name, type: form.type, product_id: form.product_id || undefined, design_content: form.design_content });
      } else {
        await adminPusatApi.createFlyer({ name: form.name, type: form.type, product_id: form.product_id || undefined, design_content: form.design_content });
      }
      setModalOpen(false);
      fetchFlyers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus flyer ini?')) return;
    try {
      await adminPusatApi.deleteFlyer(id);
      fetchFlyers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menghapus');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminPusatApi.publishFlyer(id);
      fetchFlyers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal meluncurkan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flyer & Template</h1>
          <p className="text-slate-600 mt-1">Design flyer atau template product/paket; luncurkan agar semua role bisa melihat</p>
        </div>
        <Button variant="primary" onClick={handleCreate}><Plus className="w-5 h-5 mr-2" />Buat Flyer</Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
        {loading ? (
          <p className="text-slate-500 py-8 text-center">Memuat...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flyers.map((f) => (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{f.name}</h3>
                    <Badge variant={f.is_published ? 'success' : 'warning'} size="sm">{f.is_published ? 'Published' : 'Draft'}</Badge>
                    <p className="text-xs text-slate-500 mt-1">{f.type} {f.Product ? ` · ${f.Product.name}` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(f)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                  {!f.is_published && (
                    <Button variant="primary" size="sm" onClick={() => handlePublish(f.id)}><Send className="w-4 h-4 mr-1" />Launch</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(f.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {!loading && flyers.length === 0 && <p className="text-slate-500 py-8 text-center">Belum ada flyer. Klik &quot;Buat Flyer&quot; untuk menambah.</p>}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Edit Flyer' : 'Buat Flyer'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'product' | 'package' })} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="product">Product</option>
                  <option value="package">Package</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Konten design (HTML/teks)</label>
                <textarea value={form.design_content} onChange={(e) => setForm({ ...form, design_content: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 h-32" placeholder="HTML atau JSON design..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPusatFlyersPage;
