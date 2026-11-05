import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { AuthResponse } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentStaffId, setStudentStaffId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        const payload = {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          studentStaffId: studentStaffId.trim() || undefined,
          roleID: 4, // Student
        };
        const res = await api.post<AuthResponse>('/auth/register', payload);
        login(res.data);
      } else {
        const res = await api.post<AuthResponse>('/auth/login', {
          email: email.trim(),
          password,
        });
        login(res.data);
      }
      navigate('/');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        'Đăng nhập hoặc đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'student' | 'admin' | 'staff') => {
    if (type === 'admin') {
      setEmail('admin@unifind.edu.vn');
      setPassword('Password123@');
    } else if (type === 'staff') {
      setEmail('nam.nv@unifind.edu.vn');
      setPassword('Password123@');
    } else {
      setEmail('bao.cng@unifind.edu.vn');
      setPassword('Password123@');
    }
    setIsRegister(false);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isRegister ? 'Tạo tài khoản UniFind' : 'Chào mừng bạn trở lại'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Đăng ký bằng email sinh viên trường để sử dụng dịch vụ'
              : 'Đăng nhập để đăng bài và theo dõi đồ thất lạc'}
          </p>
        </div>

        {/* Demo Accounts Quick Pill */}
        {!isRegister && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-center">
            <div className="text-[11px] font-semibold text-slate-500">
              ⚡ Điền nhanh tài khoản demo kiểm thử:
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleFillDemo('student')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 font-medium transition"
              >
                Sinh viên (Bảo)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 font-medium transition"
              >
                Thủ thư (Staff)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 font-medium transition"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mã sinh viên (MSSV)</label>
                <input
                  type="text"
                  value={studentStaffId}
                  onChange={(e) => setStudentStaffId(e.target.value)}
                  placeholder="SV202401"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@unifind.edu.vn"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mật khẩu *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50 text-sm"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập ngay'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isRegister
              ? 'Đã có tài khoản? Đăng nhập'
              : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

