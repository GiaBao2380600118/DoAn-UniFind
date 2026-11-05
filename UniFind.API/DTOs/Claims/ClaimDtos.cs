using System.ComponentModel.DataAnnotations;

namespace UniFind.API.DTOs.Claims
{
    public class CreateClaimDto
    {
        [Required]
        public int ItemID { get; set; }

        [Required]
        [MinLength(10, ErrorMessage = "Mô tả bằng chứng phải tối thiểu 10 ký tự")]
        public string ProofDescription { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? ContactPhone { get; set; }
    }

    public class ClaimDto
    {
        public int ClaimID { get; set; }
        public int ItemID { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ProofDescription { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ReviewClaimDto
    {
        [Required]
        [RegularExpression("^(Approved|Rejected)$", ErrorMessage = "Trạng thái chỉ có thể là 'Approved' hoặc 'Rejected'")]
        public string Status { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ReviewNote { get; set; }
    }

    public class CreateHandoverDto
    {
        [Required]
        public int ClaimID { get; set; }

        [Required]
        [MaxLength(200)]
        public string HandoverLocation { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? VerificationPhotoUrl { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }
    }
}

