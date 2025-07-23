namespace Server.DTOs
{
    // DTO client gửi lên khi muốn chấm công
    public record ChamCongRequestDto(int MaNV);

    // DTO trả về trạng thái ca làm việc hiện tại của nhân viên
    public record CaLamViecStatusDto
    {
        public bool CoCaLamViec { get; set; }
        public string ThongBao { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? ThoiGianCaLamViec { get; set; } // Ví dụ: "08:00 - 09:00"
        public string? TrangThaiChamCong { get; set; } // Ví dụ: "Chưa chấm công", "Đã vào ca", "Đã kết thúc ca"
        public DateTime? ThoiGianVao { get; set; }
    }
}
