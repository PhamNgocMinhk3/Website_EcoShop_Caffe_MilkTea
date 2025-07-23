using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using OfficeOpenXml;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Quản Lý")] // Chỉ Quản lý mới được truy cập module này
public class NhanVienController : ControllerBase
{
    private readonly AppDbContext _context;

    public NhanVienController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/nhanvien
    // Lấy danh sách tất cả user là nhân viên và trạng thái thông tin
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NhanVienListItemDto>>> GetNhanVienList()
    {
        var nhanVienUsers = await _context.Users
            .Where(u => u.RoleId == 2) // RoleId = 2 là Nhân Viên
            .Include(u => u.NhanVien) // Dùng Include để load thông tin NhanVien liên quan
            .Select(u => new NhanVienListItemDto(
                u.Id,
                u.Email,
                u.NhanVien != null ? u.NhanVien.HoTen : null, // Lấy họ tên nếu có
                u.NhanVien != null ? "Đã có thông tin" : "Chưa có thông tin" // Custom status
            ))
            .ToListAsync();

        return Ok(nhanVienUsers);
    }

    // GET: api/nhanvien/{userId}
    // Lấy thông tin chi tiết của một nhân viên
    [HttpGet("{userId}")]
    public async Task<ActionResult<NhanVienDetailDto>> GetNhanVienDetail(int userId)
    {
        var nhanVien = await _context.NhanViens.FindAsync(userId);

        if (nhanVien == null)
        {
            return NotFound("Không tìm thấy thông tin cho nhân viên này.");
        }

        var dto = new NhanVienDetailDto(
            nhanVien.MaNV,
            nhanVien.HoTen,
            nhanVien.NgaySinh,
            nhanVien.GioiTinh,
            nhanVien.DiaChi,
            nhanVien.SoDienThoai,
            nhanVien.Email,
            nhanVien.CCCD,
            nhanVien.LoaiNhanVien.ToString()
        );

        return Ok(dto);
    }

    // POST: api/nhanvien/{userId}
    // Tạo thông tin chi tiết cho một nhân viên (User đã có sẵn)
    [HttpPost("{userId}")]
    public async Task<IActionResult> CreateNhanVienProfile(int userId, [FromBody] CreateOrUpdateNhanVienDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId && u.RoleId == 2);
        if (!userExists)
        {
            return BadRequest("User không tồn tại hoặc không phải là nhân viên.");
        }

        var profileExists = await _context.NhanViens.AnyAsync(nv => nv.MaNV == userId);
        if (profileExists)
        {
            return Conflict("Nhân viên này đã có thông tin rồi.");
        }

        var newNhanVien = new NhanVien
        {
            MaNV = userId, // Gán MaNV bằng UserId
            HoTen = dto.HoTen,
            NgaySinh = dto.NgaySinh,
            GioiTinh = dto.GioiTinh,
            DiaChi = dto.DiaChi,
            SoDienThoai = dto.SoDienThoai,
            Email = dto.Email,
            CCCD = dto.CCCD,
            LoaiNhanVien = dto.LoaiNhanVien
        };

