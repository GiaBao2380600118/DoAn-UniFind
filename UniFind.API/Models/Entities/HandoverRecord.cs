using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("HandoverRecords")]
    public class HandoverRecord
    {
        [Key]
        public int HandoverID { get; set; }

        public int ClaimID { get; set; }

        [ForeignKey("ClaimID")]
        public Claim? Claim { get; set; }

        public int StaffID { get; set; }

        [ForeignKey("StaffID")]
        public User? Staff { get; set; }

        public int ReceiverID { get; set; }

        [ForeignKey("ReceiverID")]
        public User? Receiver { get; set; }

        public DateTime HandoverDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(200)]
        public string HandoverLocation { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? VerificationPhotoUrl { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }

        public bool Confirmed { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

