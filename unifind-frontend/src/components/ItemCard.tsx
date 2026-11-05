import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, CheckCircle2, Clock } from 'lucide-react';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isLost = item.itemType === 'Lost';
  const formattedDate = new Date(item.lostFoundDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const thumbnail = item.imageUrls && item.imageUrls.length > 0
    ? item.imageUrls[0]
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600';

  const isHandedOver = item.status === 'Returned_HandedOver';

  return (
    <Link
      to={`/items/${item.itemID}`}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${
              isLost
                ? 'bg-rose-500/90 text-white'
                : 'bg-emerald-600/90 text-white'
            }`}
          >
            {isLost ? 'Mất đồ' : 'Nhặt được'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isHandedOver ? (
            <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã trao trả
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-500/90 text-white px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Đang tìm kiếm
            </span>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span>{item.categoryName}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 mb-2">
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Meta info footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.locationName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span>Bởi {item.userFullName.split(' ').pop()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

