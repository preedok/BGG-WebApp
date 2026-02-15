import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { superAdminApi } from '../../../services/api';

const LOCALES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية (Saudi Arabia)', flag: '🇸🇦' }
];

export const SuperAdminLanguagePage: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState('id');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    superAdminApi.getSettings()
      .then((res) => res.data.success && res.data.data?.locale && setCurrentLocale(res.data.data.locale))
      .catch(() => {});
  }, []);

  const setLocale = async (code: string) => {
    setSaving(true);
    try {
      await superAdminApi.updateSettings({ locale: code });
      setCurrentLocale(code);
      window.location.reload();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update language');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Language / Bahasa</h1>
      <p className="text-slate-600">Pilih bahasa aplikasi untuk semua pengguna: English, Indonesia, atau العربية (Arab Saudi).</p>

      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Select language</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => setLocale(loc.code)}
              disabled={saving}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                currentLocale === loc.code
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-3xl mb-2 block">{loc.flag}</span>
              <p className="font-bold text-slate-900">{loc.name}</p>
              <p className="text-sm text-slate-500 mt-1">{currentLocale === loc.code ? '✓ Current' : 'Click to apply'}</p>
            </button>
          ))}
        </div>
        {saving && <p className="text-sm text-slate-500 mt-4">Updating...</p>}
      </Card>
    </div>
  );
};

export default SuperAdminLanguagePage;
