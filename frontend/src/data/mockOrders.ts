import { OrderListItem } from '../types';

/**
 * Mock Orders Data
 * Sample order data for list/table display
 */

export const mockOrders: OrderListItem[] = [
  {
    id: '1',
    order_number: 'ORD-2024-001',
    owner_name: 'Al-Hijrah Travel',
    package_name: 'Paket Umroh 12 Hari',
    amount: 'Rp 45.500.000',
    status: 'confirmed',
    date: '2026-02-14 09:30'
  },
  {
    id: '2',
    order_number: 'ORD-2024-002',
    owner_name: 'Barokah Tour',
    package_name: 'Paket Umroh 9 Hari',
    amount: 'Rp 32.800.000',
    status: 'pending',
    date: '2026-02-14 08:15'
  },
  {
    id: '3',
    order_number: 'ORD-2024-003',
    owner_name: 'Madinah Express',
    package_name: 'Hotel + Visa',
    amount: 'Rp 18.200.000',
    status: 'processing',
    date: '2026-02-13 16:45'
  },
  {
    id: '4',
    order_number: 'ORD-2024-004',
    owner_name: 'Nusantara Haji',
    package_name: 'Paket Umroh 16 Hari',
    amount: 'Rp 67.300.000',
    status: 'confirmed',
    date: '2026-02-13 14:20'
  },
  {
    id: '5',
    order_number: 'ORD-2024-005',
    owner_name: 'Safar Travel',
    package_name: 'Tiket + Handling',
    amount: 'Rp 15.700.000',
    status: 'pending',
    date: '2026-02-13 11:00'
  },
  {
    id: '6',
    order_number: 'ORD-2024-006',
    owner_name: 'Al-Hijrah Travel',
    package_name: 'Paket Umroh 9 Hari',
    amount: 'Rp 28.500.000',
    status: 'completed',
    date: '2026-02-12 10:30'
  },
  {
    id: '7',
    order_number: 'ORD-2024-007',
    owner_name: 'Barokah Tour',
    package_name: 'Hotel Mekkah + Madinah',
    amount: 'Rp 22.100.000',
    status: 'confirmed',
    date: '2026-02-12 09:15'
  },
  {
    id: '8',
    order_number: 'ORD-2024-008',
    owner_name: 'Madinah Express',
    package_name: 'Paket Umroh 12 Hari',
    amount: 'Rp 38.900.000',
    status: 'processing',
    date: '2026-02-11 15:20'
  },
  {
    id: '9',
    order_number: 'ORD-2024-009',
    owner_name: 'Al-Hijrah Travel',
    package_name: 'Visa Umroh + Bus',
    amount: 'Rp 12.300.000',
    status: 'cancelled',
    date: '2026-02-10 13:45'
  },
  {
    id: '10',
    order_number: 'ORD-2024-010',
    owner_name: 'Nusantara Haji',
    package_name: 'Paket Umroh 9 Hari',
    amount: 'Rp 35.600.000',
    status: 'confirmed',
    date: '2026-02-10 11:30'
  }
];

export const getOrdersByStatus = (status: string) => {
  return mockOrders.filter(order => order.status === status);
};

export const getOrderById = (id: string) => {
  return mockOrders.find(order => order.id === id);
};

export const getRecentOrders = (limit: number = 5) => {
  return mockOrders.slice(0, limit);
};