import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plane, RefreshCw, Eye, FileText, Upload, Download } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ticketApi } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { API_BASE_URL } from '../../../utils/constants';

const UPLOAD_BASE = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'data_received', label: 'Data Diterima' },
  { value: 'seat_reserved', label: 'Kursi Direservasi' },
  { value: 'booking', label: 'Booking' },
  { value: 'payment_airline', label: 'Pembayaran Maskapai' },
  { value: 'ticket_issued', label: 'Tiket Terbit' }
];

const TicketWorkPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('order');
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSetIssued, setUploadSetIssued] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    try {
      const res = await ticketApi.listOrders({});
      if (res.data.success) setOrders(res.data.data || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (orderIdParam) {
      ticketApi.getOrder(orderIdParam)
        .then((res: any) => res.data.success && setDetailOrder(res.data.data))
        .catch(() => setDetailOrder(null));
    } else {
      setDetailOrder(null);
    }
  }, [orderIdParam]);

  const handleUpdateProgress = async (orderItemId: string, payload: { status?: string; notes?: string }) => {
    setUpdatingId(orderItemId);
    try {
      await ticketApi.updateItemProgress(orderItemId, payload);
      if (detailOrder?.id) {
        const res = await ticketApi.getOrder(detailOrder.id);
        if (res.data.success) setDetailOrder(res.data.data);
      }
      fetchOrders();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUploadTicket = async (orderItemId: string, file: File) => {
    if (!file) {
      showToast('Pilih file tiket', 'error');
      return;
    }
    setUploadingId(orderItemId);
    try {
      const formData = new FormData();
      formData.append('ticket_file', file);
      await ticketApi.uploadTicket(orderItemId, formData, uploadSetIssued[orderItemId]);
      showToast('Dokumen tiket berhasil diupload.', 'success');
      if (detailOrder?.id) {
        const res = await ticketApi.getOrder(detailOrder.id);
        if (res.data.success) setDetailOrder(res.data.data);
      }
      fetchOrders();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal upload tiket', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  const ticketItems = detailOrder?.OrderItems?.filter((i: any) => i.type === 'ticket') || [];

  const fileUrl = (path: string | undefined) => path ? (path.startsWith('http') ? path : `${UPLOAD_BASE}${path}`) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Tiket – Penerbitan & Dokumen</h1>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Memuat...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Belum ada order dengan item tiket di cabang Anda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-right py-3 px-4">Item Tiket</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const ticketCount = (o.OrderItems || []).filter((i: any) => i.type === 'ticket').length;
                  const firstStatus = (o.OrderItems || []).find((i: any) => i.type === 'ticket')?.TicketProgress?.status || 'pending';
                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{o.order_number}</td>
                      <td className="py-3 px-4">{o.User?.name}</td>
                      <td className="py-3 px-4 text-right">{ticketCount}</td>
                      <td className="py-3 px-4">{firstStatus}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" onClick={() => setSearchParams({ order: o.id })}>
                          <Eye className="w-4 h-4 mr-1" /> Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSearchParams({})}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Order {detailOrder.order_number}</h2>
              <button className="p-2 hover:bg-slate-100 rounded-lg" onClick={() => setSearchParams({})}>×</button>
            </div>
            <p className="text-sm text-slate-600 mb-4">Owner: {detailOrder.User?.name}</p>
            <div className="space-y-4">
              {ticketItems.map((item: any) => {
                const prog = item.TicketProgress;
                const status = prog?.status || 'pending';
                const manifestLink = fileUrl(item.manifest_file_url);
                const ticketLink = fileUrl(prog?.ticket_file_url);
                return (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                    <p className="font-semibold">Item Tiket · Qty: {item.quantity}</p>

                    {item.manifest_file_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Manifest jamaah:</span>
                        <a
                          href={manifestLink!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Unduh manifest
                        </a>
                      </div>
                    )}
                    {!item.manifest_file_url && (
                      <p className="text-sm text-amber-600">Manifest jamaah belum diupload (oleh invoice/owner).</p>
                    )}

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Status Pekerjaan</label>
                      <select
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        value={status}
                        onChange={(e) => handleUpdateProgress(item.id, { status: e.target.value })}
                        disabled={updatingId === item.id}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Dokumen tiket jamaah (upload)</label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.xls,.doc,.docx,image/*"
                          className="text-sm"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadTicket(item.id, f);
                            e.target.value = '';
                          }}
                          disabled={uploadingId === item.id}
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={uploadSetIssued[item.id] ?? false}
                            onChange={(e) => setUploadSetIssued(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          />
                          Set status Terbit & kirim notifikasi
                        </label>
                      </div>
                      {uploadingId === item.id && <span className="text-xs text-slate-500">Uploading...</span>}
                      {prog?.ticket_file_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={ticketLink!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" /> Unduh dokumen tiket
                          </a>
                        </div>
                      )}
                    </div>

                    {prog?.issued_at && (
                      <p className="text-xs text-slate-500">Terbit: {new Date(prog.issued_at).toLocaleString('id-ID')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketWorkPage;
