import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe, LogIn, AlertCircle, Plane, Users, Building2, Receipt, FileText, Bus, BarChart3, DollarSign, Hotel } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'login' | 'demo'>('login');

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

  // Get all demo accounts with complete roles
  const demoAccounts = [
    { email: 'superadmin@bintangglobal.com', role: 'Super Admin', icon: <Building2 className="w-4 h-4" />, color: 'from-red-500 to-rose-600' },
    { email: 'adminpusat@bintangglobal.com', role: 'Admin Pusat', icon: <Building2 className="w-4 h-4" />, color: 'from-blue-500 to-cyan-600' },
    { email: 'admincabang.surabaya@bintangglobal.com', role: 'Admin Cabang', icon: <Building2 className="w-4 h-4" />, color: 'from-cyan-500 to-teal-600' },
    { email: 'invoice@bintangglobal.com', role: 'Staff Invoice', icon: <Receipt className="w-4 h-4" />, color: 'from-yellow-500 to-orange-600' },
    { email: 'hotel@bintangglobal.com', role: 'Staff Hotel', icon: <Hotel className="w-4 h-4" />, color: 'from-purple-500 to-pink-600' },
    { email: 'visa@bintangglobal.com', role: 'Staff Visa', icon: <FileText className="w-4 h-4" />, color: 'from-indigo-500 to-blue-600' },
    { email: 'bus@bintangglobal.com', role: 'Staff Bus', icon: <Bus className="w-4 h-4" />, color: 'from-orange-500 to-red-600' },
    { email: 'ticket@bintangglobal.com', role: 'Staff Ticket', icon: <Plane className="w-4 h-4" />, color: 'from-pink-500 to-rose-600' },
    { email: 'accounting@bintangglobal.com', role: 'Staff Accounting', icon: <BarChart3 className="w-4 h-4" />, color: 'from-emerald-500 to-green-600' },
    { email: 'owner@example.com', role: 'Travel Owner', icon: <DollarSign className="w-4 h-4" />, color: 'from-emerald-600 to-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-opacity='0.1' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding with Travel Theme */}
          <div className="text-white space-y-8 hidden lg:block animate-fadeInLeft">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Globe className="w-12 h-12 text-white animate-spin-slow" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  Bintang Global
                </h1>
                <p className="text-emerald-200 text-lg mt-1">Travel Management System</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Platform B2B<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Travel Umroh
                </span><br />
                Terpercaya #1
              </h2>

              <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                Sistem terintegrasi untuk mengelola hotel, visa, tiket, handling, dan paket umroh
                dengan mudah, cepat, dan efisien.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: <DollarSign className="w-5 h-5" />, text: 'Multi-Currency' },
                { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-time Analytics' },
                { icon: <Users className="w-5 h-5" />, text: 'Role-based Access' },
                { icon: <Plane className="w-5 h-5" />, text: 'Smart Booking' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-emerald-400 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { value: '500+', label: 'Travel Partners' },
                { value: '50K+', label: 'Jamaah Terlayani' },
                { value: '99.8%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="text-center space-y-1">
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Tabbed Login/Demo */}
          <div className="animate-fadeInRight">
            <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Bintang Global</h1>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-300">Masuk ke akun Anda untuk melanjutkan</p>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Login Form</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === 'demo'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Demo Accounts</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {activeTab === 'login' ? (
                  <div className="animate-fadeIn">
                    {error && (
                      <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl flex items-start space-x-3 backdrop-blur-sm animate-shake">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200 font-medium">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Email</label>
                        <div className="relative">
                          <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Password</label>
                        <div className="relative">
                          <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-white/30 bg-white/10 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Remember me</span>
                        </label>
                        <a href="#" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                          Lupa password?
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-base shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <LogIn className="w-5 h-5" />
                          <span>{isSubmitting ? 'Memproses...' : 'Login to Dashboard'}</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-slate-300 text-sm">
                        Belum punya akun?{' '}
                        <a href="#" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                          Daftar sebagai Partner
                        </a>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-white flex items-center space-x-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span>🔐 Demo Accounts</span>
                        </p>
                        <span className="text-xs text-slate-400 bg-white/10 px-3 py-1.5 rounded-full">
                          Password: {DEFAULT_PASSWORD}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Klik untuk auto-fill credentials dan login</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                      {demoAccounts.map((account, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            quickLogin(account.email);
                            setActiveTab('login');
                          }}
                          className="group relative overflow-hidden p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 text-left border border-white/10 hover:border-white/30 hover:scale-105"
                          style={{
                            animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                          }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${account.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          <div className="relative z-10 space-y-2">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${account.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                              {account.icon}
                            </div>
                            <p className="text-sm font-bold text-white truncate">{account.role}</p>
                            <p className="text-[10px] text-slate-400 truncate">{account.email}</p>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <LogIn className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <p className="text-xs text-emerald-300 text-center">
                        💡 Tip: Klik salah satu akun untuk mengisi form login secara otomatis
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;