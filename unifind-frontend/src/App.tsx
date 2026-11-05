import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { LoginPage } from './pages/LoginPage';
import { MyItemsPage } from './pages/MyItemsPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/items" element={<HomePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/create" element={<CreateItemPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/my-items" element={<MyItemsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <p>© 2026 UniFind - Hệ thống tìm kiếm và quản lý đồ thất lạc trong trường đại học.</p>
            <p className="mt-1">Đồ án chuyên ngành Công nghệ phần mềm</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
