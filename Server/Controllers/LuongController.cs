using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Quản Lý")] // Sẽ cần khi có xác thực
public class LuongController : ControllerBase
{
    private readonly ILuongService _luongService;

    public LuongController(ILuongService luongService)
    {
        _luongService = luongService;
    }

    /// <summary>
    /// Lấy bảng lương chi tiết của tất cả nhân viên trong một tháng cụ thể.
    /// </summary>
    /// <param name="month">Tháng (1-12)</param>
    /// <param name="year">Năm (ví dụ: 2025)</param>
    [HttpGet]
    public async Task<IActionResult> GetBangLuong([FromQuery] int month, [FromQuery] int year)
    {
        if (month < 1 || month > 12 || year < 2000)
        {
            return BadRequest("Tháng hoặc năm không hợp lệ.");
        }
        var data = await _luongService.GetPayrollDataAsync(month, year);
        return Ok(data);
    }

    /// <summary>
    /// Xuất file Excel bảng lương của một tháng cụ thể.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportBangLuong([FromQuery] int month, [FromQuery] int year)
    {
        if (month < 1 || month > 12 || year < 2000)
        {
            return BadRequest("Tháng hoặc năm không hợp lệ.");
        }
        var fileBytes = await _luongService.ExportPayrollToExcelAsync(month, year);
        var fileName = $"BangLuong_Thang_{month}_{year}.xlsx";
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
