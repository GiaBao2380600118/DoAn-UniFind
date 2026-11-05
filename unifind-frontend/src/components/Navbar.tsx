import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, PlusCircle, User, LogOut, ShieldCheck, 
  Bell, Check, Menu, X, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdminOrStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside to close noti dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number, linkUrl?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationID === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (linkUrl) {
        setNotiOpen(false);
        navigate(linkUrl);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UniFind
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs text-slate-400 font-medium tracking-tight">
                Campus Lost & Found
              </span>
            </div>
          </Link>

          {/* Nav links desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
              Trang chủ
            </Link>
            <Link to="/items" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
              Tất cả đồ vật
            </Link>
            {isAdminOrStaff && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Quản trị {user?.role === 'Staff' ? 'Nhân viên' : 'Admin'}
              </Link>
            )}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/create"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng tin mới
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {/* Notification Dropdown */}
                <div className="relative" ref={notiRef}>
                  <button
                    onClick={() => setNotiOpen(!notiOpen)}
                    className="relative p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition"
                    title="Thông báo"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notiOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 z-50">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-sm text-slate-900">
                          Thông báo ({unreadCount} chưa đọc)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Đã đọc tất cả
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            Chưa có thông báo nào.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.notificationID}
                              onClick={() => handleMarkAsRead(n.notificationID, n.linkUrl)}
                              className={`p-2.5 rounded-xl cursor-pointer transition text-left space-y-1 ${
                                n.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/70 hover:bg-blue-50 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/my-items"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition pl-1"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="max-w-[120px] truncate">{user?.fullName}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Trang chủ
          </Link>
          <Link
            to="/items"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Tất cả đồ vật
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-blue-600"
          >
            + Đăng tin mới
          </Link>
          {isAdminOrStaff && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-indigo-600"
            >
              Quản trị hệ thống
            </Link>
          )}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/my-items"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-700"
                >
                  Hồ sơ cá nhân ({user?.fullName})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-base font-medium text-rose-600"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-blue-600 text-white font-semibold py-2 rounded-xl"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
