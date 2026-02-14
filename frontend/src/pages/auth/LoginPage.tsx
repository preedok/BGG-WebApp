import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_PASSWORD, mockUsers } from '../../data';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { validateEmail, isValidEmail } from '../../utils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi');
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = (email: string) => {
    setFormData({
      email,
      password: DEFAULT_PASSWORD
    });
    setError('');
  };

  // Get demo accounts from mock data
  const demoAccounts = mockUsers
    .filter(user => ['super_admin', 'admin_pusat', 'admin_cabang', 'role_invoice', 'owner'].includes(user.role))
    .slice(0, 5)
    .map(user => ({
      email: user.email,
      role: user.name,
      color: user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
             user.role === 'admin_pusat' ? 'bg-blue-100 text-blue-700' :
             user.role === 'admin_cabang' ? 'bg-cyan-100 text-cyan-700' :
             user.role === 'role_invoice' ? 'bg-yellow-100 text-yellow-700' :
             'bg-emerald-100 text-emerald-700'
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-600 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Bintang Global</h1>
              <p className="text-emerald-100">Travel Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight">
            Platform B2B untuk<br />Travel Umroh Terbaik
          </h2>

          <p className="text-emerald-100 text-lg leading-relaxed">
            Sistem terintegrasi untuk mengelola hotel, visa, tiket, handling, dan paket umroh
            dengan mudah dan efisien.
          </p>

          <div className="flex flex-wrap gap-3">
            {['Multi-Currency', 'Real-time Pricing', 'Role-based Access', 'Smart Analytics'].map((feature) => (
              <div
                key={feature}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/95">
            <div className="text-center mb-6">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <Globe className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl font-bold text-slate-900">Bintang Global</h1>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Login</h2>
              <p className="text-slate-600 mt-2">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                icon={<Mail className="w-5 h-5" />}
                fullWidth
                disabled={isSubmitting}
                error={error && !isValidEmail(formData.email) ? 'Email tidak valid' : undefined}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  fullWidth
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Lupa password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                icon={<LogIn className="w-5 h-5" />}
              >
                {isSubmitting ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Belum punya akun?{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Daftar sebagai Partner
                </a>
              </p>
            </div>
          </Card>

          {/* Demo Accounts */}
          <Card className="backdrop-blur-sm bg-white/95" padding="sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              🔐 Demo Accounts (Password: {DEFAULT_PASSWORD})
            </p>
            <p className="text-xs text-slate-500 mb-3">Klik email untuk auto-fill</p>

            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => quickLogin(account.email)}
                  className="w-full px-3 py-2 flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${account.color}`}>
                    {account.role}
                  </span>
                  <span className="text-xs text-slate-600 truncate ml-2">{account.email}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;