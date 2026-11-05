using System.ComponentModel.DataAnnotations;

namespace UniFind.API.DTOs.Items
{
    public class ItemDto
    {
        public int ItemID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public DateTime LostFoundDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CustodyType { get; set; } = string.Empty;
        public string? CurrentStorageLocation { get; set; }
        public DateTime CreatedAt { get; set; }

        public int UserID { get; set; }
        public string UserFullName { get; set; } = string.Empty;

        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;

        public List<string> ImageUrls { get; set; } = new List<string>();
    }

    public class ItemDetailDto : ItemDto
    {
        // Chỉ trả về nếu người xem là chủ sở hữu hoặc Staff/Admin
        public string? PrivateDescription { get; set; }
    }

    public class CreateItemDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        // Đặc điểm nhận dạng riêng tư (bảo mật)
        public string? PrivateDescription { get; set; }

        [Required]
        [RegularExpression("^(Lost|Found)$", ErrorMessage = "ItemType chỉ có thể là 'Lost' hoặc 'Found'")]
        public string ItemType { get; set; } = "Lost";

        public DateTime LostFoundDate { get; set; } = DateTime.UtcNow;

        [Required]
        public int CategoryID { get; set; }

        [Required]
        public int LocationID { get; set; }

        public string CustodyType { get; set; } = "SelfRetained";
        public string? CurrentStorageLocation { get; set; }

        public List<string>? ImageUrls { get; set; }
    }

    public class ItemFilterDto
    {
        public string? Keyword { get; set; }
        public int? CategoryID { get; set; }
        public int? LocationID { get; set; }
        public string? ItemType { get; set; } // Lost hoặc Found
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}

