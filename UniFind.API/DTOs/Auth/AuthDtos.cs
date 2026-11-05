using System.ComponentModel.DataAnnotations;

namespace UniFind.API.DTOs.Auth
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        [MaxLength(50)]
        public string? StudentStaffId { get; set; }

        public int RoleID { get; set; } = 4; // Mặc định là Student
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? StudentStaffId { get; set; }
        public string? AvatarUrl { get; set; }
    }
}

