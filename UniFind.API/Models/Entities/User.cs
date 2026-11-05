using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        public int RoleID { get; set; }

        [ForeignKey("RoleID")]
        public Role? Role { get; set; }

        [MaxLength(15)]
        public string? Phone { get; set; }

        [MaxLength(50)]
        public string? StudentStaffId { get; set; } // MSSV hoặc Mã cán bộ/nhân viên

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}

