import React, { useState } from 'react';
import {
  Hotel as HotelIcon,
  Plus,
  Search,
  Filter,
  MapPin,
  Star,
  Bed,
  Users,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { mockHotels, Hotel } from '../../../data/mockHotels';
import { TableColumn } from '../../../types';
import { formatIDR } from '../../../utils';

const HotelsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'makkah' | 'madinah'>('all');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter hotels
  const filteredHotels = mockHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.name_ar.includes(searchTerm);
    const matchesLocation = locationFilter === 'all' || hotel.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  // Statistics
  const stats = [
    {
      label: 'Total Hotels',
      value: mockHotels.length,
      icon: <HotelIcon className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Makkah Hotels',
      value: mockHotels.filter(h => h.location === 'makkah').length,
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Madinah Hotels',
      value: mockHotels.filter(h => h.location === 'madinah').length,
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Total Rooms',
      value: mockHotels.reduce((sum, h) => sum + h.rooms.length, 0),
      icon: <Bed className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getStarBadge = (rating: string) => {
    const stars = parseInt(rating.charAt(0));
    return (
      <div className="flex items-center gap-1">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  };

  const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Hotel Name', align: 'left' },
    { id: 'location', label: 'Location', align: 'left' },
    { id: 'star_rating', label: 'Rating', align: 'center' },
    { id: 'distance', label: 'Distance', align: 'center' },
    { id: 'rooms', label: 'Room Types', align: 'center' },
    { id: 'price_range', label: 'Price Range', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const handleViewDetail = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hotels Management</h1>
          <p className="text-slate-600 mt-1">Manage hotel properties in Makkah and Madinah</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Hotel
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hotels by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={locationFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('all')}
            >
              All Locations
            </Button>
            <Button
              variant={locationFilter === 'makkah' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('makkah')}
            >
              Makkah
            </Button>
            <Button
              variant={locationFilter === 'madinah' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('madinah')}
            >
              Madinah
            </Button>
          </div>
        </div>
      </Card>

      {/* Hotels Table */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">Hotels List</h3>
          <p className="text-sm text-slate-600 mt-1">
            Showing {filteredHotels.length} of {mockHotels.length} hotels
          </p>
        </div>

        <Table
          columns={tableColumns}
          data={filteredHotels}
          renderRow={(hotel: Hotel) => {
            const minPrice = Math.min(...hotel.rooms.map(r => r.price_per_room_sar));
            const maxPrice = Math.max(...hotel.rooms.map(r => r.price_per_room_sar));

            return (
              <tr key={hotel.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{hotel.name}</p>
                    <p className="text-sm text-slate-600">{hotel.name_ar}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="capitalize text-slate-700">{hotel.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStarBadge(hotel.star_rating)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-slate-600">{hotel.distance_from_haram} km</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant="info">{hotel.rooms.length} types</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{minPrice} - {maxPrice} SAR</p>
                    <p className="text-slate-500">per room/night</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={hotel.is_active ? 'success' : 'error'}>
                    {hotel.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetail(hotel)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{selectedHotel.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Hotel Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Arabic Name</p>
                  <p className="font-semibold text-slate-900">{selectedHotel.name_ar}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Location</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedHotel.location}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Star Rating</p>
                  {getStarBadge(selectedHotel.star_rating)}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Distance from Haram</p>
                  <p className="font-semibold text-slate-900">{selectedHotel.distance_from_haram} km</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-semibold text-slate-900">{selectedHotel.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-700">{selectedHotel.description}</p>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.facilities.map((facility, index) => (
                    <Badge key={index} variant="info">{facility}</Badge>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Room Types</h3>
                <div className="space-y-3">
                  {selectedHotel.rooms.map((room) => (
                    <div key={room.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{room.room_type}</h4>
                          <p className="text-sm text-slate-600">{room.description}</p>
                        </div>
                        <Badge variant={room.is_active ? 'success' : 'error'}>
                          {room.is_active ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Capacity</p>
                          <p className="font-semibold text-slate-900 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {room.capacity} pax
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Quota</p>
                          <p className="font-semibold text-slate-900">
                            {room.available_quota}/{room.total_quota}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Room Price</p>
                          <p className="font-semibold text-emerald-600">
                            {room.price_per_room_sar} SAR
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Meal Price</p>
                          <p className="font-semibold text-emerald-600">
                            {room.meal_price_per_person_sar} SAR/pax
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-slate-600 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsPage;