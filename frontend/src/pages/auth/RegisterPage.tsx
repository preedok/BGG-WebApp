import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, MapPin, FileText, Globe } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ownersApi } from '../../services/api';
import { validateEmail } from '../../utils';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    address: '',
    operational_region: '',
    whatsapp: '',
    npwp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    if (!form.email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    const emailErr = validateEmail(form.email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await ownersApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        company_name: form.company_name.trim() || undefined,
        address: form.address.trim() || undefined,
        operational_region: form.operational_region.trim() || undefined,
        whatsapp: form.whatsapp.trim() || form.phone.trim() || undefined,
        npwp: form.npwp.trim() || undefined
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full backdrop-blur-xl bg-white/10 border-2 border-white/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Registrasi Berhasil</h2>
            <p className="text-slate-300 text-sm">
              Akun partner Anda telah dibuat. Silakan download MoU, tanda tangan, lalu upload melalui dashboard setelah login.
              Admin akan memverifikasi dan mengaktifkan akun Anda.
            </p>
            <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
              Ke halaman login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            ← Kembali ke login
          </Link>
        </div>
        <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Daftar Partner Owner</h1>
          <p className="text-slate-400 text-sm mb-6">
            Untuk travel yang belum terdaftar di Bintang Global Group. Yang sudah MoU tidak perlu daftar ulang.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Nama lengkap *</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" required className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email *</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@travel.com" required className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password * (min. 6 karakter)</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Telepon</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+62 812 ..." className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Nama perusahaan / travel</label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="company_name" value={form.company_name} onChange={handleChange} placeholder="PT / CV / Nama travel" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Alamat</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Alamat kantor" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Wilayah operasional</label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="operational_region" value={form.operational_region} onChange={handleChange} placeholder="Contoh: Jawa Timur, DKI Jakarta" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">WhatsApp</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Nomor WhatsApp" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">NPWP</label>
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="npwp" value={form.npwp} onChange={handleChange} placeholder="Nomor NPWP (opsional)" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>

          <p className="mt-4 text-center text-slate-400 text-xs">
            Sudah punya akun? <Link to="/login" className="text-emerald-400 hover:underline">Masuk</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
