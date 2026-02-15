import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { OrderListItem } from '../types';

interface OrderContextType {
  orders: OrderListItem[];
  addOrder: (order: Omit<OrderListItem, 'id' | 'order_number'>) => void;
  updateOrder: (id: string, updates: Partial<OrderListItem>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => OrderListItem | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderNumber(): string {
  const n = Math.floor(Math.random() * 9999) + 1;
  return `ORD-2024-${String(n).padStart(3, '0')}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);

  const addOrder = useCallback((order: Omit<OrderListItem, 'id' | 'order_number'>) => {
    const id = `order-${Date.now()}`;
    const order_number = generateOrderNumber();
    setOrders((prev) => [
      { ...order, id, order_number },
      ...prev
    ]);
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<OrderListItem>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, updateOrder, deleteOrder, getOrderById }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
