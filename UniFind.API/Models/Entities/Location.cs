using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniFind.API.Models.Entities
{
    [Table("Locations")]
    public class Location
    {
        [Key]
        public int LocationID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Campus { get; set; } = "Cơ sở chính";

        [Required]
        [MaxLength(100)]
        public string Building { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string AreaName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
}

