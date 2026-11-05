using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.DTOs.Claims;
using UniFind.API.Models.Entities;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Services.Implementations
{
    public class ClaimService : IClaimService
    {
        private readonly UniFindDbContext _context;

        public ClaimService(UniFindDbContext context)
        {
            _context = context;
        }

        public async Task<ClaimDto?> CreateClaimAsync(CreateClaimDto dto, int userId)
        {
            var item = await _context.Items.FindAsync(dto.ItemID);
            if (item == null || item.Status == "Returned_HandedOver")
            {
                return null;
            }

            var claim = new Claim
            {
                ItemID = dto.ItemID,
                UserID = userId,
                ProofDescription = dto.ProofDescription.Trim(),
                ContactPhone = dto.ContactPhone,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Claims.Add(claim);

            // Cập nhật trạng thái đồ vật sang đang xác minh nếu đang mở
            if (item.Status == "Approved_Searching")
            {
                item.Status = "VerifyingClaim";
            }

            // Tạo thông báo cho người đăng bài
            _context.Notifications.Add(new Notification
            {
                UserID = item.UserID,
                Title = "Có yêu cầu nhận đồ mới",
                Message = $"Có người đã gửi thông tin xác minh cho bài đăng: '{item.Title}'",
                LinkUrl = $"/items/{item.ItemID}",
                Type = "NewClaim",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return new ClaimDto
            {
                ClaimID = claim.ClaimID,
                ItemID = item.ItemID,
                ItemTitle = item.Title,
                ItemType = item.ItemType,
                UserID = userId,
                UserFullName = user?.FullName ?? string.Empty,
                ProofDescription = claim.ProofDescription,
                ContactPhone = claim.ContactPhone,
                Status = claim.Status,
                CreatedAt = claim.CreatedAt
            };
        }

        public async Task<List<ClaimDto>> GetClaimsByItemAsync(int itemId, int currentUserId, string currentUserRole)
        {
            var item = await _context.Items.FindAsync(itemId);
            if (item == null) return new List<ClaimDto>();

            // Chỉ người đăng bài hoặc Staff/Admin mới được xem danh sách Claim của món đồ
            if (item.UserID != currentUserId && currentUserRole != "Admin" && currentUserRole != "Staff")
            {
                return new List<ClaimDto>();
            }

            return await _context.Claims
                .Where(c => c.ItemID == itemId)
                .Include(c => c.User)
                .Include(c => c.Reviewer)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ClaimDto
                {
                    ClaimID = c.ClaimID,
                    ItemID = c.ItemID,
                    ItemTitle = item.Title,
                    ItemType = item.ItemType,
                    UserID = c.UserID,
                    UserFullName = c.User != null ? c.User.FullName : string.Empty,
                    ProofDescription = c.ProofDescription,
                    ContactPhone = c.ContactPhone,
                    Status = c.Status,
                    ReviewedBy = c.ReviewedBy,
                    ReviewerName = c.Reviewer != null ? c.Reviewer.FullName : null,
                    ReviewedAt = c.ReviewedAt,
                    ReviewNote = c.ReviewNote,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<ClaimDto>> GetMyClaimsAsync(int userId)
        {
            return await _context.Claims
                .Where(c => c.UserID == userId)
                .Include(c => c.Item)
                .Include(c => c.Reviewer)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ClaimDto
                {
                    ClaimID = c.ClaimID,
                    ItemID = c.ItemID,
                    ItemTitle = c.Item != null ? c.Item.Title : string.Empty,
                    ItemType = c.Item != null ? c.Item.ItemType : string.Empty,
                    UserID = c.UserID,
                    UserFullName = string.Empty,
                    ProofDescription = c.ProofDescription,
                    ContactPhone = c.ContactPhone,
                    Status = c.Status,
                    ReviewedBy = c.ReviewedBy,
                    ReviewerName = c.Reviewer != null ? c.Reviewer.FullName : null,
                    ReviewedAt = c.ReviewedAt,
                    ReviewNote = c.ReviewNote,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<ClaimDto>> GetAllClaimsAsync(string? status)
        {
            var query = _context.Claims
                .Include(c => c.Item)
                .Include(c => c.User)
                .Include(c => c.Reviewer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(c => c.Status == status);
            }

            return await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ClaimDto
                {
                    ClaimID = c.ClaimID,
                    ItemID = c.ItemID,
                    ItemTitle = c.Item != null ? c.Item.Title : string.Empty,
                    ItemType = c.Item != null ? c.Item.ItemType : string.Empty,
                    UserID = c.UserID,
                    UserFullName = c.User != null ? c.User.FullName : string.Empty,
                    ProofDescription = c.ProofDescription,
                    ContactPhone = c.ContactPhone,
                    Status = c.Status,
                    ReviewedBy = c.ReviewedBy,
                    ReviewerName = c.Reviewer != null ? c.Reviewer.FullName : null,
                    ReviewedAt = c.ReviewedAt,
                    ReviewNote = c.ReviewNote,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> ReviewClaimAsync(int claimId, ReviewClaimDto dto, int reviewerUserId)
        {
            var claim = await _context.Claims
                .Include(c => c.Item)
                .FirstOrDefaultAsync(c => c.ClaimID == claimId);

            if (claim == null) return false;

            claim.Status = dto.Status;
            claim.ReviewedBy = reviewerUserId;
            claim.ReviewedAt = DateTime.UtcNow;
            claim.ReviewNote = dto.ReviewNote;

            // Thông báo kết quả cho người yêu cầu nhận
            string msg = dto.Status == "Approved" 
                ? $"Yêu cầu nhận đồ của bạn cho bài '{claim.Item?.Title}' đã được CHẤP THUẬN. Hãy liên hệ văn phòng/người giữ để nhận lại."
                : $"Yêu cầu nhận đồ của bạn cho bài '{claim.Item?.Title}' đã bị từ chối: {dto.ReviewNote}";

            _context.Notifications.Add(new Notification
            {
                UserID = claim.UserID,
                Title = dto.Status == "Approved" ? "Yêu cầu nhận đồ thành công" : "Yêu cầu nhận đồ bị từ chối",
                Message = msg,
                LinkUrl = $"/items/{claim.ItemID}",
                Type = dto.Status == "Approved" ? "ClaimApproved" : "ClaimRejected",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CreateHandoverAsync(CreateHandoverDto dto, int staffUserId)
        {
            var claim = await _context.Claims
                .Include(c => c.Item)
                .FirstOrDefaultAsync(c => c.ClaimID == dto.ClaimID);

            if (claim == null || claim.Status != "Approved") return false;

            // Tạo biên bản bàn giao
            var record = new HandoverRecord
            {
                ClaimID = dto.ClaimID,
                StaffID = staffUserId,
                ReceiverID = claim.UserID,
                HandoverDate = DateTime.UtcNow,
                HandoverLocation = dto.HandoverLocation,
                VerificationPhotoUrl = dto.VerificationPhotoUrl,
                Note = dto.Note,
                Confirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.HandoverRecords.Add(record);

            // Cập nhật trạng thái đồ vật thành Đã trao trả thành công
            if (claim.Item != null)
            {
                claim.Item.Status = "Returned_HandedOver";
                claim.Item.UpdatedAt = DateTime.UtcNow;

                _context.ItemStatusHistories.Add(new ItemStatusHistory
                {
                    ItemID = claim.Item.ItemID,
                    ChangedBy = staffUserId,
                    OldStatus = "VerifyingClaim",
                    NewStatus = "Returned_HandedOver",
                    Reason = $"Hoàn tất bàn giao tài sản cho người nhận tại {dto.HandoverLocation}",
                    ChangedAt = DateTime.UtcNow
                });

                // Thông báo cho người nhặt/người đăng
                _context.Notifications.Add(new Notification
                {
                    UserID = claim.Item.UserID,
                    Title = "Đồ vật đã bàn giao thành công",
                    Message = $"Tài sản liên quan đến bài đăng '{claim.Item.Title}' đã được bàn giao thành công.",
                    LinkUrl = $"/items/{claim.Item.ItemID}",
                    Type = "HandoverComplete",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}

