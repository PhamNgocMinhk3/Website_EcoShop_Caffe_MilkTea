namespace Server.Models
{
    public enum OrderStatus 
    { 
        PendingBooking = 0, // Chờ xác nhận/Đơn đặt trước
        Confirmed = 1,      // Đã xác nhận/Khách đang ngồi
        Paid = 2,           // Đã thanh toán
        Cancelled = 3       // Đã hủy
    }
    
    public enum PaymentMethod 
    { 
        Cash = 0, 
        Card = 1, 
        VNPAY = 2, 
        Metamask = 3 
    }
    
    public class Order
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public int? VoucherId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int NumberOfGuests { get; set; }
        public DateTime BookingTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public int? ApprovedByUserId { get; set; }
        public bool CheckIn { get; set; }
        public virtual Table Table { get; set; } = null!;
        public virtual Voucher? Voucher { get; set; }
        public virtual User? ApprovedByUser { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}