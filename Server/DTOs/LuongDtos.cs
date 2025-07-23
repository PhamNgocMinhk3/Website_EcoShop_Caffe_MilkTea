namespace Server.DTOs
{
    public class BangLuongNhanVienDto
    {
        // Thông tin cơ bản nhân viên
        public int MaNV { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? SoDienThoai { get; set; }
        public string? CCCD { get; set; }
        public string LoaiNhanVien { get; set; } = string.Empty; // "Full-time" hoặc "Part-time"

        // Thông tin công và chấm công
        public int SoCaPhanCong { get; set; }
        public int SoCaDiLam { get; set; }
        public int SoLanDiTre { get; set; }

        // Thông tin giờ làm và lương
        public double TongGioLam { get; set; }
        public decimal LuongCoBanTheoGio { get; set; }
        public decimal TongLuongTruocPhat { get; set; }
        public decimal TienPhat { get; set; }
        public decimal LuongThucLanh { get; set; }

        public string GhiChu { get; set; } = string.Empty;
    }
}
