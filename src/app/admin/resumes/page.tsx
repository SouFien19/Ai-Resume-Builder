'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface Resume {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name?: string;
    photo?: string;
  };
  name: string;
  templateId: string;
  downloads: number;
  lastDownloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumesData {
  resumes: Resume[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    totalResumes: number;
    totalDownloads: number;
    resumesToday: number;
    topTemplate: string;
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function AdminResumesPage() {
  const [data, setData] = useState<ResumesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [templateFilter, setTemplateFilter] = useState('all');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetchResumes();
  }, [page, templateFilter]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchQuery,
        template: templateFilter
      });

      const response = await fetch(`/api/admin/resumes?${params}`);
      
      // Check if response is OK
      if (!response.ok) {
        const text = await response.text();
        console.error('API Error Response:', text);
        showToast('error', `Failed to load resumes: HTTP ${response.status}`);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON Response:', text);
        showToast('error', 'Server returned an invalid response');
        throw new Error('Expected JSON response but got HTML');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        setData(result.data);
        if (searchQuery) {
          showToast('success', `Found ${result.data.resumes.length} resumes`);
        }
      } else {
        console.error('API returned success: false', result);
        showToast('error', 'Failed to load resumes');
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      // Toast already shown above
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResumes();
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await fetch(`/api/admin/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('success', 'Resume deleted successfully');
        fetchResumes();
      } else {
        showToast('error', 'Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      showToast('error', 'An error occurred while deleting');
    }
  };

  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
          Resume Management
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Manage all user resumes and track downloads in real-time
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Resumes Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Resumes</p>
                <motion.p 
                  className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {data?.stats.totalResumes.toLocaleString() || 0}
                </motion.p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <motion.div 
                className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <FileText className="h-7 w-7 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Total Downloads Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Downloads</p>
                <motion.p 
                  className="text-3xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {data?.stats.totalDownloads.toLocaleString() || 0}
                </motion.p>
                <p className="text-xs text-green-600 mt-1 font-medium">↑ Active</p>
              </div>
              <motion.div 
                className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Download className="h-7 w-7 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Created Today Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Created Today</p>
                <motion.p 
                  className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {data?.stats.resumesToday || 0}
                </motion.p>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
              <motion.div 
                className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Calendar className="h-7 w-7 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Top Template Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Top Template</p>
                <motion.p 
                  className="text-2xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent capitalize"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {data?.stats.topTemplate || 'N/A'}
                </motion.p>
                <p className="text-xs text-orange-600 mt-1 font-medium">⭐ Most Popular</p>
              </div>
              <motion.div 
                className="h-14 w-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <FileText className="h-7 w-7 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group/search">
                <motion.div
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="h-5 w-5 text-gray-400 group-hover/search:text-pink-500 transition-colors" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Search by resume name or user email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                      fetchResumes();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </motion.button>
                )}
              </div>
            </form>

            {/* Template Filter */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
                <Filter className="h-5 w-5 text-pink-600" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </div>
              <select
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all hover:border-gray-300 bg-gray-50/50 focus:bg-white font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">All Templates</option>
                <option value="azurill">Azurill</option>
                <option value="bronzor">Bronzor</option>
                <option value="chikorita">Chikorita</option>
                <option value="ditto">Ditto</option>
                <option value="gengar">Gengar</option>
                <option value="glalie">Glalie</option>
                <option value="kakuna">Kakuna</option>
                <option value="leafish">Leafish</option>
                <option value="nosepass">Nosepass</option>
                <option value="onyx">Onyx</option>
                <option value="pikachu">Pikachu</option>
                <option value="rhyhorn">Rhyhorn</option>
              </select>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Resumes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.resumes && data.resumes.length > 0 ? (
                  data.resumes.map((resume, index) => (
                    <motion.tr 
                      key={resume._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ 
                        backgroundColor: 'rgba(249, 250, 251, 1)',
                        scale: 1.01
                      }}
                      className="transition-all cursor-pointer border-l-4 border-transparent hover:border-l-pink-500"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="h-12 w-12 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FileText className="h-6 w-6 text-white" />
                          </motion.div>
                          <div>
                            <p className="font-semibold text-gray-900 text-base">{resume.name}</p>
                            <p className="text-xs text-gray-500 font-mono">ID: {resume._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {resume.userId.photo ? (
                            <motion.img
                              src={resume.userId.photo}
                              alt={resume.userId.name || resume.userId.email}
                              className="h-10 w-10 rounded-full ring-2 ring-gray-200"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            />
                          ) : (
                            <motion.div 
                              className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <User className="h-5 w-5 text-gray-600" />
                            </motion.div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {resume.userId.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{resume.userId.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <motion.span 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md capitalize"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {resume.templateId}
                        </motion.span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-700">{resume.downloads}</span>
                          </motion.div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {resume.createdAt ? (
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {format(new Date(resume.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                              {format(new Date(resume.createdAt), 'hh:mm a')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => window.open(`/resumes/${resume._id}`, '_blank')}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm border border-blue-200"
                            title="View Resume"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(resume._id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-red-200"
                            title="Delete Resume"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <motion.div 
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          className="h-20 w-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        >
                          <FileText className="h-10 w-10 text-gray-500" />
                        </motion.div>
                        <div>
                          <p className="text-gray-700 font-semibold text-lg">No resumes found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <motion.div 
              className="px-6 py-5 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-sm font-medium text-gray-700">
                Showing page <span className="text-pink-600 font-bold">{data.pagination.page}</span> of{' '}
                <span className="text-pink-600 font-bold">{data.pagination.pages}</span>
                {' '}({data.pagination.total} total resumes)
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-gray-700 hover:text-pink-600 disabled:hover:border-gray-200 disabled:hover:bg-transparent"
                  whileHover={page !== 1 ? { scale: 1.05 } : {}}
                  whileTap={page !== 1 ? { scale: 0.95 } : {}}
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <div className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold shadow-lg">
                  {page}
                </div>
                <motion.button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.pages}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-gray-700 hover:text-pink-600 disabled:hover:border-gray-200 disabled:hover:bg-transparent"
                  whileHover={page < data.pagination.pages ? { scale: 1.05 } : {}}
                  whileTap={page < data.pagination.pages ? { scale: 0.95 } : {}}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Toast Component
function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  };

  const Icon = icons[toast.type];
  const colorScheme = colors[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="fixed top-6 right-6 z-50"
    >
      <div
        className={`${colorScheme.bg} ${colorScheme.border} border-l-4 rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm`}
      >
        <Icon className={`h-6 w-6 ${colorScheme.icon} flex-shrink-0`} />
        <p className={`${colorScheme.text} font-medium flex-1`}>{toast.message}</p>
        <button
          onClick={onClose}
          className={`${colorScheme.text} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-2/3 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-12 w-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-6 mb-6 pb-4 border-b-2 border-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
              </div>
              <div className="flex items-center">
                <div className="h-6 bg-gray-200 rounded-lg w-12"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
