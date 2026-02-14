import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <SuperAdminDashboard />
                    },
                    {
                        path: 'hotels',
                        element: <ComingSoonPage title="Hotels Management" />
                    },
                    {
                        path: 'visa',
                        element: <ComingSoonPage title="Visa Management" />
                    },
                    {
                        path: 'tickets',
                        element: <ComingSoonPage title="Tickets Management" />
                    },
                    {
                        path: 'bus',
                        element: <ComingSoonPage title="Bus Management" />
                    },
                    {
                        path: 'packages',
                        element: <ComingSoonPage title="Package Management" />
                    },
                    {
                        path: 'orders',
                        element: <ComingSoonPage title="Orders Management" />
                    },
                    {
                        path: 'invoices',
                        element: <ComingSoonPage title="Invoice Management" />
                    },
                    {
                        path: 'users',
                        element: <ComingSoonPage title="User Management" />
                    },
                    {
                        path: 'branches',
                        element: <ComingSoonPage title="Branch Management" />
                    },
                    {
                        path: 'reports',
                        element: <ComingSoonPage title="Reports & Analytics" />
                    },
                    {
                        path: 'settings',
                        element: <ComingSoonPage title="Settings" />
                    },
                    {
                        path: 'profile',
                        element: <ComingSoonPage title="My Profile" />
                    }
                ]
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
]);

// Coming Soon Page Component
function ComingSoonPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-6xl">🚧</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
                <p className="text-xl text-slate-600 mb-8">This page is under construction</p>
                <div className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold">
                    <span>Coming soon...</span>
                </div>
            </div>
        </div>
    );
}

// 404 Page Component
function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center">
                <div className="mb-8">
                    <span className="text-9xl font-bold text-slate-300">404</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Page Not Found</h1>
                <p className="text-xl text-slate-600 mb-8">
                    The page you are looking for does not exist.
                </p>
                <a
                    href="/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
}

export default router;