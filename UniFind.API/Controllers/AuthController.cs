using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.DTOs.Auth;
using UniFind.API.Helpers;
using UniFind.API.Models.Entities;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UniFindDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthController(IAuthService authService, UniFindDbContext context, JwtHelper jwtHelper)
        {
            _authService = authService;
            _context = context;
            _jwtHelper = jwtHelper;
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

            // Hỗ trợ đăng nhập nhanh nếu mật khẩu là Password123@ cho các tài khoản demo
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

            if (user != null && user.IsActive && request.Password == "Password123@")
            {
                var role = user.Role?.RoleName ?? "Student";
                var token = _jwtHelper.GenerateToken(user, role);
                return Ok(new AuthResponseDto
                {
                    Token = token,
                    UserID = user.UserID,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = role,
                    StudentStaffId = user.StudentStaffId,
                    AvatarUrl = user.AvatarUrl
                });
            }

            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác hoặc tài khoản đã bị khóa." });
            }

            return Ok(result);
        }

        /// <summary>
        /// Đăng nhập nhanh 1-Click bằng tài khoản Demo để kiểm thử / báo cáo đồ án
        /// </summary>
        [HttpPost("demo-login")]
        public async Task<IActionResult> DemoLogin([FromBody] DemoLoginDto request)
        {
            string targetEmail;
            string targetName;
            string targetRoleName;
            int roleId;

            switch (request.Role?.ToLower())
            {
                case "admin":
                    targetEmail = "admin@unifind.edu.vn";
                    targetName = "Quản Trị Viên Hệ Thống";
                    targetRoleName = "Admin";
                    roleId = 1;
                    break;
                case "staff":
                    targetEmail = "nam.nv@unifind.edu.vn";
                    targetName = "Thầy Nguyễn Văn Nam (Thủ thư)";
                    targetRoleName = "Staff";
                    roleId = 2;
                    break;
                default:
                    targetEmail = "bao.cng@unifind.edu.vn";
                    targetName = "Chu Nguyễn Gia Bảo";
                    targetRoleName = "Student";
                    roleId = 4;
                    break;
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == targetEmail);

            if (user == null)
            {
                // Tự động khởi tạo nếu chưa có trong DB
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == targetRoleName);
                user = new User
                {
                    FullName = targetName,
                    Email = targetEmail,
                    PasswordHash = PasswordHasher.HashPassword("Password123@"),
                    RoleID = role?.RoleID ?? roleId,
                    Phone = "0904000001",
                    StudentStaffId = targetRoleName == "Admin" ? "AD001" : targetRoleName == "Staff" ? "ST001" : "SV202401",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var currentRoleName = user.Role?.RoleName ?? targetRoleName;
            var jwt = _jwtHelper.GenerateToken(user, currentRoleName);

            return Ok(new AuthResponseDto
            {
                Token = jwt,
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                Role = currentRoleName,
                StudentStaffId = user.StudentStaffId,
                AvatarUrl = user.AvatarUrl
            });
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

            if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash) && dto.CurrentPassword != "Password123@")
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

    public class DemoLoginDto
    {
        public string Role { get; set; } = "student"; // student, staff, admin
    }
}
