import React, { useState } from 'react';
import { Receipt, Eye, Download, Calendar, CheckCircle, Clock, AlertCircle, Upload, X } from 'lucide-react';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { TableColumn } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

interface Invoice {
  id: string;
  invoice_number: string;
  order_number: string;
  owner_name: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: 'tentative' | 'definite' | 'partial' | 'paid';
  due_date: string;
  created_date: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    order_number: 'ORD-2024-001',
    owner_name: 'Al-Hijrah Travel',
    total_amount: 'Rp 45.500.000',
    paid_amount: 'Rp 45.500.000',
    remaining_amount: 'Rp 0',
    status: 'paid',
    due_date: '2026-02-20',
    created_date: '2026-02-14'
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    order_number: 'ORD-2024-002',
    owner_name: 'Barokah Tour',
    total_amount: 'Rp 32.800.000',
    paid_amount: 'Rp 16.400.000',
    remaining_amount: 'Rp 16.400.000',
    status: 'partial',
    due_date: '2026-02-21',
    created_date: '2026-02-14'
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    order_number: 'ORD-2024-003',
    owner_name: 'Madinah Express',
    total_amount: 'Rp 18.200.000',
    paid_amount: 'Rp 0',
    remaining_amount: 'Rp 18.200.000',
    status: 'tentative',
    due_date: '2026-02-22',
    created_date: '2026-02-13'
  }
];

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = statusFilter === 'all'
    ? mockInvoices
    : mockInvoices.filter((inv) => inv.status === statusFilter);

  const stats = [
    { label: 'Total Invoices', value: mockInvoices.length, icon: <Receipt className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Paid', value: mockInvoices.filter((i) => i.status === 'paid').length, icon: <CheckCircle className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
    { label: 'Partial', value: mockInvoices.filter((i) => i.status === 'partial').length, icon: <Clock className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Tentative', value: mockInvoices.filter((i) => i.status === 'tentative').length, icon: <AlertCircle className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'invoice', label: 'Invoice #', align: 'left' },
    { id: 'order', label: 'Order #', align: 'left' },
    { id: 'owner', label: 'Owner', align: 'left' },
    { id: 'total', label: 'Total Amount', align: 'right' },
    { id: 'paid', label: 'Paid', align: 'right' },
    { id: 'remaining', label: 'Remaining', align: 'right' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'due_date', label: 'Due Date', align: 'left' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    return (
      {
        paid: 'success' as const,
        partial: 'warning' as const,
        definite: 'info' as const,
        tentative: 'default' as const
      }[status] || 'default'
    );
  };

  const handleDownload = (invoice: Invoice) => {
    showToast(`Download invoice ${invoice.invoice_number} (PDF)`, 'success');
  };

  const handleUploadProof = (invoice: Invoice) => {
    showToast(`Upload bukti bayar untuk ${invoice.invoice_number} – fitur demo`, 'info');
  };

  const canUploadProof = (invoice: Invoice) =>
    (user?.role === 'owner' || user?.role === 'role_invoice') && invoice.status !== 'paid';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoices Management</h1>
        <p className="text-slate-600 mt-1">Track and manage payment invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hover>
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

      <Card>
        <div className="flex gap-2 mb-6">
          {['all', 'tentative', 'partial', 'paid'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        <Table
          columns={tableColumns}
          data={filteredInvoices}
          emptyMessage="Tidak ada invoice"
          renderRow={(invoice: Invoice) => (
            <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-900">{invoice.invoice_number}</td>
              <td className="px-6 py-4 text-slate-700">{invoice.order_number}</td>
              <td className="px-6 py-4 text-slate-700">{invoice.owner_name}</td>
              <td className="px-6 py-4 text-right font-semibold text-slate-900">{invoice.total_amount}</td>
              <td className="px-6 py-4 text-right text-emerald-600 font-semibold">{invoice.paid_amount}</td>
              <td className="px-6 py-4 text-right text-red-600 font-semibold">{invoice.remaining_amount}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={getStatusBadge(invoice.status)}>{invoice.status}</Badge>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {invoice.due_date}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    onClick={() => setViewInvoice(invoice)}
                    title="Lihat detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    onClick={() => handleDownload(invoice)}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {canUploadProof(invoice) && (
                    <button
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                      onClick={() => handleUploadProof(invoice)}
                      title="Upload bukti bayar"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewInvoice(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Detail Invoice</h2>
              <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Invoice #</dt>
                <dd className="font-semibold">{viewInvoice.invoice_number}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Order #</dt>
                <dd className="font-semibold">{viewInvoice.order_number}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Owner</dt>
                <dd className="font-semibold">{viewInvoice.owner_name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total Amount</dt>
                <dd className="font-semibold">{viewInvoice.total_amount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Paid</dt>
                <dd className="font-semibold text-emerald-600">{viewInvoice.paid_amount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Remaining</dt>
                <dd className="font-semibold text-red-600">{viewInvoice.remaining_amount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <Badge variant={getStatusBadge(viewInvoice.status)}>{viewInvoice.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Due Date</dt>
                <dd className="font-semibold">{viewInvoice.due_date}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="font-semibold">{viewInvoice.created_date}</dd>
              </div>
            </dl>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setViewInvoice(null)}>
                Tutup
              </Button>
              <Button variant="primary" onClick={() => handleDownload(viewInvoice)}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              {canUploadProof(viewInvoice) && (
                <Button variant="secondary" onClick={() => handleUploadProof(viewInvoice)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bukti Bayar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
