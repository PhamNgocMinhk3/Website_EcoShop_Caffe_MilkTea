// --- File: Models/Voucher.cs, Order.cs, OrderItem.cs, OrderItemTopping.cs ---
// Thêm các file này vào thư mục Models
namespace Server.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public int UsageCount { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; }
    }

}