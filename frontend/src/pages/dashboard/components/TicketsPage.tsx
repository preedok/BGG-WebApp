import React, { useState } from 'react';
import { Plane, Plus, Search, Edit, Trash2, Eye, Calendar, MapPin, Users } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';

interface Ticket {
  id: string;
  airline: string;
  flight_number: string;
  route_from: string;
  route_to: string;
  departure_date: string;
  arrival_date: string;
  price_sar: number;
  total_seats: number;
  available_seats: number;
  class: string;
  status: 'available' | 'limited' | 'sold_out';
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    airline: 'Saudia Airlines',
    flight_number: 'SV820',
    route_from: 'Jakarta (CGK)',
    route_to: 'Jeddah (JED)',
    departure_date: '2026-03-15 08:00',
    arrival_date: '2026-03-15 14:30',
    price_sar: 2800,
    total_seats: 250,
    available_seats: 87,
    class: 'Economy',
    status: 'available'
  },
  {
    id: '2',
    airline: 'Garuda Indonesia',
    flight_number: 'GA9842',
    route_from: 'Jakarta (CGK)',
    route_to: 'Madinah (MED)',
    departure_date: '2026-03-20 10:30',
    arrival_date: '2026-03-20 17:00',
    price_sar: 3200,
    total_seats: 200,
    available_seats: 156,
    class: 'Economy',
    status: 'available'
  }
];

const TicketsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Flights', value: mockTickets.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Available Seats', value: mockTickets.reduce((sum, t) => sum + t.available_seats, 0), color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Seats', value: mockTickets.reduce((sum, t) => sum + t.total_seats, 0), color: 'from-purple-500 to-pink-500' },
    { label: 'Active Routes', value: new Set(mockTickets.map(t => `${t.route_from}-${t.route_to}`)).size, color: 'from-orange-500 to-red-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'flight', label: 'Flight', align: 'left' },
    { id: 'route', label: 'Route', align: 'left' },
    { id: 'departure', label: 'Departure', align: 'left' },
    { id: 'price', label: 'Price', align: 'right' },
    { id: 'seats', label: 'Seats', align: 'center' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flight Tickets Management</h1>
          <p className="text-slate-600 mt-1">Manage flight schedules and ticket inventory</p>
        </div>
        <Button variant="primary"><Plus className="w-5 h-5 mr-2" />Add Flight</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <Table
          columns={tableColumns}
          data={mockTickets}
          renderRow={(ticket: Ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="font-semibold text-slate-900">{ticket.airline}</p>
                  <p className="text-sm text-slate-600">{ticket.flight_number}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{ticket.route_from} → {ticket.route_to}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{ticket.departure_date}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">{ticket.price_sar} SAR</td>
              <td className="px-6 py-4 text-center">
                <div className="text-sm">
                  <p className="font-semibold">{ticket.available_seats}/{ticket.total_seats}</p>
                  <p className="text-slate-500">{Math.round((ticket.available_seats/ticket.total_seats)*100)}% available</p>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={ticket.status === 'available' ? 'success' : ticket.status === 'limited' ? 'warning' : 'error'}>
                  {ticket.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default TicketsPage;