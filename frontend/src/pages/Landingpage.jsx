import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🏨',
      title: 'Hotel Management',
      description: 'Real-time availability management untuk hotel di Mekkah dan Madinah dengan kontrol kuota otomatis',
      color: '#FFB84D'
    },
    {
      icon: '📋',
      title: 'Smart Invoicing',
      description: 'Sistem invoice otomatis dengan status tentative, definite, dan lunas. Support multiple payment uploads',
      color: '#FF6B9D'
    },
    {
      icon: '🎫',
      title: 'Multi-Product',
      description: 'Kelola visa, tiket pesawat, bus, handling, dan paket makan dalam satu platform terintegrasi',
      color: '#6B8EFF'
    },
    {
      icon: '📦',
      title: 'Package Bundling',
      description: 'Buat paket promo fleksibel dengan automatic package design generator dan margin otomatis',
      color: '#4ECDC4'
    },
    {
      icon: '🏢',
      title: 'Multi-Branch',
      description: 'Kelola cabang di Sumatra, Jabodetabek, Jawa Barat, Makassar, Surabaya dengan role-based access',
      color: '#A06CD5'
    },
    {
      icon: '💰',
      title: 'Financial Control',
      description: 'Manajemen kurs, credit balance, negosiasi harga khusus, dan laporan keuangan otomatis',
      color: '#FF8C42'
    }
  ];

  const services = [
    { name: 'Hotel Booking', desc: 'Mekkah & Madinah', icon: '🕌' },
    { name: 'Visa Processing', desc: 'Paket Lengkap', icon: '🛂' },
    { name: 'Flight Tickets', desc: 'International', icon: '✈️' },
    { name: 'Bus Services', desc: 'Smart Capacity', icon: '🚌' },
    { name: 'Handling', desc: 'Professional', icon: '🤝' },
    { name: 'Meal Packages', desc: 'Halal Certified', icon: '🍽️' }
  ];

  const stats = [
    { value: '500K+', label: 'Jamaah Dilayani', icon: '👥' },
    { value: '200+', label: 'Mitra Travel', icon: '🤝' },
    { value: '50+', label: 'Hotel Partner', icon: '🏨' },
    { value: '99.8%', label: 'Success Rate', icon: '⭐' }
  ];

  const roles = [
    { role: 'Super Admin', desc: 'Full system access & monitoring', color: '#FF6B6B' },
    { role: 'Admin Pusat', desc: 'Master data & policy control', color: '#4ECDC4' },
    { role: 'Admin Cabang', desc: 'Branch operations management', color: '#FFD93D' },
    { role: 'Invoice', desc: 'Order & payment validation', color: '#6BCF7F' },
    { role: 'Handling', desc: 'Room assignment & updates', color: '#A06CD5' },
    { role: 'Visa', desc: 'Visa processing & packages', color: '#FF8C42' },
    { role: 'Bus', desc: 'Fleet & capacity management', color: '#4E9FFF' },
    { role: 'Ticket', desc: 'Flight booking & seats', color: '#FF6B9D' },
    { role: 'Accounting', desc: 'Finance & reporting', color: '#95E1D3' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .playfair {
          font-family: 'Playfair Display', serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(78, 237, 196, 0.3); }
          50% { box-shadow: 0 0 40px rgba(78, 237, 196, 0.6), 0 0 60px rgba(78, 237, 196, 0.3); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #4ECDC4 0%, #FFD93D 50%, #FF6B9D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 60px rgba(78, 237, 196, 0.3);
        }

        .noise-bg {
          position: relative;
        }

        .noise-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
        }

        .mesh-gradient {
          background: 
            radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.15) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.15) 0px, transparent 50%),
            radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.15) 0px, transparent 50%),
            radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.15) 0px, transparent 50%),
            radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.15) 0px, transparent 50%);
        }

        .scroll-indicator {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none"></div>
      <div className="fixed inset-0 noise-bg pointer-events-none"></div>

      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-effect shadow-2xl' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slideInLeft">
              <img 
                src="/logo-bintang-global.png" 
                alt="Bintang Global Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold playfair">Bintang Global Group</h1>
                <p className="text-xs text-gray-400">Enterprise B2B Platform</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <a href="#features" className="hover:text-emerald-400 transition-colors duration-300">Features</a>
              <a href="#services" className="hover:text-emerald-400 transition-colors duration-300">Services</a>
              <a href="#roles" className="hover:text-emerald-400 transition-colors duration-300">Roles</a>
              <a href="#tech" className="hover:text-emerald-400 transition-colors duration-300">Technology</a>
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 animate-slideInRight">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 glass-effect rounded-full text-sm font-medium animate-fadeInUp">
                ✨ Trusted by 200+ Travel Partners
              </div>
              <h1 className="text-6xl md:text-7xl font-black playfair leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Transform Your
                <span className="gradient-text block">Umroh Business</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Platform enterprise B2B terintegrasi untuk mengelola hotel, visa, tiket, bus, dan paket umroh dengan sistem otomatis dan kontrol penuh.
              </p>
              <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                  Start Free Trial
                </button>
                <button className="px-8 py-4 glass-effect rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-slate-900"></div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
                  <p className="text-sm text-gray-400">Rated 4.9/5 by partners</p>
                </div>
              </div>
            </div>
            <div className="relative animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="relative glass-effect rounded-3xl p-8 card-hover">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20 blur-xl"></div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-2xl">🏨</div>
                      <div>
                        <p className="font-semibold">Hotel Availability</p>
                        <p className="text-sm text-gray-400">Real-time tracking</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold">Live</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">📋</div>
                      <div>
                        <p className="font-semibold">Smart Invoicing</p>
                        <p className="text-sm text-gray-400">Automated workflow</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">💰</div>
                      <div>
                        <p className="font-semibold">Financial Control</p>
                        <p className="text-sm text-gray-400">Multi-currency support</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">Pro</span>
                  </div>
                </div>
              </div>
              <div className="scroll-indicator absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm text-gray-400 mb-2">Scroll to explore</p>
                <div className="w-1 h-16 bg-gradient-to-b from-emerald-500 to-transparent mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 text-center card-hover animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-black playfair gradient-text mb-2">{stat.value}</div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-5xl font-black playfair mb-4">
              Fitur <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Platform lengkap dengan automasi penuh untuk mengelola bisnis umroh Anda
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`glass-effect rounded-2xl p-8 card-hover cursor-pointer animate-fadeInUp ${activeFeature === index ? 'ring-2 ring-emerald-500' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(78, 237, 196, 0.5))' }}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 playfair">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                <div className="mt-6 w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: activeFeature === index ? '100%' : '0%',
                      background: `linear-gradient(90deg, ${feature.color}, ${feature.color}dd)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-5xl font-black playfair mb-4">
              Layanan <span className="gradient-text">Terintegrasi</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Satu platform untuk semua kebutuhan umroh Anda
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 text-center card-hover animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-bold mb-1">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-5xl font-black playfair mb-4">
              Role-Based <span className="gradient-text">Access Control</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Sistem kontrol akses berbasis role untuk setiap level pengguna
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: role.color }}>
                    {role.role.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{role.role}</h3>
                    <p className="text-sm text-gray-400">{role.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Detail */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInLeft">
              <h2 className="text-5xl font-black playfair mb-6">
                Smart <span className="gradient-text">Business Logic</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📊</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Real-time Availability</h3>
                    <p className="text-gray-400">Kuota hotel, visa, tiket, dan bus terupdate otomatis setiap transaksi dengan sistem yang akurat</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💳</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Flexible Payment</h3>
                    <p className="text-gray-400">Support multiple payment uploads, credit balance system, dan auto-calculation untuk sisa tagihan</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Package Generator</h3>
                    <p className="text-gray-400">Automatic package design dengan konfigurasi harga, margin, dan kuota yang fleksibel</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🚌</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Bus Penalty System</h3>
                    <p className="text-gray-400">Auto-calculate penalty untuk kapasitas bus kurang atau lebih dari 35 orang</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-slideInRight">
              <div className="glass-effect rounded-3xl p-8 space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2">Invoice Workflow</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Tentative</span>
                    <span>→</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Definite</span>
                    <span>→</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Lunas</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2">Multi-Branch Coverage</h4>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {['Sumatra', 'Jabodetabek', 'Jawa Barat', 'Makassar', 'Surabaya', 'More...'].map((branch, i) => (
                      <div key={i} className="px-3 py-2 bg-white/5 rounded-lg text-sm text-center">{branch}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2">Financial Features</h4>
                  <ul className="space-y-2 mt-3 text-sm text-gray-300">
                    <li>✓ Manajemen kurs multi-currency</li>
                    <li>✓ Credit balance & refund system</li>
                    <li>✓ Custom price negotiation</li>
                    <li>✓ Automated financial reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-3xl p-12 text-center animate-fadeInUp">
            <h2 className="text-5xl font-black playfair mb-6">
              Ready to <span className="gradient-text">Transform</span> Your Business?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join 200+ travel partners yang telah mempercayai platform kami untuk mengelola bisnis umroh mereka
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                Request Demo
              </button>
              <button className="px-10 py-4 glass-effect rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
                Contact Sales
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ 24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-bintang-global.png" 
                  alt="Bintang Global Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="font-bold playfair text-lg">Bintang Global</span>
              </div>
              <p className="text-sm text-gray-400">
                Platform enterprise B2B terpercaya untuk bisnis umroh di Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 Bintang Global Group. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}