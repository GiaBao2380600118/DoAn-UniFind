export interface User {
  userID: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  studentStaffId?: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  userID: number;
  fullName: string;
  email: string;
  role: string;
  studentStaffId?: string;
  avatarUrl?: string;
}

export interface Category {
  categoryID: number;
  categoryName: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

export interface Location {
  locationID: number;
  campus: string;
  building: string;
  areaName: string;
  description?: string;
  isActive: boolean;
}

export interface Item {
  itemID: number;
  title: string;
  description: string;
  privateDescription?: string;
  itemType: 'Lost' | 'Found';
  lostFoundDate: string;
  status: string;
  custodyType: string;
  currentStorageLocation?: string;
  createdAt: string;
  userID: number;
  userFullName: string;
  categoryID: number;
  categoryName: string;
  locationID: number;
  locationName: string;
  imageUrls: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface Claim {
  claimID: number;
  itemID: number;
  itemTitle: string;
  itemType: string;
  userID: number;
  userFullName: string;
  proofDescription: string;
  contactPhone?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewedBy?: number;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface NotificationItem {
  notificationID: number;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export interface StatisticsData {
  totalItems: number;
  totalLost: number;
  totalFound: number;
  totalReturned: number;
  totalPendingClaims: number;
  totalUsers: number;
  returnRate: number;
  categoryStats: { category: string; count: number }[];
  locationStats: { location: string; count: number }[];
}
