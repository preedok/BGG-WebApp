import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  CheckCircle,
  Globe,
  ShieldCheck,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  BarChart3,
  Lock,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Building2,
  Award,
  Heart,
  Plane,
  Hotel,
  FileText,
  Bus,
  ChevronLeft,
  Menu,
  X,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

// Type definitions
type Product = {
  id: string;
  name: string;
  category: 'hotel' | 'visa' | 'handling' | 'ticket' | 'bus';
  description: string;
  price: string;
  currency: string;
  features: string[];
  popular?: boolean;
};

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Data Products
  const products: Product[] = [
    {
      id: 'hotel-makkah',
      name: 'Hotel Mekkah Premium',
      category: 'hotel',
      description: 'Pilihan hotel berkualitas dekat Masjidil Haram',
      price: '250 - 450',
      currency: 'SAR',
      features: [
        'Jarak 100-500m dari Masjidil Haram',
        'AC & Breakfast included',
        'Free WiFi & Room Service',
        'Shuttle Bus tersedia'
      ],
      popular: true
    },
    {
      id: 'hotel-madinah',
      name: 'Hotel Madinah Premium',
      category: 'hotel',
      description: 'Hotel strategis dekat Masjid Nabawi',
      price: '200 - 380',
      currency: 'SAR',
      features: [
        'Walking distance ke Masjid Nabawi',
        'Full Board Meal',
        'City View Room',
        'Laundry Service'
      ]
    },
    {
      id: 'visa-umroh',
      name: 'Visa Umroh Processing',
      category: 'visa',
      description: 'Pengurusan visa umroh cepat dan terpercaya',
      price: '180 - 220',
      currency: 'USD',
      features: [
        'Proses 3-5 hari kerja',
        'Garansi approval',
        'Konsultasi gratis',
        'Document handling'
      ],
      popular: true
    },
    {
      id: 'handling',
      name: 'Handling & Tour Guide',
      category: 'handling',
      description: 'Pendampingan profesional selama ibadah',
      price: '80 - 120',
      currency: 'SAR',
      features: [
        'Tour Guide berpengalaman',
        'Koordinasi penuh',
        'Emergency 24/7',
        'Dokumentasi perjalanan'
      ]
    },
    {
      id: 'ticket',
      name: 'Tiket Pesawat',
      category: 'ticket',
      description: 'Booking tiket dengan harga kompetitif',
      price: '8.500.000 - 12.000.000',
      currency: 'IDR',
      features: [
        'Direct & Transit options',
        'Free baggage 30kg',
        'Flexible reschedule',
        'Travel insurance'
      ]
    },
    {
      id: 'bus-transport',
      name: 'Transportasi Bus',
      category: 'bus',
      description: 'Bus AC nyaman untuk perjalanan lokal',
      price: '40 - 60',
      currency: 'SAR',
      features: [
        'Bus AC Full',
        'Driver berpengalaman',
        'Seat comfortable',
        'On-time guarantee'
      ]
    }
  ];

  // Data Packages
  const packages = [
    {
      id: 'package-9d',
      name: 'Paket Umroh 9 Hari',
      duration: '9 Hari 7 Malam',
      price: 'Rp 18.500.000',
      originalPrice: 'Rp 21.000.000',
      description: 'Paket hemat untuk umroh pertama Anda',
      badge: 'BEST SELLER',
      image: '🕌',
      features: [
        '4 malam Mekkah (Hotel bintang 4)',
        '3 malam Madinah (Hotel bintang 4)',
        'Tiket pesawat PP Jakarta-Jeddah',
        'Visa umroh & handling'
      ],
      included: [
        'Hotel AC dengan breakfast',
        'Bus pariwisata AC',
        'Tour guide berbahasa Indonesia',
        'Ziarah kota Mekkah & Madinah',
        'Makan 3x sehari',
        'Air Zam-zam 5 liter'
      ]
    },
    {
      id: 'package-12d',
      name: 'Paket Umroh 12 Hari',
      duration: '12 Hari 10 Malam',
      price: 'Rp 23.500.000',
      originalPrice: 'Rp 26.500.000',
      description: 'Paket lengkap dengan waktu lebih leluasa',
      badge: 'RECOMMENDED',
      image: '⭐',
      features: [
        '6 malam Mekkah (Hotel bintang 4)',
        '4 malam Madinah (Hotel bintang 4)',
        'Tiket pesawat direct flight',
        'Premium handling service'
      ],
      included: [
        'Hotel premium dekat Haram',
        'Bus pariwisata full AC',
        'Tour guide bersertifikat',
        'City tour lengkap',
        'Makan 3x + snack',
        'Air Zam-zam 10 liter',
        'Souvenir eksklusif'
      ]
    },
    {
      id: 'package-16d',
      name: 'Paket Umroh 16 Hari',
      duration: '16 Hari 14 Malam',
      price: 'Rp 28.900.000',
      originalPrice: 'Rp 32.500.000',
      description: 'Paket premium untuk ibadah maksimal',
      badge: 'PREMIUM',
      image: '👑',
      features: [
        '8 malam Mekkah (Hotel bintang 5)',
        '6 malam Madinah (Hotel bintang 5)',
        'Direct flight business class option',
        'VIP handling & concierge'
      ],
      included: [
        'Hotel mewah view Haram',
        'Private bus eksklusif',
        'Tour guide expert + muthawif',
        'Extended ziarah program',
        'Full board dining',
        'Air Zam-zam 20 liter',
        'Oleh-oleh premium package',
        'Free photoshoot professional'
      ]
    }
  ];

  // Data Branches
  const branches = [
    {
      id: 'jakarta-pusat',
      name: 'Kantor Pusat Jakarta',
      city: 'Jakarta',
      address: 'Jl. Raya Condet No. 27, Jakarta Timur 13530',
      phone: '+62 21 8094 5678',
      email: 'jakarta@bintangglobal.com',
      manager: 'H. Ahmad Fauzi',
      coordinates: { lat: -6.2633, lng: 106.8667 }
    },
    {
      id: 'surabaya',
      name: 'Cabang Surabaya',
      city: 'Surabaya',
      address: 'Jl. Raya Darmo No. 135, Surabaya 60264',
      phone: '+62 31 5687 4321',
      email: 'surabaya@bintangglobal.com',
      manager: 'Hj. Siti Nurhaliza',
      coordinates: { lat: -7.2575, lng: 112.7521 }
    },
    {
      id: 'bandung',
      name: 'Cabang Bandung',
      city: 'Bandung',
      address: 'Jl. Soekarno Hatta No. 456, Bandung 40286',
      phone: '+62 22 5234 8765',
      email: 'bandung@bintangglobal.com',
      manager: 'H. Budi Santoso',
      coordinates: { lat: -6.9175, lng: 107.6191 }
    },
    {
      id: 'medan',
      name: 'Cabang Medan',
      city: 'Medan',
      address: 'Jl. Gatot Subroto No. 88, Medan 20235',
      phone: '+62 61 4567 8901',
      email: 'medan@bintangglobal.com',
      manager: 'Hj. Dewi Kartika',
      coordinates: { lat: 3.5952, lng: 98.6722 }
    },
    {
      id: 'makassar',
      name: 'Cabang Makassar',
      city: 'Makassar',
      address: 'Jl. A.P. Pettarani No. 92, Makassar 90222',
      phone: '+62 411 3456 789',
      email: 'makassar@bintangglobal.com',
      manager: 'H. Ridwan Kamil',
      coordinates: { lat: -5.1477, lng: 119.4327 }
    }
  ];

  // Data Testimonials
  const testimonials = [
    {
      id: '1',
      name: 'H. Ahmad Fadli',
      company: 'Al-Hijrah Travel & Tours',
      role: 'CEO & Founder',
      text: 'Sudah 3 tahun bekerja sama dengan Bintang Global Group. Sistem B2B mereka sangat memudahkan kami dalam mengelola jamaah. Harga kompetitif, pelayanan memuaskan, dan yang terpenting transparansi invoice sangat jelas. Highly recommended untuk travel partner!',
      rating: 5,
      avatar: 'AF',
      date: '2 minggu lalu'
    },
    {
      id: '2',
      name: 'Hj. Siti Nurhaliza',
      company: 'Barokah Tour & Travel',
      role: 'Direktur Operasional',
      text: 'Platform digital Bintang Global benar-benar game changer! Fitur invoice multi-currency dengan konversi otomatis sangat membantu kami. Tim handling mereka juga sangat profesional. Jamaah kami selalu puas dengan pelayanan yang diberikan.',
      rating: 5,
      avatar: 'SN',
      date: '1 bulan lalu'
    },
    {
      id: '3',
      name: 'H. Budi Santoso',
      company: 'Madinah Express Indonesia',
      role: 'Owner',
      text: 'Pelayanan terbaik yang pernah saya alami di industri travel umroh. Proses booking cepat, dokumentasi lengkap, dan customer service yang responsif 24/7. Kami sudah memberangkatkan lebih dari 500 jamaah bersama Bintang Global.',
      rating: 5,
      avatar: 'BS',
      date: '3 minggu lalu'
    },
    {
      id: '4',
      name: 'Hj. Dewi Kartika',
      company: 'Nusantara Haji & Umroh',
      role: 'Managing Director',
      text: 'Sistem role-based management sangat membantu koordinasi tim kami. Dari pemesanan hotel sampai handling, semuanya terintegrasi dengan baik. Dashboard analytics juga memberikan insight yang valuable untuk mengembangkan bisnis kami.',
      rating: 5,
      avatar: 'DK',
      date: '2 bulan lalu'
    }
  ];

  // Owner Info
  const ownerInfo = {
    name: 'H. Muhammad Rizki Ramadan',
    title: 'Founder & CEO',
    bio: 'Pengusaha muda yang berpengalaman lebih dari 15 tahun di industri travel umroh. Alumni Universitas Al-Azhar Cairo, Mesir. Berdedikasi untuk memberikan pelayanan umroh terbaik dengan teknologi modern.',
    experience: '15+ Tahun',
    jamaahServed: '50.000+ Jamaah',
    awards: [
      'Best Travel Umroh Provider 2023',
      'Digital Innovation Award 2022',
      'Customer Service Excellence 2021'
    ],
    quote: 'Memberikan pelayanan terbaik untuk ibadah terbaik adalah misi kami'
  };

  // Stats
  const stats = [
    { number: '500+', label: 'Travel Partners', icon: <Users className="w-6 h-6" /> },
    { number: '50K+', label: 'Jamaah Terlayani', icon: <Heart className="w-6 h-6" /> },
    { number: '99.8%', label: 'Satisfaction Rate', icon: <Star className="w-6 h-6" /> },
    { number: '24/7', label: 'Customer Support', icon: <MessageCircle className="w-6 h-6" /> }
  ];

  // Features
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Dynamic Pricing System",
      description: "Harga hotel, visa, dan paket yang selalu update real-time sesuai kondisi pasar"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Currency Invoice",
      description: "Sistem invoice otomatis dengan konversi SAR, USD ke IDR berdasarkan kurs terkini"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Secure Document Management",
      description: "Upload dan kelola dokumen jamaah dengan sistem keamanan berlapis"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart OCR Payment",
      description: "Deteksi otomatis nominal pembayaran dari bukti transfer yang di-upload"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Role-Based Management",
      description: "Sistem manajemen berbasis role untuk efisiensi operasional maksimal"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Comprehensive Analytics",
      description: "Dashboard analitik lengkap untuk monitoring performa bisnis Anda"
    }
  ];

  const scrollToSection = (sectionId: string): void => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const getProductIcon = (category: Product['category']): JSX.Element => {
    switch (category) {
      case 'hotel': return <Hotel className="w-6 h-6" />;
      case 'visa': return <FileText className="w-6 h-6" />;
      case 'handling': return <Users className="w-6 h-6" />;
      case 'ticket': return <Plane className="w-6 h-6" />;
      case 'bus': return <Bus className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5' : 'bg-white/80 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Bintang Global
                </h1>
                <p className="text-xs text-slate-500 -mt-0.5">Travel Management</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <button onClick={() => scrollToSection('products')} className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Products</button>
              <button onClick={() => scrollToSection('packages')} className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Packages</button>
              <button onClick={() => scrollToSection('branches')} className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Branches</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('contact')} className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">Contact</button>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors hidden sm:block"
              >
                Sign In
              </a>
              <button className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all duration-300">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 animate-fadeIn">
              <div className="flex flex-col space-y-3">
                <button onClick={() => scrollToSection('products')} className="text-left px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Products</button>
                <button onClick={() => scrollToSection('packages')} className="text-left px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Packages</button>
                <button onClick={() => scrollToSection('branches')} className="text-left px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Branches</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Testimonials</button>
                <button onClick={() => scrollToSection('contact')} className="text-left px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Contact</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeInUp">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 text-sm font-semibold">B2B Travel Platform Terpercaya</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Platform Terlengkap
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Untuk Bisnis
                </span>
                <br />
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Travel Umroh Anda
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Solusi B2B terpadu untuk owner travel umroh. Kelola hotel, visa, handling, tiket, dan paket umroh dengan sistem modern yang efisien dan transparan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center">
                    Mulai Sekarang
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  onClick={() => scrollToSection('packages')}
                  className="group bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-base border-2 border-slate-200 hover:border-emerald-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Lihat Paket
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {['bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-cyan-500'].map((color, i) => (
                    <div key={i} className={`w-10 h-10 ${color} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Dipercaya 500+ Travel Partners</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {/* Dashboard Preview Card */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 p-6 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">dashboard.bintangglobal.com</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Invoice #BGG-2024-001</p>
                          <p className="text-xs text-slate-500">Paket 12 Hari - 24 Jamaah</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">Rp 45.5M</p>
                        <p className="text-xs text-emerald-600">✓ Lunas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900">127</p>
                        <p className="text-xs text-emerald-600 mt-1">↗ +12%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">2.4B</p>
                        <p className="text-xs text-emerald-600 mt-1">↗ +8%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-700">Recent Activity</p>
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="space-y-2">
                        {['Hotel booking confirmed', 'Visa processed', 'Payment received'].map((activity, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-200/50 animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Security</p>
                      <p className="font-bold text-slate-900">100% Secure</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-200/50 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Processing</p>
                      <p className="font-bold text-slate-900">Real-time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </h3>
                <p className="text-slate-600 font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <Hotel className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-semibold">Our Products</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Layanan Lengkap untuk Anda
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Berbagai pilihan produk dan layanan umroh dengan harga terbaik dan kualitas terjamin
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-300 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-2"
              >
                {product.popular && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-600/30">
                    {getProductIcon(product.category)}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-emerald-600">{product.price}</span>
                      <span className="text-sm text-slate-500">{product.currency}</span>
                      {product.category === 'hotel' && <span className="text-xs text-slate-400">/malam</span>}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group">
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Paket Umroh</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Paket Umroh Terlengkap & Terpercaya
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Pilih paket umroh sesuai kebutuhan dengan harga terbaik dan fasilitas lengkap
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300 overflow-hidden group hover:scale-105 ${pkg.badge === 'RECOMMENDED'
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20'
                  : 'border-white/20 hover:border-emerald-500/50'
                  }`}
              >
                {pkg.badge && (
                  <div className={`absolute top-0 right-0 px-6 py-2 text-xs font-bold text-white rounded-bl-2xl ${pkg.badge === 'BEST SELLER' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    pkg.badge === 'RECOMMENDED' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
                      'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}>
                    {pkg.badge}
                  </div>
                )}

                <div className="p-8">
                  <div className="text-6xl mb-4">{pkg.image}</div>

                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-emerald-400 font-semibold mb-4">{pkg.duration}</p>
                  <p className="text-slate-300 text-sm mb-6">{pkg.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="text-3xl font-bold text-white">{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">{pkg.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400">Per orang (min. 20 jamaah)</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-white font-semibold text-sm">Highlight Paket:</p>
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <details className="mb-6">
                    <summary className="text-emerald-400 text-sm font-semibold cursor-pointer hover:text-emerald-300 transition-colors">
                      Lihat detail lengkap
                    </summary>
                    <div className="mt-4 space-y-2 pl-4">
                      {pkg.included.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2"></div>
                          <span className="text-slate-400 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </details>

                  <button className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${pkg.badge === 'RECOMMENDED'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-white text-slate-900 hover:bg-emerald-50'
                    }`}>
                    Pesan Paket Ini
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Promo */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                🎉 Promo Spesial Ramadan 2024
              </h3>
              <p className="text-xl text-emerald-100 mb-6">
                Diskon hingga <span className="text-3xl font-bold">15%</span> untuk pemesanan grup 30+ jamaah!
              </p>
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-xl">
                Hubungi Kami Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Teknologi Modern untuk Efisiensi Maksimal
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Platform B2B dengan fitur-fitur canggih yang memudahkan pengelolaan bisnis umroh Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-600/30">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-semibold">Our Branches</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Cabang di Seluruh Indonesia
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Kami hadir di berbagai kota besar untuk melayani Anda dengan lebih baik
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {branches.map((branch, index) => (
              <div
                key={branch.id}
                className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl cursor-pointer ${selectedBranch === index
                  ? 'border-emerald-500 shadow-lg shadow-emerald-600/10'
                  : 'border-slate-200 hover:border-emerald-300'
                  }`}
                onClick={() => setSelectedBranch(index)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{branch.name}</h3>
                    <p className="text-emerald-600 font-semibold">{branch.city}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{branch.address}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a href={`tel:${branch.phone}`} className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a href={`mailto:${branch.email}`} className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                      {branch.email}
                    </a>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Branch Manager</p>
                    <p className="text-sm font-semibold text-slate-900">{branch.manager}</p>
                  </div>
                </div>

                <button className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lihat di Maps</span>
                </button>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Interactive Map</p>
                <p className="text-sm text-slate-500 mt-1">Lihat lokasi semua cabang kami</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-16">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">Our Founder</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {ownerInfo.name}
                </h2>
                <p className="text-xl text-emerald-400 mb-6">{ownerInfo.title}</p>

                <p className="text-slate-300 leading-relaxed mb-8">
                  {ownerInfo.bio}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <p className="text-3xl font-bold text-white mb-1">{ownerInfo.experience}</p>
                    <p className="text-sm text-slate-400">Pengalaman</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <p className="text-3xl font-bold text-white mb-1">{ownerInfo.jamaahServed}</p>
                    <p className="text-sm text-slate-400">Jamaah Dilayani</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-white font-semibold">Penghargaan:</p>
                  {ownerInfo.awards.map((award, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span className="text-slate-300 text-sm">{award}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-500/20 border-l-4 border-emerald-500 p-4 rounded-lg">
                  <p className="text-emerald-100 italic">
                    "{ownerInfo.quote}"
                  </p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  {/* Avatar Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-6xl font-bold text-white">MR</span>
                      </div>
                      <p className="text-white text-2xl font-bold">Founder & CEO</p>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/30 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal-500/30 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-semibold">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dipercaya oleh Profesional Travel
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Apa kata para owner travel yang telah menggunakan platform kami
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`p-12 transition-all duration-500 ${index === activeTestimonial ? 'block' : 'hidden'
                    }`}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-600/30">
                      {testimonial.avatar}
                    </div>

                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-xl text-slate-700 leading-relaxed max-w-3xl italic">
                      "{testimonial.text}"
                    </p>

                    <div>
                      <p className="font-bold text-slate-900 text-xl">{testimonial.name}</p>
                      <p className="text-emerald-600 font-semibold">{testimonial.role}</p>
                      <p className="text-slate-600 text-sm">{testimonial.company}</p>
                      <p className="text-slate-400 text-xs mt-2">{testimonial.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${index === activeTestimonial
                    ? 'bg-emerald-600 w-8 h-3'
                    : 'bg-slate-300 hover:bg-slate-400 w-3 h-3'
                    }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 lg:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:shadow-2xl transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 lg:translate-x-12 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:shadow-2xl transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Siap Untuk Meningkatkan Bisnis Umroh Anda?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ratusan travel partner yang telah mempercayai kami untuk mengelola bisnis mereka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-base shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center justify-center">
                Daftar Sebagai Partner
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="bg-emerald-700/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-base border-2 border-white/20 hover:bg-emerald-700 transition-all duration-300 hover:scale-105">
              <span className="flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Hubungi Sales
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Bintang Global</h3>
                  <p className="text-xs text-slate-500">Travel Management</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Platform B2B terpercaya untuk mengelola bisnis travel umroh Anda dengan efisien dan profesional.
              </p>
              <div className="flex items-center space-x-3">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.73l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.827z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('products')} className="hover:text-emerald-400 transition-colors">Hotel Mekkah</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-emerald-400 transition-colors">Hotel Madinah</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-emerald-400 transition-colors">Visa Processing</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-emerald-400 transition-colors">Tour Handling</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-emerald-400 transition-colors">Ticketing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><button onClick={() => scrollToSection('branches')} className="hover:text-emerald-400 transition-colors">Our Branches</button></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Jl. Raya Condet No. 27,<br />Jakarta Timur 13530</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <a href="tel:+622180945678" className="hover:text-emerald-400 transition-colors">+62 21 8094 5678</a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <a href="mailto:info@bintangglobal.com" className="hover:text-emerald-400 transition-colors">info@bintangglobal.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-center md:text-left">
              © 2024 Bintang Global Group. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;