import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LogIn, UserPlus, AlertCircle, Sparkles, Shield, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
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
  const [quickLoading, setQuickLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Normal Submit
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

  // 1-Click Instant Demo Login (For Grading & Testing)
  const handleInstantDemoLogin = async (role: 'student' | 'staff' | 'admin') => {
    setQuickLoading(role);
    setErrorMessage(null);
    try {
      const res = await api.post<AuthResponse>('/auth/demo-login', { role });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể đăng nhập tài khoản demo.');
    } finally {
      setQuickLoading(null);
    }
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
            {isRegister ? 'Tạo tài khoản UniFind' : 'Đăng nhập UniFind'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Đăng ký tài khoản sinh viên để sử dụng toàn bộ dịch vụ'
              : 'Chọn đăng nhập nhanh 1-Click hoặc nhập tài khoản cá nhân'}
          </p>
        </div>

        {/* 1-CLICK INSTANT DEMO BUTTONS */}
        {!isRegister && (
          <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Đăng nhập nhanh 1-Click để kiểm thử:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={!!quickLoading}
                onClick={() => handleInstantDemoLogin('student')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 shadow-sm transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Sinh viên (Chu Nguyễn Gia Bảo)</span>
                </div>
                {quickLoading === 'student' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <span className="text-[10px] text-blue-500 font-bold">Vào ngay →</span>
                )}
              </button>

              <button
                type="button"
                disabled={!!quickLoading}
                onClick={() => handleInstantDemoLogin('staff')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 shadow-sm transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Nhân viên / Thủ thư (Thầy Nam)</span>
                </div>
                {quickLoading === 'staff' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold">Duyệt đồ →</span>
                )}
              </button>

              <button
                type="button"
                disabled={!!quickLoading}
                onClick={() => handleInstantDemoLogin('admin')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 shadow-sm transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Quản trị viên (Admin)</span>
                </div>
                {quickLoading === 'admin' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                ) : (
                  <span className="text-[10px] text-purple-600 font-bold">Quản trị →</span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400">HOẶC ĐĂNG NHẬP THƯỜNG</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

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
