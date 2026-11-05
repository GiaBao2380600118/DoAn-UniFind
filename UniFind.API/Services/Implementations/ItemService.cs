using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.DTOs.Items;
using UniFind.API.Models.Entities;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Services.Implementations
{
    public class ItemService : IItemService
    {
        private readonly UniFindDbContext _context;

        public ItemService(UniFindDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ItemDto>> GetItemsAsync(ItemFilterDto filter)
        {
            var query = _context.Items
                .Include(i => i.User)
                .Include(i => i.Category)
                .Include(i => i.Location)
                .Include(i => i.Images)
                .AsQueryable();

            // Nếu không truyền status cụ thể, chỉ hiển thị bài đã duyệt
            if (string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(i => i.Status == "Approved_Searching" || i.Status == "VerifyingClaim");
            }
            else
            {
                query = query.Where(i => i.Status == filter.Status);
            }

            if (!string.IsNullOrWhiteSpace(filter.ItemType))
            {
                query = query.Where(i => i.ItemType.ToLower() == filter.ItemType.ToLower());
            }

            if (filter.CategoryID.HasValue && filter.CategoryID.Value > 0)
            {
                query = query.Where(i => i.CategoryID == filter.CategoryID.Value);
            }

            if (filter.LocationID.HasValue && filter.LocationID.Value > 0)
            {
                query = query.Where(i => i.LocationID == filter.LocationID.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim().ToLower();
                query = query.Where(i => i.Title.ToLower().Contains(kw) || i.Description.ToLower().Contains(kw));
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(i => i.LostFoundDate >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(i => i.LostFoundDate <= filter.ToDate.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(i => new ItemDto
                {
                    ItemID = i.ItemID,
                    Title = i.Title,
                    Description = i.Description,
                    ItemType = i.ItemType,
                    LostFoundDate = i.LostFoundDate,
                    Status = i.Status,
                    CustodyType = i.CustodyType,
                    CurrentStorageLocation = i.CurrentStorageLocation,
                    CreatedAt = i.CreatedAt,
                    UserID = i.UserID,
                    UserFullName = i.User != null ? i.User.FullName : string.Empty,
                    CategoryID = i.CategoryID,
                    CategoryName = i.Category != null ? i.Category.CategoryName : string.Empty,
                    LocationID = i.LocationID,
                    LocationName = i.Location != null ? $"{i.Location.Building} - {i.Location.AreaName}" : string.Empty,
                    ImageUrls = i.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();

            return new PagedResult<ItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<ItemDetailDto?> GetItemByIdAsync(int id, int? currentUserId, string? currentUserRole)
        {
            var item = await _context.Items
                .Include(i => i.User)
                .Include(i => i.Category)
                .Include(i => i.Location)
                .Include(i => i.Images)
                .FirstOrDefaultAsync(i => i.ItemID == id);

            if (item == null) return null;

            var dto = new ItemDetailDto
            {
                ItemID = item.ItemID,
                Title = item.Title,
                Description = item.Description,
                ItemType = item.ItemType,
                LostFoundDate = item.LostFoundDate,
                Status = item.Status,
                CustodyType = item.CustodyType,
                CurrentStorageLocation = item.CurrentStorageLocation,
                CreatedAt = item.CreatedAt,
                UserID = item.UserID,
                UserFullName = item.User?.FullName ?? string.Empty,
                CategoryID = item.CategoryID,
                CategoryName = item.Category?.CategoryName ?? string.Empty,
                LocationID = item.LocationID,
                LocationName = item.Location != null ? $"{item.Location.Building} - {item.Location.AreaName}" : string.Empty,
                ImageUrls = item.Images.Select(img => img.ImageUrl).ToList()
            };

            // QUY TẮC BẢO MẬT: Chỉ trả PrivateDescription nếu là người tạo hoặc Staff/Admin
            bool canViewPrivate = (currentUserId.HasValue && currentUserId.Value == item.UserID)
                                  || currentUserRole == "Admin"
                                  || currentUserRole == "Staff";

            if (canViewPrivate)
            {
                dto.PrivateDescription = item.PrivateDescription;
            }

            return dto;
        }

        public async Task<ItemDto> CreateItemAsync(CreateItemDto dto, int userId)
        {
            var item = new Item
            {
                UserID = userId,
                CategoryID = dto.CategoryID,
                LocationID = dto.LocationID,
                Title = dto.Title.Trim(),
                Description = dto.Description.Trim(),
                PrivateDescription = dto.PrivateDescription?.Trim(),
                ItemType = dto.ItemType,
                LostFoundDate = dto.LostFoundDate,
                Status = "Approved_Searching", // Mặc định tự động duyệt trong bản MVP (hoặc "PendingApproval" nếu cần duyệt)
                CustodyType = dto.CustodyType,
                CurrentStorageLocation = dto.CurrentStorageLocation,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
            {
                bool isThumb = true;
                foreach (var url in dto.ImageUrls)
                {
                    item.Images.Add(new ItemImage
                    {
                        ImageUrl = url,
                        IsThumbnail = isThumb,
                        UploadedAt = DateTime.UtcNow
                    });
                    isThumb = false;
                }
            }

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            // Lấy lại kèm thông tin liên quan
            return (await GetItemByIdAsync(item.ItemID, userId, null))!;
        }

        public async Task<bool> UpdateItemStatusAsync(int itemId, string newStatus, int changedByUserId, string? reason)
        {
            var item = await _context.Items.FindAsync(itemId);
            if (item == null) return false;

            var oldStatus = item.Status;
            item.Status = newStatus;
            item.UpdatedAt = DateTime.UtcNow;

            _context.ItemStatusHistories.Add(new ItemStatusHistory
            {
                ItemID = itemId,
                ChangedBy = changedByUserId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                Reason = reason,
                ChangedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ItemDto>> GetMyItemsAsync(int userId)
        {
            return await _context.Items
                .Where(i => i.UserID == userId)
                .Include(i => i.Category)
                .Include(i => i.Location)
                .Include(i => i.Images)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new ItemDto
                {
                    ItemID = i.ItemID,
                    Title = i.Title,
                    Description = i.Description,
                    ItemType = i.ItemType,
                    LostFoundDate = i.LostFoundDate,
                    Status = i.Status,
                    CustodyType = i.CustodyType,
                    CurrentStorageLocation = i.CurrentStorageLocation,
                    CreatedAt = i.CreatedAt,
                    UserID = i.UserID,
                    UserFullName = i.User != null ? i.User.FullName : string.Empty,
                    CategoryID = i.CategoryID,
                    CategoryName = i.Category != null ? i.Category.CategoryName : string.Empty,
                    LocationID = i.LocationID,
                    LocationName = i.Location != null ? $"{i.Location.Building} - {i.Location.AreaName}" : string.Empty,
                    ImageUrls = i.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<Category>> GetCategoriesAsync()
        {
            return await _context.Categories.Where(c => c.IsActive).ToListAsync();
        }

        public async Task<List<Location>> GetLocationsAsync()
        {
            return await _context.Locations.Where(l => l.IsActive).ToListAsync();
        }
    }
}

