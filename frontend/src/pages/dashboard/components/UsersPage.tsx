import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, Eye, Shield, Mail, Phone } from 'lucide-react';
import { ROLE_NAMES, TableColumn } from '../../../types';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import ActionsMenu from '../../../components/common/ActionsMenu';
import type { ActionsMenuItem } from '../../../components/common/ActionsMenu';
import { adminPusatApi, branchesApi, UserListItem } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const roleLabel = (role: string): string =>
  (ROLE_NAMES as Record<string, string>)[role] || role;

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [branches, setBranches] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchId, setBranchId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  const canListUsers =
    currentUser?.role === 'super_admin' || currentUser?.role === 'admin_pusat';
  const isAdminPusat = currentUser?.role === 'admin_pusat';

  useEffect(() => {
    if (isAdminPusat) {
      branchesApi.list({ limit: 500, page: 1 }).then((res) => {
        if (res.data?.data) setBranches(res.data.data);
      }).catch(() => {});
    }
  }, [isAdminPusat]);

  useEffect(() => {
    if (!canListUsers) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const params: { role?: string; branch_id?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' } = { limit, page, sort_by: sortBy, sort_order: sortOrder };
    if (branchId) params.branch_id = branchId;
    if (roleFilter !== 'all') params.role = roleFilter;
    adminPusatApi
      .listUsers(params)
      .then((res) => {
        if (!cancelled && res.data?.data) setUsers(res.data.data);
        if (!cancelled) {
          const p = (res.data as { pagination?: { total: number; page: number; limit: number; totalPages: number } }).pagination;
          setPagination(p || (res.data?.data ? { total: (res.data.data as unknown[]).length, page: 1, limit: (res.data.data as unknown[]).length, totalPages: 1 } : null));
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || 'Gagal memuat daftar user');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [canListUsers, branchId, roleFilter, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [branchId, roleFilter]);

  const filteredUsers = users.filter((user: UserListItem) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = [
    { label: 'Total Users', value: pagination?.total ?? users.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aktif', value: users.filter((u: UserListItem) => u.is_active).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Owner', value: users.filter((u: UserListItem) => u.role === 'owner').length, color: 'from-purple-500 to-pink-500' },
    { label: 'Staff', value: users.filter((u: UserListItem) => u.role !== 'owner').length, color: 'from-orange-500 to-red-500' }
  ];

  const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Nama', align: 'left', sortable: true },
    { id: 'email', label: 'Email', align: 'left', sortable: true },
    { id: 'role', label: 'Role', align: 'left', sortable: true },
    { id: 'company', label: 'Perusahaan', align: 'left' },
    { id: 'branch', label: 'Cabang', align: 'left' },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'actions', label: 'Aksi', align: 'center' }
  ];

  if (!canListUsers) {
    return (
      <div className="rounded-travel bg-primary-50 border border-primary-200 p-4 text-primary-800">
        <p>Daftar user hanya dapat diakses oleh Super Admin dan Admin Pusat.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Memuat daftar user...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Manajemen User</h1>
          <p className="text-stone-600 mt-1">Daftar user – tambah akun via Admin Pusat / Admin Cabang</p>
        </div>
        <Button variant="primary"><Plus className="w-5 h-5 mr-2" />Tambah User</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} hover className="travel-card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-card`}>
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-600">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="travel-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Semua Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin_pusat">Admin Pusat</option>
            <option value="owner">Owner</option>
            <option value="invoice_koordinator">Invoice Koordinator</option>
            <option value="role_invoice_saudi">Invoice Saudi</option>
            <option value="role_hotel">Hotel</option>
            <option value="role_bus">Bus</option>
            <option value="role_accounting">Accounting</option>
          </select>
          {isAdminPusat && (
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary-500 min-w-[180px]"
              title="Filter cabang"
            >
              <option value="">Semua cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
              ))}
            </select>
          )}
        </div>

        <Table
          columns={tableColumns}
          data={filteredUsers}
          sort={{ columnId: sortBy, order: sortOrder }}
          onSortChange={(col, order) => { setSortBy(col); setSortOrder(order); setPage(1); }}
          pagination={pagination ? {
            total: pagination.total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: pagination.totalPages,
            onPageChange: setPage,
            onLimitChange: (l) => { setLimit(l); setPage(1); }
          } : undefined}
          renderRow={(user: UserListItem) => (
            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.Branch?.name || '-'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user.email}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="info">
                  <Shield className="w-3 h-3 mr-1" />
                  {roleLabel(user.role)}
                </Badge>
              </td>
              <td className="px-6 py-4 text-slate-700">{user.company_name || '-'}</td>
              <td className="px-6 py-4 text-slate-700">
                {user.Branch ? `${user.Branch.code} - ${user.Branch.name}` : '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={user.is_active ? 'success' : 'error'}>
                  {user.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <ActionsMenu
                    align="right"
                    items={[
                      { id: 'view', label: 'Lihat', icon: <Eye className="w-4 h-4" />, onClick: () => {} },
                      { id: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => {} },
                      { id: 'delete', label: 'Hapus', icon: <Trash2 className="w-4 h-4" />, onClick: () => {}, danger: true },
                    ] as ActionsMenuItem[]}
                  />
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default UsersPage;
