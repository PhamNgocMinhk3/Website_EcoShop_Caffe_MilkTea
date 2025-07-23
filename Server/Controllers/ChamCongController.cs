using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChamCongController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChamCongController(AppDbContext context)
        {
            _context = context;
        }

        // API để nhân viên kiểm tra trạng thái ca làm việc hiện tại
        [HttpGet("status/{maNV}")]
        public async Task<IActionResult> GetChamCongStatus(int maNV)
        {
            var now = DateTime.Now;
            var today = now.Date;

            var (phanCongHienTai, thongBao) = await TimPhanCongHopLe(maNV, now);

            if (phanCongHienTai == null)
            {
                return Ok(new CaLamViecStatusDto { CoCaLamViec = false, ThongBao = thongBao });
            }

            var chamCong = await _context.ChamCongs
                .FirstOrDefaultAsync(c => c.PhanCongId == phanCongHienTai.Id);

            var (startTime, _) = GetShiftTimeRange(phanCongHienTai.CaLamViec);

            var response = new CaLamViecStatusDto
            {
                CoCaLamViec = true,
                HoTen = phanCongHienTai.NhanVien?.HoTen,
                ThoiGianCaLamViec = $"{startTime:hh\\:mm} - {startTime.AddHours(1):hh\\:mm}",
            };

            if (chamCong == null)
            {
                response.TrangThaiChamCong = "Chưa chấm công";
                response.ThongBao = "Bạn đã đến giờ làm việc. Vui lòng chấm công.";
            }
            else if (chamCong.ThoiGianRa == null)
            {
                response.TrangThaiChamCong = "Đã vào ca";
                response.ThongBao = "Bạn đang trong ca làm việc.";
                response.ThoiGianVao = chamCong.ThoiGianVao;
            }
            else
            {
                response.TrangThaiChamCong = "Đã kết thúc ca";
                response.ThongBao = "Bạn đã hoàn thành ca làm việc hôm nay.";
                response.ThoiGianVao = chamCong.ThoiGianVao;
            }

            return Ok(response);
        }


        // API để nhân viên check-in
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] ChamCongRequestDto dto)
        {
            var now = DateTime.Now;
            var (phanCong, thongBao) = await TimPhanCongHopLe(dto.MaNV, now);

            if (phanCong == null)
            {
                return BadRequest(new { message = thongBao });
            }

            var daChamCong = await _context.ChamCongs.AnyAsync(c => c.PhanCongId == phanCong.Id);
            if (daChamCong)
            {
                return BadRequest(new { message = "Bạn đã chấm công cho ca này rồi." });
            }

            var (startTime, _) = GetShiftTimeRange(phanCong.CaLamViec);
            var trangThai = (now.TimeOfDay > startTime.ToTimeSpan().Add(new TimeSpan(0, 5, 0))) ? "Đi trễ" : "Đúng giờ";

            var newChamCong = new ChamCong
            {
                PhanCongId = phanCong.Id,
                ThoiGianVao = now,
                TrangThai = trangThai
            };

            _context.ChamCongs.Add(newChamCong);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Check-in thành công lúc {now:HH:mm}. Trạng thái: {trangThai}." });
        }

        // API để nhân viên check-out
        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] ChamCongRequestDto dto)
        {
            var now = DateTime.Now;
            var (phanCong, thongBao) = await TimPhanCongHopLe(dto.MaNV, now);

            if (phanCong == null)
            {
                return BadRequest(new { message = thongBao });
            }

            var chamCong = await _context.ChamCongs
                .FirstOrDefaultAsync(c => c.PhanCongId == phanCong.Id);

            if (chamCong == null)
            {
                return BadRequest(new { message = "Bạn chưa check-in cho ca này." });
            }

            if (chamCong.ThoiGianRa != null)
            {
                return BadRequest(new { message = "Bạn đã check-out cho ca này rồi." });
            }

            chamCong.ThoiGianRa = now;
            _context.ChamCongs.Update(chamCong);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Check-out thành công lúc {now:HH:mm}." });
        }

        // --- Helper Methods ---
        private async Task<(PhanCong?, string)> TimPhanCongHopLe(int maNV, DateTime thoiDiem)
        {
            var homNay = thoiDiem.Date;
            var phanCongsHomNay = await _context.PhanCongs
                .Include(p => p.NhanVien)
                .Where(p => p.MaNV == maNV && p.NgayLamViec.Date == homNay)
                .ToListAsync();

            if (!phanCongsHomNay.Any())
            {
                return (null, "Bạn không có lịch làm việc hôm nay.");
            }

            foreach (var pc in phanCongsHomNay)
            {
                var (startTime, endTime) = GetShiftTimeRange(pc.CaLamViec);
                // Cho phép chấm công trong khoảng 15 phút trước giờ bắt đầu và trong suốt ca làm việc
                if (thoiDiem.TimeOfDay >= startTime.ToTimeSpan().Add(new TimeSpan(0,-15,0)) && thoiDiem.TimeOfDay <= endTime.ToTimeSpan())
                {
                    return (pc, "OK");
                }
            }

            return (null, "Hiện tại không phải thời gian làm việc của bạn.");
        }

        private (TimeOnly startTime, TimeOnly endTime) GetShiftTimeRange(int caLamViec)
        {
            int startHour = caLamViec + 5; 
            if (caLamViec >= 6 && caLamViec <= 10) startHour++; // Ca chiều bắt đầu từ 12h
            if (caLamViec >= 11 && caLamViec <= 15) startHour += 2; // Ca tối bắt đầu từ 17h
            
            var startTime = new TimeOnly(startHour, 0, 0);
            var endTime = startTime.AddHours(1);
            return (startTime, endTime);
        }
    }
}
