import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, FileText, BarChart3, Users, Tags, 
  MapPin, CheckCircle2, XCircle, Search, PlusCircle, Lock, Unlock, RefreshCw 
} from 'lucide-react';
import api from '../services/api';
import type { Claim, StatisticsData, User, Category, Location } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, isAdminOrStaff, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'stats' | 'claims' | 'users' | 'masterdata'>('stats');

  // Stats State
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Claims State
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);

  // Users State (Admin only)
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Masterdata State
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocArea, setNewLocArea] = useState('');

  // Modals for Claims
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [handoverClaim, setHandoverClaim] = useState<Claim | null>(null);
  const [handoverLocation, setHandoverLocation] = useState('Văn phòng Thư viện Tầng 1');
  const [handoverNote, setHandoverNote] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get<StatisticsData>('/admin/statistics');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchClaims = async () => {
    setLoadingClaims(true);
    try {
      const res = await api.get<Claim[]>('/claims');
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'Admin') return;
    setLoadingUsers(true);
    try {
      const res = await api.get<User[]>('/admin/users', {
        params: { search: userSearch || undefined },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get<Category[]>('/items/categories'),
        api.get<Location[]>('/items/locations'),
      ]);
      setCategories(catRes.data);
      setLocations(locRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdminOrStaff) {
      navigate('/');
      return;
    }
    fetchStats();
    fetchClaims();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
    fetchMasterData();
  }, [isAuthenticated, isAdminOrStaff, navigate, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setSubmittingReview(true);
    try {
      await api.put(`/claims/${selectedClaim.claimID}/review`, {
        status: reviewStatus,
        reviewNote: reviewNote.trim() || undefined,
      });
      alert('Đã cập nhật xét duyệt yêu cầu thành công!');
      setSelectedClaim(null);
      setReviewNote('');
      fetchClaims();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverClaim) return;
    setSubmittingHandover(true);
    try {
      await api.post('/claims/handover', {
        claimID: handoverClaim.claimID,
        handoverLocation: handoverLocation.trim(),
        note: handoverNote.trim() || undefined,
      });
      alert('Đã lập biên bản bàn giao và hoàn tất trao trả tài sản!');
      setHandoverClaim(null);
      setHandoverNote('');
      fetchClaims();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      alert(res.data.message);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleChangeRole = async (userId: number, roleId: number) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { roleID: roleId });
      alert(res.data.message);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/admin/categories', { categoryName: newCatName.trim() });
      setNewCatName('');
      alert('Thêm danh mục thành công!');
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi.');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocBuilding.trim() || !newLocArea.trim()) return;
    try {
      await api.post('/admin/locations', {
        building: newLocBuilding.trim(),
        areaName: newLocArea.trim(),
      });
      setNewLocBuilding('');
      setNewLocArea('');
      alert('Thêm địa điểm trường học thành công!');
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Phân hệ Quản trị & Tiếp nhận Bàn giao (Staff / Admin Portal)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Bảng Điều Khiển Hệ Thống UniFind
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Xin chào <strong>{user?.fullName}</strong> ({user?.role})! Bạn có quyền theo dõi thống kê hiệu quả, xét duyệt yêu cầu nhận đồ (Claims), quản trị tài khoản và danh mục toàn trường.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
            activeTab === 'stats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Thống kê tổng quan
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
            activeTab === 'claims' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Xét duyệt & Bàn giao đồ ({claims.length})
        </button>

        {user?.role === 'Admin' && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
                activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Quản lý Người dùng
            </button>

            <button
              onClick={() => setActiveTab('masterdata')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
                activeTab === 'masterdata' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tags className="w-4 h-4" />
              Danh mục & Địa điểm
            </button>
          </>
        )}
      </div>

      {/* Tab 1: Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Đang tổng hợp số liệu thống kê...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Tổng bài đăng</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalItems}</div>
                  <div className="text-xs text-slate-500">
                    Mất: <strong className="text-rose-600">{stats.totalLost}</strong> | Nhặt: <strong className="text-emerald-600">{stats.totalFound}</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Đã trao trả thành công</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">{stats.totalReturned}</div>
                  <div className="text-xs text-slate-500">
                    Tỷ lệ tìm lại: <strong className="text-blue-600 font-bold">{stats.returnRate}%</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Yêu cầu chờ xử lý</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">{stats.totalPendingClaims}</div>
                  <div className="text-xs text-slate-500">Claims đang cần đối chiếu</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Người dùng hệ thống</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{stats.totalUsers}</div>
                  <div className="text-xs text-slate-500">Sinh viên, Giảng viên, Staff</div>
                </div>
              </div>

              {/* Top Categories and Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Tags className="w-4 h-4 text-blue-600" />
                    Top Danh mục Thất lạc Nhiều Nhất
                  </h3>
                  <div className="space-y-3">
                    {stats.categoryStats.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-medium">{c.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, c.count * 20)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 w-6 text-right">{c.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Khu Vực Thường Xuyên Làm Rơi Đồ
                  </h3>
                  <div className="space-y-3">
                    {stats.locationStats.map((l, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-medium truncate max-w-[200px]">{l.location}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, l.count * 20)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 w-6 text-right">{l.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Tab 2: Claims Management */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách yêu cầu nhận đồ (Claims) ({claims.length})
            </h2>
            <button
              onClick={fetchClaims}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </button>
          </div>

          {loadingClaims ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Hiện không có yêu cầu nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <div key={claim.claimID} className="py-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        Đồ vật: {claim.itemTitle}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        (Người yêu cầu: <strong>{claim.userFullName}</strong>)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          claim.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : claim.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status === 'Approved'
                          ? 'Đã duyệt'
                          : claim.status === 'Rejected'
                          ? 'Bị từ chối'
                          : 'Chờ xử lý'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>Bằng chứng sinh viên đối chiếu:</strong> {claim.proofDescription}
                    </div>
                    {claim.contactPhone && (
                      <div>
                        <strong>Số điện thoại:</strong> {claim.contactPhone}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    {claim.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setReviewStatus('Approved');
                          setReviewNote('');
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Xét duyệt yêu cầu
                      </button>
                    )}

                    {claim.status === 'Approved' && (
                      <button
                        onClick={() => {
                          setHandoverClaim(claim);
                          setHandoverLocation('Văn phòng Thư viện Tầng 1');
                          setHandoverNote('');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Lập biên bản bàn giao đồ
                      </button>
                    )}

                    <a
                      href={`/items/${claim.itemID}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-blue-600 font-medium"
                    >
                      Xem bài đăng gốc ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users Management (Admin Only) */}
      {activeTab === 'users' && user?.role === 'Admin' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Quản lý Tài khoản Người dùng ({users.length})
            </h2>

            <form
              onSubmit={(e) => { e.preventDefault(); fetchUsers(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm tên, email, MSSV..."
                className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-xl text-xs hover:bg-indigo-700"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {loadingUsers ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">MSSV/Mã CB</th>
                    <th className="p-3">Vai trò</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.userID} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{u.fullName}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.studentStaffId || '—'}</td>
                      <td className="p-3">
                        <select
                          value={u.role === 'Admin' ? 1 : u.role === 'Staff' ? 2 : u.role === 'Lecturer' ? 3 : 4}
                          onChange={(e) => handleChangeRole(u.userID, Number(e.target.value))}
                          className="text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1"
                        >
                          <option value={1}>Admin</option>
                          <option value={2}>Staff (Nhân viên)</option>
                          <option value={3}>Lecturer (Giảng viên)</option>
                          <option value={4}>Student (Sinh viên)</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.userID)}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                            u.isActive !== false
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.isActive !== false ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {u.isActive !== false ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Masterdata (Admin Only) */}
      {activeTab === 'masterdata' && user?.role === 'Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Tags className="w-4 h-4 text-blue-600" />
              Danh mục đồ vật ({categories.length})
            </h3>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Thêm danh mục mới (Vd: Ô dù, Đồng hồ...)"
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {categories.map((c) => (
                <div key={c.categoryID} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-medium">{c.categoryName}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">ID: {c.categoryID}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Địa điểm trong trường ({locations.length})
            </h3>

            <form onSubmit={handleAddLocation} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newLocBuilding}
                  onChange={(e) => setNewLocBuilding(e.target.value)}
                  placeholder="Tòa nhà (Vd: Tòa D)"
                  className="text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <input
                  type="text"
                  required
                  value={newLocArea}
                  onChange={(e) => setNewLocArea(e.target.value)}
                  placeholder="Khu vực (Vd: Phòng D102)"
                  className="text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm địa điểm mới
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {locations.map((l) => (
                <div key={l.locationID} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-medium">{l.building} - {l.areaName}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{l.campus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Xét duyệt Claim #{selectedClaim.claimID}
            </h3>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
              <div><strong>Đồ vật:</strong> {selectedClaim.itemTitle}</div>
              <div><strong>Người nhận:</strong> {selectedClaim.userFullName}</div>
              <div><strong>Bằng chứng:</strong> {selectedClaim.proofDescription}</div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Quyết định</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Approved')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStatus === 'Approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Chấp thuận (Approved)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Rejected')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStatus === 'Rejected'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Từ chối (Rejected)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ghi chú / Hướng dẫn sinh viên</label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Ví dụ: Đã đối chiếu đúng CCCD. Mời bạn đến quầy Thư viện Tầng 1 nhận lại..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  {submittingReview ? 'Đang lưu...' : 'Lưu kết quả'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {handoverClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Lập biên bản bàn giao tài sản
            </h3>

            <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
              <div><strong>Đồ vật trao trả:</strong> {handoverClaim.itemTitle}</div>
              <div><strong>Người nhận tài sản:</strong> {handoverClaim.userFullName}</div>
              <div><strong>Cán bộ xác nhận:</strong> {user?.fullName} ({user?.role})</div>
            </div>

            <form onSubmit={handleHandoverSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Địa điểm bàn giao thực tế *</label>
                <input
                  type="text"
                  required
                  value={handoverLocation}
                  onChange={(e) => setHandoverLocation(e.target.value)}
                  placeholder="Vd: Quầy bạn đọc Thư viện Tầng 1"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ghi chú biên bản bàn giao</label>
                <textarea
                  rows={3}
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="Sinh viên đã kiểm tra và nhận lại đầy đủ tài sản..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingHandover}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {submittingHandover ? 'Đang xác nhận...' : 'Xác nhận hoàn tất bàn giao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
