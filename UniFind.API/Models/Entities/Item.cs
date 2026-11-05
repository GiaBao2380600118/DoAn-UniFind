using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Items")]
    public class Item
    {
        [Key]
        public int ItemID { get; set; }

        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User? User { get; set; }

        public int CategoryID { get; set; }

        [ForeignKey("CategoryID")]
        public Category? Category { get; set; }

        public int LocationID { get; set; }

        [ForeignKey("LocationID")]
        public Location? Location { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty; // Mô tả công khai

        public string? PrivateDescription { get; set; } // Đặc điểm xác minh riêng tư

        [Required]
        [MaxLength(20)]
        public string ItemType { get; set; } = "Lost"; // 'Lost' hoặc 'Found'

        public DateTime LostFoundDate { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "PendingApproval";
        // 'PendingApproval', 'Approved_Searching', 'VerifyingClaim', 'Returned_HandedOver', 'Rejected', 'Hidden', 'Cancelled'

        [Required]
        [MaxLength(30)]
        public string CustodyType { get; set; } = "SelfRetained";
        // 'SelfRetained' (Người nhặt tự giữ) hoặc 'HandedToOffice' (Đã bàn giao phòng quản lý)

        [MaxLength(255)]
        public string? CurrentStorageLocation { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<ItemStatusHistory> StatusHistories { get; set; } = new List<ItemStatusHistory>();
    }
}

