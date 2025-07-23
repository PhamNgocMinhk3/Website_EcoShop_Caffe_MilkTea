using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("ChamCong")]
    public class ChamCong
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PhanCongId { get; set; }

        [Required]
        public DateTime ThoiGianVao { get; set; }

        public DateTime? ThoiGianRa { get; set; }

        [MaxLength(50)]
        public string? TrangThai { get; set; } // Ví dụ: "Đúng giờ", "Đi trễ"

        // Navigation property
        [ForeignKey("PhanCongId")]
        public virtual PhanCong? PhanCong { get; set; }
    }
}
