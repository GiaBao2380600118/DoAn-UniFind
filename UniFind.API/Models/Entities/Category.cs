using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Categories")]
    public class Category
    {
        [Key]
        public int CategoryID { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Icon { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
}

