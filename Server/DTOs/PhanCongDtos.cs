namespace Server.DTOs
{
    // DTO để hiển thị danh sách nhân viên cho việc phân công
    public record NhanVienPhanCongDto(int MaNV, string HoTen, string? Email);

    // DTO để hiển thị thông tin một ca làm việc cụ thể
    public record PhanCongChiTietDto(int MaNV, string HoTen, int CaLamViec);

    // DTO để trả về lịch làm việc cho cả tuần
    public record LichLamViecTuanDto
    {
        // Key là ngày trong tuần (ví dụ: "2024-07-01")
        public Dictionary<string, List<PhanCongChiTietDto>> LichLamViec { get; set; } = new();
    }

    // DTO để client gửi lên khi phân công
    public record CreateOrUpdatePhanCongDto
    {
        public int MaNV { get; set; }
        public DateTime NgayLamViec { get; set; }
        // Danh sách các ca được chọn (1-15)
        public List<int> CaLamViecs { get; set; } = new();
    }

    // DTO để xóa một ca làm việc
    public record XoaPhanCongDto
    {
        public int MaNV { get; set; }
        public DateTime NgayLamViec { get; set; }
        public int CaLamViec { get; set; }
    }
}
