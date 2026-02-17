import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, MapPin, FileText, Globe } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ownersApi, branchesApi, type Branch } from '../../services/api';
import { validateEmail } from '../../utils';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    address: '',
    preferred_branch_id: '',
    operational_region: '',
    whatsapp: '',
    npwp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    branchesApi.listPublic({ limit: 600 })
      .then((res) => { if (res.data?.data) setBranches(res.data.data); })
      .catch(() => {})
      .finally(() => setBranchesLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'preferred_branch_id' && value) {
      const b = branches.find((x) => x.id === value);
      if (b) setForm((f) => ({ ...f, preferred_branch_id: value, operational_region: b.region || f.operational_region }));
    }
    setError('');
  };

  const selectedBranch = form.preferred_branch_id ? branches.find((b) => b.id === form.preferred_branch_id) : null;

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
        preferred_branch_id: form.preferred_branch_id || undefined,
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

  const inputClass = 'w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50';
  const labelClass = 'block text-xs font-medium text-slate-300 mb-0.5';
  const fieldClass = 'relative';

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-2rem)] max-h-[900px]">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Kembali ke login
          </Link>
          <span className="text-slate-500 text-xs">Sudah punya akun? <Link to="/login" className="text-emerald-400 hover:underline">Masuk</Link></span>
        </div>
        <Card padding="none" className="backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-2xl flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">Daftar Partner Owner</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Untuk travel yang belum terdaftar di Bintang Global Group
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
            {error && (
              <div className="mb-3 p-2.5 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2.5">
                <div className={fieldClass}>
                  <label className={labelClass}>Nama lengkap *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" required className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@travel.com" required className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Password * (min. 6)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Telepon</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+62 812 ..." className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Nomor WhatsApp" className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>NPWP</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="npwp" value={form.npwp} onChange={handleChange} placeholder="Opsional" className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Perusahaan / travel</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="company_name" value={form.company_name} onChange={handleChange} placeholder="PT / CV / Nama travel" className={inputClass} />
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Alamat</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                    <textarea name="address" value={form.address} onChange={handleChange} rows={1} placeholder="Alamat kantor" className={`${inputClass} py-2 min-h-[38px] resize-none overflow-hidden`} />
                  </div>
                </div>
                <div className={`${fieldClass} sm:col-span-2 lg:col-span-1`}>
                  <label className={labelClass}>Kabupaten/kota *</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <select name="preferred_branch_id" value={form.preferred_branch_id} onChange={handleChange} required className={inputClass}>
                      <option value="" className="bg-slate-800 text-white">Pilih kabupaten operasional</option>
                      {branchesLoading ? (
                        <option className="bg-slate-800">Memuat...</option>
                      ) : (
                        branches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-slate-800 text-white">
                            {b.name} ({b.region})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {selectedBranch && (
                    <div className="mt-1.5 px-2 py-1.5 bg-white/5 rounded border border-white/10 text-xs text-slate-300 space-y-0.5">
                      <p><span className="text-slate-500">Provinsi:</span> {selectedBranch.region}</p>
                      <p><span className="text-slate-500">Koord.</span> {selectedBranch.koordinator_provinsi || '-'} {selectedBranch.koordinator_provinsi_phone && <span className="text-slate-500">· {selectedBranch.koordinator_provinsi_phone}</span>}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={loading} className="w-full py-2.5 text-sm font-medium">
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
