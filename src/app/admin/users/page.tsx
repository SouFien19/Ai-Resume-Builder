/**
 * Users Page
 * Enhanced list and management of all users with search, filters, pagination
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, Download, RefreshCw, 
  ChevronLeft, ChevronRight, MoreVertical, Eye,
  Ban, CheckCircle, Edit, Trash2, Loader2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface User {
  _id: string;
  email: string;
  name?: string;
  clerkId: string;
  role: string;
  plan: string;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  lastActive?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasMore: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
    hasMore: false,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, planFilter, statusFilter, roleFilter, sortBy, sortOrder, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(planFilter && { plan: planFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    if (!confirm(`Are you sure you want to ${suspend ? 'suspend' : 'unsuspend'} this user?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async (userId: string) => {
    const newPlan = prompt('Enter new plan (free, pro, enterprise):');
    if (!newPlan || !['free', 'pro', 'enterprise'].includes(newPlan)) {
      alert('Invalid plan. Must be: free, pro, or enterprise');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`Plan changed to ${newPlan} successfully`);
      }
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`⚠️ DANGER: Delete user ${email}? This will delete ALL their data (resumes, AI usage, etc). This cannot be undone!`)) {
      return;
    }

    const confirmation = prompt(`Type "DELETE" to confirm deletion of ${email}:`);
    if (confirmation !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = users.map(user => ({
      Email: user.email,
      Name: user.name || '-',
      Role: user.role,
      Plan: user.plan,
      Status: user.isSuspended ? 'Suspended' : 'Active',
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
      'Last Active': user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '-',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination.totalUsers.toLocaleString()} total users
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {(search || planFilter || statusFilter || roleFilter) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {search && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                Search: {search}
              </span>
            )}
            {planFilter && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                Plan: {planFilter}
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Status: {statusFilter}
              </span>
            )}
            {roleFilter && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                Role: {roleFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setPlanFilter('');
                setStatusFilter('');
                setRoleFilter('');
              }}
              className="ml-auto text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Users className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-600">No users found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        {sortBy === 'email' && (
                          <span className="text-pink-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortBy === 'name' && (
                          <span className="text-pink-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                    <th 
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('plan')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Plan</span>
                        {sortBy === 'plan' && (
                          <span className="text-pink-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th 
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Joined</span>
                        {sortBy === 'createdAt' && (
                          <span className="text-pink-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{user.name || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          user.role === 'superadmin' && "bg-purple-100 text-purple-700",
                          user.role === 'admin' && "bg-blue-100 text-blue-700",
                          user.role === 'user' && "bg-gray-100 text-gray-700"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          user.plan === 'free' && "bg-gray-100 text-gray-700",
                          user.plan === 'pro' && "bg-blue-100 text-blue-700",
                          user.plan === 'enterprise' && "bg-purple-100 text-purple-700"
                        )}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          user.isSuspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => fetchUserDetails(user._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user._id, !user.isSuspended)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              user.isSuspended 
                                ? "text-green-600 hover:bg-green-50" 
                                : "text-red-600 hover:bg-red-50"
                            )}
                            title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                          >
                            {user.isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleChangePlan(user._id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Change Plan"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.email)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                {pagination.totalUsers.toLocaleString()} users
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNumber }))}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all",
                          pagination.currentPage === pageNumber
                            ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                  disabled={!pagination.hasMore}
                  className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{userDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{userDetails.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">{userDetails.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-medium capitalize">{userDetails.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{userDetails.isSuspended ? 'Suspended' : 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-medium">{new Date(userDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Resumes</p>
                    <p className="text-2xl font-bold text-blue-700">{userDetails.stats.totalResumes}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">AI Requests</p>
                    <p className="text-2xl font-bold text-purple-700">{userDetails.stats.totalAIRequests}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">AI Cost</p>
                    <p className="text-2xl font-bold text-orange-700">${userDetails.stats.totalAICost.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Resumes */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Recent Resumes</h4>
                {userDetails.resumes.length > 0 ? (
                  <div className="space-y-2">
                    {userDetails.resumes.slice(0, 5).map((resume: any) => (
                      <div key={resume._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{resume.title || 'Untitled Resume'}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No resumes created yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
