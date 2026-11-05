using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;
using UniFind.API.DTOs.Auth;
using UniFind.API.Helpers;
using UniFind.API.Models.Entities;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly UniFindDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(UniFindDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<bool> IsEmailTakenAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.Trim().ToLower());
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

            if (user == null || !user.IsActive)
            {
                return null;
            }

            // Kiểm tra mật khẩu
            if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }

            var roleName = user.Role?.RoleName ?? "Student";
            var token = _jwtHelper.GenerateToken(user, roleName);

            return new AuthResponseDto
            {
                Token = token,
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                Role = roleName,
                StudentStaffId = user.StudentStaffId,
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request)
        {
            if (await IsEmailTakenAsync(request.Email))
            {
                return null;
            }

            // Đảm bảo RoleID hợp lệ
            var role = await _context.Roles.FindAsync(request.RoleID) 
                       ?? await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Student");

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                RoleID = role?.RoleID ?? 4,
                Phone = request.Phone,
                StudentStaffId = request.StudentStaffId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var roleName = role?.RoleName ?? "Student";
            var token = _jwtHelper.GenerateToken(user, roleName);

            return new AuthResponseDto
            {
                Token = token,
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                Role = roleName,
                StudentStaffId = user.StudentStaffId,
                AvatarUrl = user.AvatarUrl
            };
        }
    }
}

