import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, Lock, ShieldAlert, Sparkles, Image, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';
import type { Category, Location } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const initialType = searchParams.get('type') === 'Found' ? 'Found' : 'Lost';

  const [itemType, setItemType] = useState<'Lost' | 'Found'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privateDescription, setPrivateDescription] = useState('');
  const [categoryID, setCategoryID] = useState<number | ''>('');
  const [locationID, setLocationID] = useState<number | ''>('');
  const [lostFoundDate, setLostFoundDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [custodyType, setCustodyType] = useState('SelfRetained');
  const [storageLocation, setStorageLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get<Category[]>('/items/categories'),
          api.get<Location[]>('/items/locations'),
        ]);
        setCategories(catRes.data);
        setLocations(locRes.data);

        if (catRes.data.length > 0) setCategoryID(catRes.data[0].categoryID);
        if (locRes.data.length > 0) setLocationID(locRes.data[0].locationID);
      } catch (err) {
        console.error('Error fetching master data', err);
      }
    };

    fetchMasterData();
  }, [isAuthenticated, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImageUrl(res.data.url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tải ảnh lên.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryID || !locationID || !title.trim() || !description.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        privateDescription: privateDescription.trim() || null,
        itemType,
        lostFoundDate: new Date(lostFoundDate).toISOString(),
        categoryID: Number(categoryID),
        locationID: Number(locationID),
        custodyType,
        currentStorageLocation: custodyType === 'HandedToOffice' ? storageLocation : null,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      };

      const res = await api.post('/items', payload);
      alert('Đăng bài thành công!');
      navigate(`/items/${res.data.itemID}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài đăng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Đăng tin đồ thất lạc
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Cung cấp thông tin chi tiết và chính xác sẽ giúp quá trình tìm kiếm và xác minh đồ vật diễn ra nhanh chóng nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Loại bài đăng</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setItemType('Lost')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold text-sm transition ${
                itemType === 'Lost'
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Tôi bị mất đồ (Lost)
            </button>
            <button
              type="button"
              onClick={() => setItemType('Found')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold text-sm transition ${
                itemType === 'Found'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Tôi nhặt được đồ (Found)
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Tiêu đề bài đăng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Rơi ví da màu đen tại Canteen..."
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Danh mục đồ vật <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={categoryID}
              onChange={(e) => setCategoryID(Number(e.target.value))}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
            >
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Khu vực trong trường <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={locationID}
              onChange={(e) => setLocationID(Number(e.target.value))}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
            >
              {locations.map((l) => (
                <option key={l.locationID} value={l.locationID}>
                  {l.building} - {l.areaName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Thời gian ước tính {itemType === 'Lost' ? 'bị mất' : 'nhặt được'}
          </label>
          <input
            type="datetime-local"
            value={lostFoundDate}
            onChange={(e) => setLostFoundDate(e.target.value)}
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Public Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Mô tả công khai <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả các đặc điểm chung: màu sắc, nhãn hiệu cơ bản, vị trí cụ thể lúc rơi hoặc nhặt được..."
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Private Description (Bảo mật) */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Đặc điểm nhận dạng riêng tư (Bảo mật - Chỉ bạn & Nhân viên thấy)</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Giúp đối chiếu khi có người liên hệ xin nhận lại. Hãy giữ kín những chi tiết đặc biệt như: tên trên thẻ, số tiền cụ thể, sticker bên trong nắp, hoặc mật khẩu màn hình khóa.
          </p>
          <textarea
            rows={2}
            value={privateDescription}
            onChange={(e) => setPrivateDescription(e.target.value)}
            placeholder="Ví dụ: Trong ví có 3 tờ 50k, 1 thẻ ngân hàng đuôi số 1234, vết trầy ở góc dưới bên phải..."
            className="w-full text-xs p-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white"
          />
        </div>

        {/* Image Upload / URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-blue-500" />
            Hình ảnh đồ vật
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition shrink-0"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Upload className="w-4 h-4 text-blue-600" />
              )}
              {uploadingImage ? 'Đang tải ảnh...' : 'Tải ảnh từ máy tính'}
            </button>

            <span className="text-xs text-slate-400">hoặc</span>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Dán đường dẫn ảnh trực tiếp (URL)..."
              className="flex-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {imageUrl && (
            <div className="mt-2 relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* Found specific options */}
        {itemType === 'Found' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Phương thức bàn giao tài sản</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="custody"
                  checked={custodyType === 'SelfRetained'}
                  onChange={() => setCustodyType('SelfRetained')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Tự giữ tài sản</div>
                  <div className="text-[11px] text-slate-500">Tôi tự giữ và chờ người liên hệ nhận</div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="custody"
                  checked={custodyType === 'HandedToOffice'}
                  onChange={() => setCustodyType('HandedToOffice')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Bàn giao cho Văn phòng/Bảo vệ</div>
                  <div className="text-[11px] text-slate-500">Tôi đã gửi lại văn phòng trường</div>
                </div>
              </label>
            </div>

            {custodyType === 'HandedToOffice' && (
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="Nhập nơi bạn đã gửi đồ (Vd: Quầy bạn đọc Thư viện, Phòng CTSV...)"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            )}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md transition disabled:opacity-50"
          >
            <PlusCircle className="w-5 h-5" />
            {submitting ? 'Đang gửi bài...' : 'Đăng bài lên hệ thống UniFind'}
          </button>
        </div>
      </form>
    </div>
  );
};
