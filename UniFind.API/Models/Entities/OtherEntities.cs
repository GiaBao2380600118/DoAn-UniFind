using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User? User { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? LinkUrl { get; set; }

        public bool IsRead { get; set; } = false;

        [MaxLength(50)]
        public string Type { get; set; } = "System";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("Reports")]
    public class Report
    {
        [Key]
        public int ReportID { get; set; }

        public int ReporterID { get; set; }

        [ForeignKey("ReporterID")]
        public User? Reporter { get; set; }

        public int? ItemID { get; set; }

        [ForeignKey("ItemID")]
        public Item? Item { get; set; }

        public int? ClaimID { get; set; }

        [ForeignKey("ClaimID")]
        public Claim? Claim { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

        public int? HandledBy { get; set; }

        [ForeignKey("HandledBy")]
        public User? Handler { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("ItemStatusHistory")]
    public class ItemStatusHistory
    {
        [Key]
        public int HistoryID { get; set; }

        public int ItemID { get; set; }

        [ForeignKey("ItemID")]
        public Item? Item { get; set; }

        public int ChangedBy { get; set; }

        [ForeignKey("ChangedBy")]
        public User? User { get; set; }

        [MaxLength(30)]
        public string? OldStatus { get; set; }

        [Required]
        [MaxLength(30)]
        public string NewStatus { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Reason { get; set; }

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        public int LogID { get; set; }

        public int? UserID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string TableName { get; set; } = string.Empty;

        public int? RecordID { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        public string? OldData { get; set; }
        public string? NewData { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

