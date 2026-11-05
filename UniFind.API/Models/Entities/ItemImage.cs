using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("ItemImages")]
    public class ItemImage
    {
        [Key]
        public int ImageID { get; set; }

        public int ItemID { get; set; }

        [ForeignKey("ItemID")]
        public Item? Item { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsThumbnail { get; set; } = false;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}

