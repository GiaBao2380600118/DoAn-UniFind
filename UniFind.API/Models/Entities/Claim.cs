using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Claims")]
    public class Claim
    {
        [Key]
        public int ClaimID { get; set; }

        public int ItemID { get; set; }

        [ForeignKey("ItemID")]
        public Item? Item { get; set; }

        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User? User { get; set; }

        [Required]
        public string ProofDescription { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? ContactPhone { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending"; // 'Pending', 'Approved', 'Rejected', 'Cancelled'

        public int? ReviewedBy { get; set; }

        [ForeignKey("ReviewedBy")]
        public User? Reviewer { get; set; }

        public DateTime? ReviewedAt { get; set; }

        [MaxLength(500)]
        public string? ReviewNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public HandoverRecord? HandoverRecord { get; set; }
    }
}

