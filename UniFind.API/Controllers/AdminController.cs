using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.Models.Entities;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class AdminController : ControllerBase
    {
        private readonly UniFindDbContext _context;

        public AdminController(UniFindDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Dashboard Thống kê tổng quan hệ thống
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var totalItems = await _context.Items.CountAsync();
            var totalLost = await _context.Items.CountAsync(i => i.ItemType == "Lost");
            var totalFound = await _context.Items.CountAsync(i => i.ItemType == "Found");
            var totalReturned = await _context.Items.CountAsync(i => i.Status == "Returned_HandedOver");
            var totalPendingClaims = await _context.Claims.CountAsync(c => c.Status == "Pending");
            var totalUsers = await _context.Users.CountAsync();

            double returnRate = totalItems > 0 ? Math.Round((double)totalReturned / totalItems * 100, 1) : 0;

            // Thống kê theo danh mục phổ biến
            var categoryStats = await _context.Items
                .Include(i => i.Category)
                .GroupBy(i => i.Category != null ? i.Category.CategoryName : "Khác")
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Thống kê theo địa điểm hay mất/nhặt được đồ nhất
            var locationStats = await _context.Items
                .Include(i => i.Location)
                .GroupBy(i => i.Location != null ? $"{i.Location.Building} - {i.Location.AreaName}" : "Khác")
                .Select(g => new { Location = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                totalItems,
                totalLost,
                totalFound,
                totalReturned,
                totalPendingClaims,
                totalUsers,
                returnRate,
                categoryStats,
                locationStats
            });
        }

        /// <summary>
        /// Quản lý danh sách người dùng
        /// </summary>
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int? roleId)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || (u.StudentStaffId != null && u.StudentStaffId.ToLower().Contains(s)));
            }

            if (roleId.HasValue && roleId.Value > 0)
            {
                query = query.Where(u => u.RoleID == roleId.Value);
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.UserID,
                    u.FullName,
                    u.Email,
                    u.RoleID,
                    RoleName = u.Role != null ? u.Role.RoleName : "Student",
                    u.Phone,
                    u.StudentStaffId,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// Khóa / Mở khóa tài khoản người dùng
        /// </summary>
        [HttpPut("users/{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã {(user.IsActive ? "kích hoạt" : "khóa")} tài khoản {user.FullName}.", isActive = user.IsActive });
        }

        /// <summary>
        /// Đổi vai trò (Role) cho người dùng
        /// </summary>
        [HttpPut("users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            var role = await _context.Roles.FindAsync(dto.RoleID);
            if (role == null) return BadRequest(new { message = "Vai trò không hợp lệ." });

            user.RoleID = dto.RoleID;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã cập nhật vai trò thành {role.RoleName} cho {user.FullName}." });
        }

        // ================= Quản lý Danh mục (Categories) =================
        [HttpPost("categories")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCategory([FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CategoryName))
                return BadRequest(new { message = "Tên danh mục không được để trống." });

            var category = new Category
            {
                CategoryName = dto.CategoryName.Trim(),
                Icon = dto.Icon?.Trim(),
                Description = dto.Description?.Trim(),
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.CategoryName = dto.CategoryName.Trim();
            category.Icon = dto.Icon?.Trim();
            category.Description = dto.Description?.Trim();
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // ================= Quản lý Địa điểm (Locations) =================
        [HttpPost("locations")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddLocation([FromBody] LocationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Building) || string.IsNullOrWhiteSpace(dto.AreaName))
                return BadRequest(new { message = "Tòa nhà và Tên khu vực không được để trống." });

            var location = new Location
            {
                Campus = string.IsNullOrWhiteSpace(dto.Campus) ? "Cơ sở chính" : dto.Campus.Trim(),
                Building = dto.Building.Trim(),
                AreaName = dto.AreaName.Trim(),
                Description = dto.Description?.Trim(),
                IsActive = true
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return Ok(location);
        }

        [HttpPut("locations/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] LocationDto dto)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();

            location.Campus = dto.Campus.Trim();
            location.Building = dto.Building.Trim();
            location.AreaName = dto.AreaName.Trim();
            location.Description = dto.Description?.Trim();
            location.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(location);
        }
    }

    public class ChangeRoleDto
    {
        public int RoleID { get; set; }
    }

    public class CategoryDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class LocationDto
    {
        public string Campus { get; set; } = "Cơ sở chính";
        public string Building { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}

