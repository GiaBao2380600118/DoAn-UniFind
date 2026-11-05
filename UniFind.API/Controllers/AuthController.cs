using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.DTOs.Auth;
using UniFind.API.Helpers;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UniFindDbContext _context;

        public AuthController(IAuthService authService, UniFindDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        /// <summary>
        /// Đăng ký tài khoản mới (Mặc định là sinh viên)
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request);
            if (result == null)
            {
                return BadRequest(new { message = "Email này đã được sử dụng trong hệ thống." });
            }

            return Ok(result);
        }

        /// <summary>
        /// Đăng nhập hệ thống và nhận JWT Token
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác hoặc tài khoản đã bị khóa." });
            }

            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin tài khoản hiện tại từ Token
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            return Ok(new
            {
                user.UserID,
                user.FullName,
                user.Email,
                Role = user.Role?.RoleName ?? "Student",
                user.Phone,
                user.StudentStaffId,
                user.AvatarUrl,
                user.CreatedAt
            });
        }

        /// <summary>
        /// Cập nhật hồ sơ cá nhân
        /// </summary>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
            if (dto.Phone != null) user.Phone = dto.Phone.Trim();
            if (dto.StudentStaffId != null) user.StudentStaffId = dto.StudentStaffId.Trim();
            if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl.Trim();
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật hồ sơ thành công.", user });
        }

        /// <summary>
        /// Đổi mật khẩu
        /// </summary>
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
            }

            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
            }

            user.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? StudentStaffId { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
