// File: Models/NhanVien.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class NhanVien
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int MaNV { get; set; }

        public string HoTen { get; set; } = string.Empty;
        public DateTime NgaySinh { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CCCD { get; set; } = string.Empty;

        // Giờ đây file này đã có thể thấy được LoaiNhanVien
        public LoaiNhanVien LoaiNhanVien { get; set; }

        // Và cũng thấy được User
        public virtual User User { get; set; } = null!;
        public virtual ICollection<PhanCong> PhanCongs { get; set; } = new List<PhanCong>();
    }
}