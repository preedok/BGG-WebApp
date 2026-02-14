import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { OrderProvider } from './contexts/OrderContext';
import router from './routes';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <OrderProvider>
          <RouterProvider router={router} />
        </OrderProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;