using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("PhanCong")]
    public class PhanCong
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MaNV { get; set; }

        [Required]
        public DateTime NgayLamViec { get; set; }

        [Required]
        [Range(1, 15)]
        public int CaLamViec { get; set; } // Ca làm việc từ 1 đến 15

        // Navigation property
        [ForeignKey("MaNV")]
        public virtual NhanVien? NhanVien { get; set; }
    }
}
