using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Quản Lý")] // Sẽ cần khi có xác thực
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    // Endpoint cho các chức năng 1, 2, 3, 4
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverviewStats([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var end = string.IsNullOrEmpty(endDate) ? DateTime.Now : DateTime.Parse(endDate);
        var start = string.IsNullOrEmpty(startDate) ? end.AddDays(-29) : DateTime.Parse(startDate);
        
        var stats = await _statisticsService.GetOverviewStatsAsync(start, end);
        return Ok(stats);
    }

    // Endpoint cho chức năng 5
    [HttpGet("revenue-over-time")]
    public async Task<IActionResult> GetRevenueOverTime([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var end = string.IsNullOrEmpty(endDate) ? DateTime.Now : DateTime.Parse(endDate);
        var start = string.IsNullOrEmpty(startDate) ? end.AddDays(-29) : DateTime.Parse(startDate);

        var data = await _statisticsService.GetRevenueOverTimeAsync(start, end);
        return Ok(data);
    }

    // Endpoint cho chức năng 6, 7, 9
    [HttpGet("products")]
    public async Task<IActionResult> GetProductStats()
    {
        var topByRevenue = await _statisticsService.GetTopProductsByRevenueAsync(5);
        var topByQuantity = await _statisticsService.GetTopProductsByQuantityAsync(5);
        var leastPopular = await _statisticsService.GetLeastPopularProductsAsync(5);
        
        return Ok(new { topByRevenue, topByQuantity, leastPopular });
    }

    // Endpoint cho chức năng 8
    [HttpGet("top-toppings")]
    public async Task<IActionResult> GetTopToppings()
    {
        var data = await _statisticsService.GetTopToppingsAsync(5);
        return Ok(data);
    }

    // Endpoint cho chức năng 11
    [HttpGet("top-employees")]
    public async Task<IActionResult> GetTopEmployees([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var end = string.IsNullOrEmpty(endDate) ? DateTime.Now : DateTime.Parse(endDate);
        var start = string.IsNullOrEmpty(startDate) ? end.AddDays(-29) : DateTime.Parse(startDate);

        var data = await _statisticsService.GetTopEmployeesByRevenueAsync(start, end, 5);
        return Ok(data);
    }

    // Endpoint cho chức năng 12
    [HttpGet("employee-attendance")]
    public async Task<IActionResult> GetEmployeeAttendance([FromQuery] int? month, [FromQuery] int? year)
    {
        var m = month ?? DateTime.Now.Month;
        var y = year ?? DateTime.Now.Year;

        var data = await _statisticsService.GetEmployeeAttendanceStatsAsync(m, y);
        return Ok(data);
    }

    // Endpoint cho chức năng 13, 14
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventoryStats()
    {
        var data = await _statisticsService.GetInventoryStatsAsync();
        return Ok(data);
    }
}
