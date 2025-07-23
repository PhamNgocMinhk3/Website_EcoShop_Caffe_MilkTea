using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IStatisticsService
{
    Task<OverviewStatsDto> GetOverviewStatsAsync(DateTime startDate, DateTime endDate);
    Task<List<RevenueDataPointDto>> GetRevenueOverTimeAsync(DateTime startDate, DateTime endDate);
    Task<List<ProductStatDto>> GetTopProductsByRevenueAsync(int count);
    Task<List<ProductStatDto>> GetTopProductsByQuantityAsync(int count);
    Task<List<ProductStatDto>> GetLeastPopularProductsAsync(int count);
    Task<List<ToppingStatDto>> GetTopToppingsAsync(int count);
    Task<List<EmployeeRevenueDto>> GetTopEmployeesByRevenueAsync(DateTime startDate, DateTime endDate, int count);
    Task<List<EmployeeAttendanceDto>> GetEmployeeAttendanceStatsAsync(int month, int year);
    Task<InventoryStatsDto> GetInventoryStatsAsync(int lowStockThreshold = 10);
}

public class StatisticsService : IStatisticsService
{
    private readonly AppDbContext _context;

    public StatisticsService(AppDbContext context)
    {
        _context = context;
    }

    // Các hàm khác giữ nguyên...
    public async Task<OverviewStatsDto> GetOverviewStatsAsync(DateTime startDate, DateTime endDate)
    {
        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate && o.Status == OrderStatus.Paid) 
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.FinalAmount);
        var totalOrders = orders.Count;

        var orderIds = orders.Select(o => o.Id).ToList();
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Product)
                .ThenInclude(p => p!.RecipeItems)
                    .ThenInclude(ri => ri.Ingredient)
            .Where(oi => orderIds.Contains(oi.OrderId))
            .ToListAsync();
        
        decimal totalCostOfGoods = 0;
        foreach(var item in orderItems)
        {
            if(item.Product?.RecipeItems != null)
            {
                var productCost = item.Product.RecipeItems
                    .Where(ri => ri.Ingredient != null)
                    .Sum(ri => (decimal)(ri.Quantity / 1000.0f) * ri.Ingredient!.CostPrice); // Giả định quy đổi đơn vị
                totalCostOfGoods += productCost * item.Quantity;
            }
        }

        return new OverviewStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0,
            TotalGrossProfit = totalRevenue - totalCostOfGoods
        };
    }

    public async Task<List<RevenueDataPointDto>> GetRevenueOverTimeAsync(DateTime startDate, DateTime endDate)
    {
        var dailyRevenue = await _context.Orders
            .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate && o.Status == OrderStatus.Paid)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.FinalAmount) })
            .OrderBy(r => r.Date)
            .ToListAsync();
        
        return dailyRevenue.Select(d => new RevenueDataPointDto { 
            Date = d.Date.ToString("dd/MM"), 
            Revenue = d.Revenue,
            Profit = d.Revenue * 0.4m
        }).ToList();
    }

    public async Task<List<ProductStatDto>> GetTopProductsByRevenueAsync(int count)
    {
        return await _context.OrderItems
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.Product!)
            .Select(g => new ProductStatDto
            {
                ProductId = g.Key.Id,
                ProductName = g.Key.Name,
                TotalQuantity = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderByDescending(p => p.TotalRevenue)
            .Take(count)
            .ToListAsync();
    }

    public async Task<List<ProductStatDto>> GetTopProductsByQuantityAsync(int count)
    {
        return await _context.OrderItems
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.Product!)
            .Select(g => new ProductStatDto
            {
                ProductId = g.Key.Id,
                ProductName = g.Key.Name,
                TotalQuantity = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderByDescending(p => p.TotalQuantity)
            .Take(count)
            .ToListAsync();
    }

    public async Task<List<ProductStatDto>> GetLeastPopularProductsAsync(int count)
    {
        return await _context.OrderItems
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.Product!)
            .Select(g => new ProductStatDto
            {
                ProductId = g.Key.Id,
                ProductName = g.Key.Name,
                TotalQuantity = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderBy(p => p.TotalQuantity)
            .Take(count)
            .ToListAsync();
    }

    public async Task<List<ToppingStatDto>> GetTopToppingsAsync(int count)
    {
        return await _context.OrderItemToppings
            .Where(oit => oit.Topping != null)
            .GroupBy(oit => oit.Topping!)
            .Select(g => new ToppingStatDto
            {
                ToppingId = g.Key.Id,
                ToppingName = g.Key.Name,
                UsageCount = g.Count()
            })
            .OrderByDescending(t => t.UsageCount)
            .Take(count)
            .ToListAsync();
    }

    // --- BẮT ĐẦU SỬA LỖI ---
    // Chức năng 11
    public async Task<List<EmployeeRevenueDto>> GetTopEmployeesByRevenueAsync(DateTime startDate, DateTime endDate, int count)
    {
        // Logic mới: ApprovedByUserId trong Orders chính là MaNV trong NhanVien
        var employeeStats = await _context.Orders
            .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate && o.Status == OrderStatus.Paid && o.ApprovedByUserId != null)
            .GroupBy(o => o.ApprovedByUserId!.Value) // Group by MaNV
            .Select(g => new 
            {
                MaNV = g.Key,
                TotalRevenue = g.Sum(o => o.FinalAmount),
                TotalOrders = g.Count()
            })
            .OrderByDescending(e => e.TotalRevenue)
            .Take(count)
            .ToListAsync();

        var employeeIds = employeeStats.Select(es => es.MaNV).ToList();
        
        // Tạo một từ điển để tra cứu tên nhân viên hiệu quả
        var employees = await _context.NhanViens
            .Where(nv => employeeIds.Contains(nv.MaNV))
            .ToDictionaryAsync(nv => nv.MaNV);

        // Kết hợp kết quả thống kê với tên nhân viên
        return employeeStats.Select(es => new EmployeeRevenueDto
        {
            MaNV = es.MaNV,
            HoTen = employees.ContainsKey(es.MaNV) ? employees[es.MaNV].HoTen : "Không rõ",
            TotalRevenue = es.TotalRevenue,
            TotalOrders = es.TotalOrders
        }).ToList();
    }
    // --- KẾT THÚC SỬA LỖI ---

    public async Task<List<EmployeeAttendanceDto>> GetEmployeeAttendanceStatsAsync(int month, int year)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var chamCongs = await _context.ChamCongs
            .Include(c => c.PhanCong)
                .ThenInclude(p => p!.NhanVien)
            .Where(c => c.ThoiGianVao >= startDate && c.ThoiGianVao <= endDate)
            .Where(c => c.PhanCong != null && c.PhanCong.NhanVien != null)
            .ToListAsync();

        return chamCongs
            .GroupBy(c => c.PhanCong!.NhanVien!)
            .Select(g => new EmployeeAttendanceDto
            {
                MaNV = g.Key.MaNV,
                HoTen = g.Key.HoTen,
                LateCount = g.Count(c => c.TrangThai == "Đi trễ"),
                ForgotCheckoutCount = g.Count(c => c.ThoiGianRa == null),
                TotalHoursWorked = Math.Round(g.Sum(c => c.ThoiGianRa.HasValue ? (c.ThoiGianRa.Value - c.ThoiGianVao).TotalHours : 1.0), 2)
            })
            .ToList();
    }

    public async Task<InventoryStatsDto> GetInventoryStatsAsync(int lowStockThreshold = 10)
    {
        var ingredients = await _context.Ingredients.ToListAsync();

        var totalValue = ingredients.Sum(i => i.QuantityInStock * i.CostPrice);
        var lowStockItems = ingredients
            .Where(i => i.QuantityInStock < lowStockThreshold)
            .Select(i => new LowStockIngredientDto
            {
                IngredientId = i.Id,
                Name = i.Name,
                CurrentStock = i.QuantityInStock,
                Unit = i.Unit
            })
            .ToList();

        return new InventoryStatsDto
        {
            TotalInventoryValue = totalValue,
            LowStockItems = lowStockItems
        };
    }
}
