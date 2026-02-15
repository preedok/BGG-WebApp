import React, { useState, useEffect } from 'react';
import { Palette, Type, Layout, RefreshCw } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { superAdminApi } from '../../../services/api';
import { useAppSettings } from '../../../contexts/AppSettingsContext';

export const SuperAdminAppearancePage: React.FC = () => {
  const { settings, refresh } = useAppSettings();
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({
    primary_color: settings.primary_color,
    background_color: settings.background_color,
    text_color: settings.text_color,
    font_size: settings.font_size,
    ui_template: settings.ui_template
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      primary_color: settings.primary_color || '#059669',
      background_color: settings.background_color || '#f8fafc',
      text_color: settings.text_color || '#0f172a',
      font_size: settings.font_size || '14',
      ui_template: settings.ui_template || 'default'
    });
  }, [settings.primary_color, settings.background_color, settings.text_color, settings.font_size, settings.ui_template]);

  useEffect(() => {
    superAdminApi.listTemplates()
      .then((res) => res.data.success && setTemplates(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await superAdminApi.updateSettings(form);
      await refresh();
      alert('Tampilan berhasil disimpan. Perubahan berlaku untuk semua pengguna.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const activateTemplate = async (id: string) => {
    try {
      await superAdminApi.activateTemplate(id);
      setForm((f) => ({ ...f, ui_template: templates.find((t) => t.id === id)?.code || f.ui_template }));
      await refresh();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">App Appearance</h1>
      <p className="text-slate-600">Ubah warna, ukuran teks, dan template layout aplikasi. Perubahan berlaku untuk semua pengguna.</p>

      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5" /> Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
              />
              <input
                type="text"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Background</label>
            <div className="flex gap-2">
              <input type="color" className="w-12 h-10 rounded border border-slate-200 cursor-pointer" value={form.background_color} onChange={(e) => setForm((f) => ({ ...f, background_color: e.target.value }))} />
              <input type="text" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.background_color} onChange={(e) => setForm((f) => ({ ...f, background_color: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Text color</label>
            <div className="flex gap-2">
              <input type="color" className="w-12 h-10 rounded border border-slate-200 cursor-pointer" value={form.text_color} onChange={(e) => setForm((f) => ({ ...f, text_color: e.target.value }))} />
              <input type="text" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.text_color} onChange={(e) => setForm((f) => ({ ...f, text_color: e.target.value }))} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Type className="w-5 h-5" /> Typography</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Base font size (px)</label>
          <input
            type="number"
            min="12"
            max="20"
            className="border border-slate-200 rounded-lg px-3 py-2 w-24"
            value={form.font_size}
            onChange={(e) => setForm((f) => ({ ...f, font_size: e.target.value }))}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Layout className="w-5 h-5" /> UI Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                t.is_active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm text-slate-600">{t.description}</p>
                </div>
                {!t.is_active && (
                  <Button size="sm" variant="outline" onClick={() => activateTemplate(t.id)}>Use</Button>
                )}
                {t.is_active && <span className="text-sm text-emerald-600 font-medium">Active</span>}
              </div>
            </div>
          ))}
        </div>
        {templates.length === 0 && <p className="text-slate-500 text-sm">No templates. Run backend seed or add in database.</p>}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save appearance'}</Button>
      </div>
    </div>
  );
};

export default SuperAdminAppearancePage;
