using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System.Globalization;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Quản Lý")] // Tạm thời comment để dễ test, sẽ mở lại sau
    public class PhanCongController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PhanCongController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// API lấy danh sách tất cả nhân viên để hiển thị cho việc phân công.
        /// </summary>
        [HttpGet("nhanvien")]
        [Authorize(Roles = "Quản Lý")]
        public async Task<IActionResult> GetNhanViens()
        {
            var nhanViens = await _context.NhanViens
                .Select(nv => new NhanVienPhanCongDto(nv.MaNV, nv.HoTen, nv.Email))
                .ToListAsync();

            return Ok(nhanViens);
        }

        /// <summary>
        /// API lấy lịch làm việc của một tuần cụ thể.
        /// Logic này đảm bảo luôn lấy dữ liệu của cả tuần (Thứ 2 - Chủ Nhật).
        /// </summary>
        /// <param name="ngayTrongTuan">Một ngày bất kỳ trong tuần muốn xem (định dạng yyyy-MM-dd).</param>
        [HttpGet("lichlamviec")]
        [Authorize(Roles = "Quản Lý,Nhân Viên")]
        public async Task<IActionResult> GetLichLamViec([FromQuery] string ngayTrongTuan)
        {
            if (!DateOnly.TryParse(ngayTrongTuan, out var date))
            {
                // Nếu không có ngày nào được cung cấp, mặc định lấy ngày hôm nay
                date = DateOnly.FromDateTime(DateTime.Now);
            }

            // 1. Tính toán ngày bắt đầu (Thứ 2) và kết thúc (Chủ Nhật) của tuần.
            // Logic này đảm bảo tính đúng tuần dựa trên một ngày bất kỳ.
            var dayOfWeek = date.DayOfWeek;
            int offset = dayOfWeek == DayOfWeek.Sunday ? 6 : (int)dayOfWeek - 1;
            var startOfWeek = date.AddDays(-offset);
            var endOfWeek = startOfWeek.AddDays(6);

            var startOfWeekDt = startOfWeek.ToDateTime(TimeOnly.MinValue);
            var endOfWeekDt = endOfWeek.ToDateTime(TimeOnly.MaxValue);

            // 2. Truy vấn tất cả các phân công trong khoảng thời gian của tuần đó.
            // Sử dụng Include để lấy thông tin Họ Tên của Nhân Viên.
            var phanCongsInWeek = await _context.PhanCongs
                .Include(p => p.NhanVien)
                .Where(p => p.NgayLamViec >= startOfWeekDt && p.NgayLamViec <= endOfWeekDt)
                .ToListAsync();

            // 3. Chuẩn bị cấu trúc dữ liệu trả về, nhóm kết quả theo từng ngày trong tuần.
            var lichLamViec = new LichLamViecTuanDto();
            // Khởi tạo danh sách rỗng cho tất cả các ngày trong tuần
            for (int i = 0; i < 7; i++)
            {
                var currentDay = startOfWeek.AddDays(i);
                var key = currentDay.ToString("yyyy-MM-dd");
                lichLamViec.LichLamViec[key] = new List<PhanCongChiTietDto>();
            }

            // Đổ dữ liệu phân công đã truy vấn vào đúng ngày
            foreach (var pc in phanCongsInWeek)
            {
                var key = DateOnly.FromDateTime(pc.NgayLamViec).ToString("yyyy-MM-dd");
                if (lichLamViec.LichLamViec.ContainsKey(key) && pc.NhanVien != null)
                {
                    lichLamViec.LichLamViec[key].Add(new PhanCongChiTietDto(pc.MaNV, pc.NhanVien.HoTen, pc.CaLamViec));
                }
            }

            return Ok(lichLamViec);
        }

        /// <summary>
        /// API để tạo mới hoặc cập nhật lịch làm việc cho một nhân viên vào một ngày cụ thể.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Quản Lý")]
        public async Task<IActionResult> CreateOrUpdatePhanCong([FromBody] CreateOrUpdatePhanCongDto dto)
        {
            var nhanVien = await _context.NhanViens.FindAsync(dto.MaNV);
            if (nhanVien == null)
            {
                return NotFound($"Không tìm thấy nhân viên với mã {dto.MaNV}.");
            }

            // Xóa các phân công cũ của nhân viên trong ngày đó để cập nhật mới.
            // Đây là cách đơn giản và hiệu quả để xử lý việc "cập nhật" danh sách ca làm.
            var existingPhanCongs = await _context.PhanCongs
                .Where(p => p.MaNV == dto.MaNV && p.NgayLamViec.Date == dto.NgayLamViec.Date)
                .ToListAsync();

            if (existingPhanCongs.Any())
            {
                _context.PhanCongs.RemoveRange(existingPhanCongs);
            }

            // Thêm các phân công mới từ danh sách ca được chọn.
            var newPhanCongs = dto.CaLamViecs.Select(ca => new PhanCong
            {
                MaNV = dto.MaNV,
                NgayLamViec = dto.NgayLamViec.Date,
                CaLamViec = ca
            }).ToList();

            await _context.PhanCongs.AddRangeAsync(newPhanCongs);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Phân công đã được cập nhật thành công." });
        }

        /// <summary>
        /// API để xóa một ca làm việc cụ thể của một nhân viên.
        /// </summary>
        [HttpDelete("xoa")]
        public async Task<IActionResult> DeletePhanCong([FromBody] XoaPhanCongDto dto)
        {
            var phanCong = await _context.PhanCongs
                .FirstOrDefaultAsync(p => 
                    p.MaNV == dto.MaNV && 
                    p.NgayLamViec.Date == dto.NgayLamViec.Date && 
                    p.CaLamViec == dto.CaLamViec);

            if (phanCong == null)
            {
                return NotFound("Không tìm thấy ca làm việc để xóa.");
            }

            _context.PhanCongs.Remove(phanCong);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa ca làm việc thành công." });
        }
    }
}