        _context.NhanViens.Add(newNhanVien);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNhanVienDetail), new { userId = newNhanVien.MaNV }, newNhanVien);
    }

    // PUT: api/nhanvien/{userId}
    // Cập nhật thông tin chi tiết của một nhân viên
    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateNhanVienProfile(int userId, [FromBody] CreateOrUpdateNhanVienDto dto)
    {
        var nhanVien = await _context.NhanViens.FindAsync(userId);
        if (nhanVien == null)
        {
            return NotFound("Không tìm thấy thông tin để cập nhật.");
        }

        nhanVien.HoTen = dto.HoTen;
        nhanVien.NgaySinh = dto.NgaySinh;
        nhanVien.GioiTinh = dto.GioiTinh;
        nhanVien.DiaChi = dto.DiaChi;
        nhanVien.SoDienThoai = dto.SoDienThoai;
        nhanVien.Email = dto.Email;
        nhanVien.CCCD = dto.CCCD;
        nhanVien.LoaiNhanVien = dto.LoaiNhanVien;

        await _context.SaveChangesAsync();
        return NoContent(); // Cập nhật thành công
    }

    // DELETE: api/nhanvien/{userId}
    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteNhanVienProfile(int userId)
    {
        var nhanVien = await _context.NhanViens.FindAsync(userId);
        if (nhanVien == null)
        {
            return NotFound("Không có thông tin để xóa.");
        }

        _context.NhanViens.Remove(nhanVien);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{userId}/import-profile")]
    public async Task<IActionResult> ImportProfileFromExcel(int userId, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng chọn một file Excel để import.");
        }

        var userExists = await _context.Users.AnyAsync(u => u.Id == userId && u.RoleId == 2);
        if (!userExists)
        {
            return NotFound("Không tìm thấy nhân viên với ID này.");
        }

        var validationErrors = new List<string>();
        NhanVien? dataFromFile = null; // Dùng nullable để biết đã đọc được dữ liệu hay chưa

        try
        {
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    if (package.Workbook.Worksheets.Count == 0)
                    {
                        return BadRequest("File excel không hợp lệ.");
                    }

                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];

                    // Tối ưu việc đọc và kiểm tra dữ liệu
                    var hoTen = worksheet.Cells[2, 1].Value?.ToString()?.Trim();
                    var ngaySinhCell = worksheet.Cells[2, 2].Value;
                    var gioiTinh = worksheet.Cells[2, 3].Value?.ToString()?.Trim();
                    var diaChi = worksheet.Cells[2, 4].Value?.ToString()?.Trim();
                    var soDienThoai = worksheet.Cells[2, 5].Value?.ToString()?.Trim();
                    var email = worksheet.Cells[2, 6].Value?.ToString()?.Trim();
                    var cccd = worksheet.Cells[2, 7].Value?.ToString()?.Trim();
                    var loaiNhanVienCell = worksheet.Cells[2, 8].Value?.ToString()?.Trim();

                    // --- Kiểm tra dữ liệu (Validation) ---
                    if (string.IsNullOrEmpty(hoTen)) validationErrors.Add("Họ tên (cột 1) không được để trống.");
                    if (string.IsNullOrEmpty(cccd)) validationErrors.Add("CCCD (cột 7) không được để trống.");
                    
                    if (!DateTime.TryParse(ngaySinhCell?.ToString(), out DateTime ngaySinh))
                    {
                        validationErrors.Add("Ngày sinh (cột 2) không hợp lệ.");
                    }

                    if (!Enum.TryParse<LoaiNhanVien>(loaiNhanVienCell, true, out LoaiNhanVien loaiNhanVien))
                    {
                        validationErrors.Add("Loại nhân viên (cột 8) không hợp lệ. Chỉ chấp nhận 'FullTime' hoặc 'PartTime'.");
                    }
                    
                    // Nếu có lỗi, trả về tất cả lỗi cùng lúc
                    if (validationErrors.Any())
                    {
                        return BadRequest(new { Message = "Dữ liệu trong file Excel không hợp lệ.", Errors = validationErrors });
                    }
                    
                    dataFromFile = new NhanVien
                    {
                        HoTen = hoTen!,
                        NgaySinh = ngaySinh,
                        GioiTinh = gioiTinh ?? "",
                        DiaChi = diaChi ?? "",
                        SoDienThoai = soDienThoai ?? "",
                        Email = email ?? "",
                        CCCD = cccd!,
                        LoaiNhanVien = loaiNhanVien
                    };
                }
            }
        }
        catch (Exception ex)
        {
            return BadRequest($"Đã xảy ra lỗi khi đọc file Excel: {ex.Message}");
        }

        if (dataFromFile == null)
        {
                return BadRequest("Không thể đọc dữ liệu từ file Excel.");
        }

        // --- Cập nhật hoặc Thêm mới vào Database ---
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var existingProfile = await _context.NhanViens.FindAsync(userId);

            if (existingProfile != null) // Cập nhật
            {
                existingProfile.HoTen = dataFromFile.HoTen;
                existingProfile.NgaySinh = dataFromFile.NgaySinh;
                existingProfile.GioiTinh = dataFromFile.GioiTinh;
                existingProfile.DiaChi = dataFromFile.DiaChi;
                existingProfile.SoDienThoai = dataFromFile.SoDienThoai;
                existingProfile.Email = dataFromFile.Email;
                existingProfile.CCCD = dataFromFile.CCCD;
                existingProfile.LoaiNhanVien = dataFromFile.LoaiNhanVien;
            }
            else // Tạo mới
            {
                dataFromFile.MaNV = userId;
                _context.NhanViens.Add(dataFromFile);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { Message = $"Đã cập nhật thông tin thành công cho nhân viên ID {userId}." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Lỗi server khi lưu dữ liệu: {ex.Message}");
        }
    }
}
