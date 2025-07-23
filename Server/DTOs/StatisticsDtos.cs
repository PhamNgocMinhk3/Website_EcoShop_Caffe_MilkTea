using System;
using System.Collections.Generic;

namespace Server.DTOs
{
    // DTO cho các chỉ số tổng quan (chức năng 1, 2, 3, 4)
    public class OverviewStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal TotalGrossProfit { get; set; }
    }

    // DTO cho biểu đồ doanh thu (chức năng 5)
    public class RevenueDataPointDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
    }

    // DTO cho các sản phẩm top/đáy (chức năng 6, 7, 9)
    public class ProductStatDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int TotalQuantity { get; set; }
    }
    
    // DTO cho topping phổ biến (chức năng 8)
    public class ToppingStatDto
    {
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }

    // DTO cho doanh thu nhân viên (chức năng 11)
    public class EmployeeRevenueDto
    {
        public int MaNV { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
    }

    // DTO cho chuyên cần nhân viên (chức năng 12)
    public class EmployeeAttendanceDto
    {
        public int MaNV { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public double TotalHoursWorked { get; set; }
        public int LateCount { get; set; }
        public int ForgotCheckoutCount { get; set; }
    }

    // DTO cho tồn kho (chức năng 13, 14)
    public class InventoryStatsDto
    {
        public decimal TotalInventoryValue { get; set; }
        public List<LowStockIngredientDto> LowStockItems { get; set; } = new();
    }

    public class LowStockIngredientDto
    {
        public int IngredientId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal CurrentStock { get; set; }
        public string Unit { get; set; } = string.Empty;
    }
}
