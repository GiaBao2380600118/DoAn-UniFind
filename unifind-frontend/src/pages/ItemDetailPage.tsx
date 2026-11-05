import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Calendar, Tag, ShieldCheck, ArrowLeft, Send, 
  AlertCircle, CheckCircle2, User, Lock, Phone, AlertTriangle 
} from 'lucide-react';
import api from '../services/api';
import type { Item, Claim } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdminOrStaff } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
  const [proofDescription, setProofDescription] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  // Claims list (if owner or staff)
  const [itemClaims, setItemClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get<Item>(`/items/${id}`);
        setItem(res.data);

        // Nếu là chủ sở hữu hoặc Staff/Admin, lấy danh sách các Claims đã nộp cho món này
        if (isAuthenticated && (res.data.userID === user?.userID || isAdminOrStaff)) {
          const claimsRes = await api.get<Claim[]>(`/claims/item/${id}`);
          setItemClaims(claimsRes.data);
        }
      } catch (err: any) {
        setError('Không thể tìm thấy thông tin bài đăng hoặc bài đăng đã bị gỡ.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, isAuthenticated, user, isAdminOrStaff]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDescription.trim()) return;

    setSubmittingClaim(true);
    try {
      await api.post('/claims', {
        itemID: Number(id),
        proofDescription: proofDescription.trim(),
        contactPhone: contactPhone.trim() || undefined,
      });

      setClaimSuccessMsg('Yêu cầu nhận đồ đã được gửi thành công! Người giữ tài sản hoặc nhân viên sẽ đối chiếu và phản hồi bạn sớm.');
      setClaimModalOpen(false);
      setProofDescription('');
      setContactPhone('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu nhận đồ.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Đang tải chi tiết đồ vật...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy bài đăng</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const isLost = item.itemType === 'Lost';
  const isOwner = user?.userID === item.userID;
  const isHandedOver = item.status === 'Returned_HandedOver';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>

      {claimSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{claimSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <img
              src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isLost ? 'Tin báo mất đồ' : 'Tin nhặt được đồ'}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              {item.categoryName}
            </span>

            {isHandedOver ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã trao trả thành công
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Đang tìm chủ nhân
              </span>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {item.title}
            </h1>

            {/* Meta details */}
            <div className="space-y-2.5 text-sm text-slate-600 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Địa điểm:</strong> {item.locationName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Thời gian {isLost ? 'mất' : 'nhặt được'}:</strong>{' '}
                  {new Date(item.lostFoundDate).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Người đăng:</strong> {item.userFullName}
                </span>
              </div>
              {item.currentStorageLocation && (
                <div className="flex items-center gap-2 text-indigo-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Vị trí lưu kho:</strong> {item.currentStorageLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Public Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mô tả chi tiết công khai
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Private Description (Only if permitted) */}
            {item.privateDescription && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-amber-900">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đặc điểm nhận dạng riêng tư (Dành cho kiểm duyệt/đối chiếu):</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {item.privateDescription}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100">
            {!isHandedOver && !isOwner && (
              isAuthenticated ? (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  Đây là đồ của tôi – Gửi yêu cầu nhận lại
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition"
                >
                  Đăng nhập để gửi yêu cầu nhận đồ
                </Link>
              )
            )}

            {isOwner && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center text-xs text-blue-700 font-medium">
                Bạn là người tạo bài đăng này. Bạn có thể xem các yêu cầu nhận đồ ở bảng bên dưới.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claims List for Owner or Staff */}
      {(isOwner || isAdminOrStaff) && itemClaims.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Danh sách yêu cầu nhận lại tài sản ({itemClaims.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {itemClaims.map((claim) => (
              <div key={claim.claimID} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">
                    Người yêu cầu: {claim.userFullName}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    claim.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {claim.status === 'Approved' ? 'Đã duyệt' : claim.status === 'Rejected' ? 'Bị từ chối' : 'Chờ xác minh'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <strong>Bằng chứng đối chiếu:</strong> {claim.proofDescription}
                </div>
                {claim.contactPhone && (
                  <div className="text-xs text-slate-500">
                    SĐT liên hệ: <strong>{claim.contactPhone}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Xác minh quyền sở hữu tài sản
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Để tránh nhận nhầm hoặc gian lận, vui lòng cung cấp các đặc điểm nhận dạng đặc trưng mà người ngoài không biết (ví dụ: vết trầy, số tiền bên trong, tên thẻ ngân hàng, sticker riêng...).
              </p>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Thông tin chứng minh quyền sở hữu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Mô tả chi tiết những đặc điểm bí mật để đối chiếu..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Số điện thoại liên hệ (để gọi nhận đồ)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                >
                  {submittingClaim ? 'Đang gửi...' : 'Xác nhận gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

