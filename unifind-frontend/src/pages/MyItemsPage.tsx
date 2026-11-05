import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Send, PlusCircle, CheckCircle2, Clock, XCircle, 
  User, Lock, Save, KeyRound, AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import type { Item, Claim } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ItemCard } from '../components/ItemCard';

export const MyItemsPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'items' | 'claims' | 'profile'>('items');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentStaffId, setStudentStaffId] = useState(user?.studentStaffId || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setStudentStaffId(user.studentStaffId || '');
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          api.get<Item[]>('/items/my-items'),
          api.get<Claim[]>('/claims/my-claims'),
        ]);
        setMyItems(itemsRes.data);
        setMyClaims(claimsRes.data);
      } catch (err) {
        console.error('Error fetching my data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg(null);
    try {
      await api.put('/auth/profile', {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        studentStaffId: studentStaffId.trim() || null,
      });

      // Update local storage user
      const token = localStorage.getItem('unifind_token') || '';
      login({
        token,
        userID: user!.userID,
        fullName: fullName.trim(),
        email: user!.email,
        role: user!.role,
        studentStaffId: studentStaffId.trim(),
      });

      setProfileSuccessMsg('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);
    setPasswordError(null);

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">{user?.fullName}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{user?.email}</span>
            <span>•</span>
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {user?.role}
            </span>
            {user?.studentStaffId && (
              <>
                <span>•</span>
                <span>MSSV/Mã CB: <strong>{user?.studentStaffId}</strong></span>
              </>
            )}
          </div>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          Đăng bài mới
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
            activeTab === 'items'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Bài đăng của tôi ({myItems.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Yêu cầu nhận đồ đã gửi ({myClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition shrink-0 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Hồ sơ & Đổi mật khẩu
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      ) : activeTab === 'items' ? (
        myItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">Bạn chưa đăng bài nào</h3>
            <p className="text-xs text-slate-400">Nếu bạn bị mất đồ hoặc nhặt được tài sản, hãy đăng tin để mọi người cùng hỗ trợ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.map((item) => (
              <ItemCard key={item.itemID} item={item} />
            ))}
          </div>
        )
      ) : activeTab === 'claims' ? (
        myClaims.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Send className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">Chưa có yêu cầu nhận đồ nào</h3>
            <p className="text-xs text-slate-400">Khi bạn tìm thấy đồ vật của mình trên UniFind, bạn có thể gửi yêu cầu xác minh nhận lại.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myClaims.map((claim) => (
              <div
                key={claim.claimID}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <Link
                    to={`/items/${claim.itemID}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                  >
                    Bài đăng: {claim.itemTitle}
                  </Link>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      claim.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : claim.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {claim.status === 'Approved' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã được chấp thuận
                      </>
                    ) : claim.status === 'Rejected' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Bị từ chối
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Đang chờ duyệt
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    <strong>Bằng chứng bạn đã cung cấp:</strong> {claim.proofDescription}
                  </div>
                  {claim.reviewNote && (
                    <div className="text-indigo-700 bg-indigo-50 p-2.5 rounded-xl mt-2 font-medium">
                      <strong>Phản hồi từ người phụ trách:</strong> {claim.reviewNote}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Profile & Change Password Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Thông tin cá nhân */}
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Thông tin cá nhân
            </h3>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email (Không đổi)</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mã sinh viên / Cán bộ</label>
              <input
                type="text"
                value={studentStaffId}
                onChange={(e) => setStudentStaffId(e.target.value)}
                placeholder="SV202401"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số điện thoại liên hệ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
            >
              <Save className="w-4 h-4" />
              {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>

          {/* Form Đổi mật khẩu */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              Đổi mật khẩu
            </h3>

            {passwordMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
            >
              <Lock className="w-4 h-4" />
              {passwordSaving ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
