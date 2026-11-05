import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ShieldAlert, Sparkles, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';
import type { Item, Category, Location, PagedResult } from '../types';
import { ItemCard } from '../components/ItemCard';

export const HomePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(''); // '' | 'Lost' | 'Found'
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>(undefined);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        pageSize: 12,
        pageNumber: 1,
      };
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
      if (selectedType) params.itemType = selectedType;
      if (selectedCategory) params.categoryID = selectedCategory;
      if (selectedLocation) params.locationID = selectedLocation;

      const res = await api.get<PagedResult<Item>>('/items', { params });
      setItems(res.data.items);
    } catch (err) {
      console.error('Error fetching items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get<Category[]>('/items/categories'),
          api.get<Location[]>('/items/locations'),
        ]);
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (err) {
        console.error('Error fetching master data', err);
      }
    };

    fetchMasterData();
    fetchItems();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white px-6 py-12 md:py-20 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Hệ thống Quản lý Đồ thất lạc Đại học Thông minh
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Đừng lo lắng khi làm rơi đồ tại trường học
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-normal">
            UniFind kết nối trực tiếp sinh viên mất đồ và người nhặt được thông qua quy trình xác minh bảo mật, tập trung và minh bạch.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/create?type=Lost"
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-rose-500/25 transition transform hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-4 h-4" />
              Tôi bị mất đồ
            </Link>
            <Link
              to="/create?type=Found"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Tôi nhặt được đồ
            </Link>
          </div>

          {/* Search Box inside Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-4 max-w-2xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-2xl text-slate-800 border border-slate-100"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Nhập tên đồ vật (ví tiền, thẻ sinh viên, Casio 580...)"
              className="w-full px-3 py-2 text-sm text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shrink-0"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Filter and Tab Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Item Type Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => { setSelectedType(''); fetchItems(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === '' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả bài đăng
            </button>
            <button
              onClick={() => { setSelectedType('Lost'); fetchItems(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'Lost' ? 'bg-white text-rose-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đồ đang mất
            </button>
            <button
              onClick={() => { setSelectedType('Found'); fetchItems(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'Found' ? 'bg-white text-emerald-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đồ nhặt được
            </button>
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedLocation ?? ''}
              onChange={(e) => {
                setSelectedLocation(e.target.value ? Number(e.target.value) : undefined);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả địa điểm</option>
              {locations.map((loc) => (
                <option key={loc.locationID} value={loc.locationID}>
                  {loc.building} - {loc.areaName}
                </option>
              ))}
            </select>

            <button
              onClick={fetchItems}
              title="Làm mới"
              className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Categories Chip Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory(undefined); fetchItems(); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
              selectedCategory === undefined
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryID}
              onClick={() => { setSelectedCategory(cat.categoryID); fetchItems(); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                selectedCategory === cat.categoryID
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </section>

      {/* Items Grid */}
      <section>
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Đang tải danh sách đồ vật...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Không tìm thấy bài đăng phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách đồ thất lạc trong trường.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.itemID} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
