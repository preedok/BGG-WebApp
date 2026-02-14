import React, { useState } from 'react';
import {
  Hotel,
  MapPin,
  Users,
  DollarSign,
  Settings,
  CheckCircle,
  Clock,
  Plane,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatIDR, formatSAR } from '../../../utils';

const HotelDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hotels' | 'handling'>('hotels');

  // REKAPITULASI PEKERJAAN HOTEL ROLE
  const stats = [
    {
      title: 'Total Bookings',
      value: '89',
      subtitle: 'Bulan ini',
      change: '+12 dari bulan lalu',
      icon: <Hotel className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Kamar Available',
      value: '245',
      subtitle: 'Dari 450 total kamar',
      change: '54% occupancy',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Pending Allocation',
      value: '12',
      subtitle: 'Need room number',
      change: 'Assign kamar',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Active Handling',
      value: '8',
      subtitle: 'Groups in journey',
      change: '3 departing soon',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // PENDING ROOM ALLOCATION
  // Hotel role allocate nomor kamar
  const pendingAllocations = [
    {
      orderNumber: 'ORD-2024-145',
      ownerName: 'Al-Hijrah Travel',
      hotelName: 'Fairmont Makkah',
      roomType: 'Quad',
      roomsNeeded: 12,
      jamaahCount: 45,
      checkInDate: '2026-03-10',
      checkOutDate: '2026-03-15',
      status: 'pending_allocation'
    },
    {
      orderNumber: 'ORD-2024-142',
      ownerName: 'Barokah Tour',
      hotelName: 'Oberoi Madinah',
      roomType: 'Triple',
      roomsNeeded: 11,
      jamaahCount: 32,
      checkInDate: '2026-03-12',
      checkOutDate: '2026-03-17',
      status: 'pending_allocation'
    }
  ];

  // ROOM AVAILABILITY PER HOTEL
  const hotelAvailability = [
    {
      hotel: 'Fairmont Makkah',
      location: 'Makkah',
      totalRooms: 120,
      availableRooms: 78,
      occupiedRooms: 42,
      occupancyRate: 35,
      roomTypes: {
        quad: { total: 50, available: 32, occupied: 18 },
        triple: { total: 40, available: 28, occupied: 12 },
        double: { total: 30, available: 18, occupied: 12 }
      }
    },
    {
      hotel: 'Swissotel Makkah',
      location: 'Makkah',
      totalRooms: 90,
      availableRooms: 55,
      occupiedRooms: 35,
      occupancyRate: 39,
      roomTypes: {
        quad: { total: 40, available: 25, occupied: 15 },
        triple: { total: 50, available: 30, occupied: 20 }
      }
    },
    {
      hotel: 'Oberoi Madinah',
      location: 'Madinah',
      totalRooms: 85,
      availableRooms: 50,
      occupiedRooms: 35,
      occupancyRate: 41,
      roomTypes: {
        quad: { total: 45, available: 30, occupied: 15 },
        triple: { total: 40, available: 20, occupied: 20 }
      }
    }
  ];

  // SPECIAL PRICE CONFIGURATIONS
  // Hotel role bisa set harga khusus (perlu approval admin cabang)
  const specialPrices = [
    {
      ownerName: 'Al-Hijrah Travel',
      hotel: 'Fairmont Makkah - Quad',
      generalPrice: formatSAR(1200),
      specialPrice: formatSAR(1050),
      discount: '12.5%',
      approvedBy: 'Admin Cabang Jakarta',
      status: 'active'
    },
    {
      ownerName: 'Barokah Tour',
      hotel: 'Oberoi Madinah - Triple',
      generalPrice: formatSAR(900),
      specialPrice: formatSAR(800),
      discount: '11.1%',
      approvedBy: 'Admin Cabang Surabaya',
      status: 'pending_approval'
    }
  ];

  // HANDLING - JAMAAH PROGRESS TRACKING
  // Hotel role juga handle progress jamaah
  const activeHandling = [
    {
      orderNumber: 'ORD-2024-135',
      ownerName: 'Al-Hijrah Travel',
      groupName: 'Rombongan Ramadhan 1',
      jamaahCount: 45,
      status: 'umroh_makkah',
      location: 'Makkah',
      progress: 60,
      currentHotel: 'Fairmont Makkah',
      roomNumbers: '1205-1216',
      departureDate: '2026-02-10',
      returnDate: '2026-02-22',
      timeline: [
        { status: 'Persiapan', date: '2026-02-01', completed: true },
        { status: 'Berangkat', date: '2026-02-10', completed: true },
        { status: 'Tiba Arab', date: '2026-02-10', completed: true },
        { status: 'Check-in Makkah', date: '2026-02-11', completed: true },
        { status: 'Umroh Makkah', date: '2026-02-12', completed: true, current: true },
        { status: 'Check-out Makkah', date: '2026-02-15', completed: false },
        { status: 'Check-in Madinah', date: '2026-02-16', completed: false },
        { status: 'Umroh Madinah', date: '2026-02-17', completed: false },
        { status: 'Check-out Madinah', date: '2026-02-20', completed: false },
        { status: 'Pulang', date: '2026-02-21', completed: false },
        { status: 'Tiba Indonesia', date: '2026-02-22', completed: false }
      ]
    },
    {
      orderNumber: 'ORD-2024-128',
      ownerName: 'Madinah Express',
      groupName: 'Paket Ekonomis Batch 3',
      jamaahCount: 28,
      status: 'checkin_madinah',
      location: 'Madinah',
      progress: 75,
      currentHotel: 'Dar Al Taqwa Madinah',
      roomNumbers: '301-308',
      departureDate: '2026-02-08',
      returnDate: '2026-02-17',
      timeline: [
        { status: 'Persiapan', date: '2026-02-01', completed: true },
        { status: 'Berangkat', date: '2026-02-08', completed: true },
        { status: 'Tiba Arab', date: '2026-02-08', completed: true },
        { status: 'Check-in Makkah', date: '2026-02-09', completed: true },
        { status: 'Umroh Makkah', date: '2026-02-10', completed: true },
        { status: 'Check-out Makkah', date: '2026-02-13', completed: true },
        { status: 'Check-in Madinah', date: '2026-02-14', completed: true, current: true },
        { status: 'Umroh Madinah', date: '2026-02-15', completed: false },
        { status: 'Check-out Madinah', date: '2026-02-16', completed: false },
        { status: 'Pulang', date: '2026-02-16', completed: false },
        { status: 'Tiba Indonesia', date: '2026-02-17', completed: false }
      ]
    }
  ];

  // DEPARTING SOON
  const departingSoon = [
    {
      orderNumber: 'ORD-2024-150',
      ownerName: 'Safar Travel',
      groupName: 'Umroh Februari Batch 2',
      jamaahCount: 32,
      departureDate: '2026-02-18',
      daysUntilDeparture: 3,
      status: 'preparation',
      hotels: 'Swissotel Makkah + Millennium Madinah'
    },
    {
      orderNumber: 'ORD-2024-148',
      ownerName: 'Nusantara Haji',
      groupName: 'Paket Premium 16 Hari',
      jamaahCount: 42,
      departureDate: '2026-02-20',
      daysUntilDeparture: 5,
      status: 'preparation',
      hotels: 'Fairmont Makkah + Oberoi Madinah'
    }
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      preparation: 'warning',
      departed: 'info',
      umroh_makkah: 'info',
      umroh_madinah: 'info',
      checkin_makkah: 'success',
      checkin_madinah: 'success',
      completed: 'success',
      active: 'success',
      pending_approval: 'warning'
    };
    return map[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hotel & Handling Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Room Management, Pricing & Jamaah Progress Tracking
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* REKAPITULASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
            <p className="text-xs text-emerald-600 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'hotels'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('hotels')}
        >
          <Hotel className="w-4 h-4 inline mr-2" />
          Hotel Management
        </button>
        <button
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'handling'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('handling')}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Jamaah Handling
        </button>
      </div>

      {/* HOTEL MANAGEMENT TAB */}
      {activeTab === 'hotels' && (
        <>
          {/* PENDING ROOM ALLOCATION */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Pending Room Allocation
                <Badge variant="warning" className="ml-3">{pendingAllocations.length} pending</Badge>
              </h3>
            </div>

            <div className="space-y-4">
              {pendingAllocations.map((item, i) => (
                <div key={i} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-slate-900">{item.orderNumber}</p>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="text-sm text-slate-700 font-semibold">{item.ownerName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Hotel</p>
                      <p className="font-semibold text-slate-900">{item.hotelName}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Room Type</p>
                      <p className="font-semibold text-slate-900">{item.roomType}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Rooms Needed</p>
                      <p className="font-bold text-emerald-600">{item.roomsNeeded} kamar</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Jamaah</p>
                      <p className="font-semibold text-slate-900">{item.jamaahCount} orang</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600">Check-in: {item.checkInDate}</span>
                      <span className="text-slate-600">Check-out: {item.checkOutDate}</span>
                    </div>
                  </div>

                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Room Numbers
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* HOTEL AVAILABILITY */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Hotel Availability</h3>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Rooms
              </Button>
            </div>

            <div className="space-y-4">
              {hotelAvailability.map((hotel, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Hotel className="w-5 h-5 text-emerald-600" />
                        <p className="font-bold text-slate-900">{hotel.hotel}</p>
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{hotel.availableRooms}/{hotel.totalRooms}</p>
                      <p className="text-xs text-slate-600">Available</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Occupancy Rate</span>
                      <span className="font-semibold text-slate-900">{hotel.occupancyRate}%</span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                        style={{ width: `${hotel.occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(hotel.roomTypes).map(([type, data], j) => (
                      <div key={j} className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs text-slate-600 mb-1 capitalize">{type}</p>
                        <p className="font-bold text-emerald-600">{data.available}</p>
                        <p className="text-xs text-slate-500">/ {data.total}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SPECIAL PRICE CONFIGURATION */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Special Price Configuration
                <Badge variant="info" className="ml-3">{specialPrices.length} configs</Badge>
              </h3>
              <Button variant="primary" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                New Configuration
              </Button>
            </div>

            <div className="space-y-4">
              {specialPrices.map((config, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{config.ownerName}</p>
                      <p className="text-sm text-slate-600">{config.hotel}</p>
                    </div>
                    <Badge variant={getStatusBadge(config.status)}>
                      {config.status === 'active' ? 'Active' : 'Pending Approval'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">General Price</p>
                      <p className="font-semibold text-slate-900">{config.generalPrice}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Special Price</p>
                      <p className="font-bold text-emerald-600">{config.specialPrice}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Discount</p>
                      <p className="font-bold text-blue-600">{config.discount}</p>
                    </div>
                  </div>

                  {config.status === 'active' && (
                    <p className="text-xs text-slate-600 mt-3">
                      Approved by: <span className="font-semibold">{config.approvedBy}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* HANDLING TAB */}
      {activeTab === 'handling' && (
        <>
          {/* ACTIVE JAMAAH GROUPS */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Active Jamaah Groups
                <Badge variant="info" className="ml-3">{activeHandling.length} groups</Badge>
              </h3>
            </div>

            <div className="space-y-6">
              {activeHandling.map((group, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-slate-900">{group.orderNumber}</p>
                        <Badge variant={getStatusBadge(group.status)}>{group.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 font-semibold">{group.ownerName}</p>
                      <p className="text-sm text-slate-600">{group.groupName} - {group.jamaahCount} jamaah</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">{group.location}</span>
                      </div>
                      <p className="text-xs text-slate-600">{group.currentHotel}</p>
                      <p className="text-xs text-slate-600">Kamar: {group.roomNumbers}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">{group.progress}%</span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                        style={{ width: `${group.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Journey Timeline:</p>
                    <div className="space-y-2">
                      {group.timeline.map((step, j) => (
                        <div key={j} className="flex items-center gap-3">
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-slate-300 rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${
                                step.current ? 'font-bold text-blue-600' :
                                step.completed ? 'text-slate-700' :
                                'text-slate-400'
                              }`}>
                                {step.status}
                              </span>
                              <span className="text-xs text-slate-500">{step.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Progress
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* DEPARTING SOON */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Departing Soon
                <Badge variant="warning" className="ml-3">{departingSoon.length} groups</Badge>
              </h3>
            </div>

            <div className="space-y-4">
              {departingSoon.map((group, i) => (
                <div key={i} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-slate-900">{group.orderNumber}</p>
                        <Badge variant="warning">{group.daysUntilDeparture} hari lagi</Badge>
                      </div>
                      <p className="text-sm text-slate-700 font-semibold">{group.ownerName}</p>
                      <p className="text-sm text-slate-600">{group.groupName} - {group.jamaahCount} jamaah</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        Departure
                      </p>
                      <p className="font-semibold text-slate-900">{group.departureDate}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                        <Hotel className="w-3 h-3" />
                        Hotels
                      </p>
                      <p className="font-semibold text-slate-900 text-xs">{group.hotels}</p>
                    </div>
                  </div>

                  <Button variant="primary" size="sm" className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Preparation Complete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* QUICK ACTIONS */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Plus className="w-6 h-6" />
            <span className="text-sm">Allocate Rooms</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Settings className="w-6 h-6" />
            <span className="text-sm">Price Config</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Edit className="w-6 h-6" />
            <span className="text-sm">Update Progress</span>
          </Button>
          <Button variant="outline" className="flex-col h-24 gap-2">
            <Download className="w-6 h-6" />
            <span className="text-sm">Export Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HotelDashboard;