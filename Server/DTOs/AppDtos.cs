using Server.Models;
namespace Server.DTOs
{
    // --- Auth DTOs ---
    public record RegisterDto(string Email, string Password);
    public record LoginDto(string Email, string Password);
    public record TokenDto(int UserId, string AccessToken, string RefreshToken);
    public record ForgotPasswordDto(string Email);

    // --- Product DTOs ---
    public record RecipeItemDto(int IngredientId, string IngredientName, float Quantity, string Unit);
    public record ProductDetailDto(
        int Id,
        string Name,
        string? Img,
        decimal Price,
        int PurchaseCount,
        string? Note,
        List<RecipeItemDto> Recipe
    );

    public record RecipeItemForProductDto(int IngredientId, float Quantity);
    public record CreateOrUpdateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Img { get; set; }
        public decimal Price { get; set; }
        public string? Note { get; set; }
        public List<RecipeItemForProductDto> RecipeItems { get; set; } = new();
    }

    // --- Table DTOs ---
    public record TableDto(int Id, string Name, string Status);
    public record UpdateTableStatusDto(int Status);
    public record CreateTableDto(string Name);

    // --- Voucher DTOs ---
    public record PublicVoucherDto(int Id, string Code, decimal DiscountAmount);
    public record AdminVoucherDto(int Id, string Code, decimal DiscountAmount, int UsageCount, int UsageLimit, bool IsActive);
    public record CreateVoucherDto(string Code, decimal DiscountAmount, int UsageLimit);
    public record UpdateVoucherDto(string Code, decimal DiscountAmount, int UsageLimit, bool IsActive);

    // --- Order & Booking DTOs ---
    public record CheckAvailabilityDto(int TableId, DateTime BookingTime);
    public record CreateOrderDto(
        int TableId,
        int? VoucherId,
        int PaymentMethod,
        int NumberOfGuests,
        DateTime BookingTime,
        List<CreateOrderItemDto> Items
    );
    public record CreateOrderItemDto(int ProductId, int Quantity, List<int> ToppingIds);
    public record UpdateOrderStatusDto(int Status);
    public record OrderListItemDto(
        int Id,
        string TableName,
        decimal FinalAmount,
        string Status,
        DateTime BookingTime,
        int NumberOfGuests,
        bool CheckIn // <-- THÊM
    );

    public record OrderDetailDto(
        int Id,
        string TableName,
        string? VoucherCode,
        decimal TotalAmount,
        decimal FinalAmount,
        string Status,
        string PaymentMethod,
        int NumberOfGuests,
        DateTime BookingTime,
        bool CheckIn, // <-- THÊM
        DateTime CreatedAt,
        DateTime? PaidAt,
        string? ApprovedBy,
        List<OrderItemDetailDto> Items
    );

    public record OrderItemDetailDto(
        int ProductId,
        string ProductName,
        int Quantity,
        decimal UnitPrice,
        List<string> Toppings
    );

}
public record ProductListItemDto(int Id, string Name, string? Img, decimal Price, int PurchaseCount);

// DTO cho một mục trong công thức (khi xem chi tiết)
public record RecipeItemDetailDto(int IngredientId, string IngredientName, float Quantity, string Unit);

// DTO cho chi tiết một sản phẩm (bao gồm cả công thức)
public record ProductDetailDto(
    int Id,
    string Name,
    string? Img,
    decimal Price,
    int PurchaseCount,
    string? Note,
    List<RecipeItemDetailDto> RecipeItems
);

// DTO cho một mục trong công thức (khi tạo/cập nhật)
public record RecipeItemForCreateDto(int IngredientId, float Quantity);

// DTO dùng để tạo mới sản phẩm
public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Note { get; set; }
    public List<RecipeItemForCreateDto> RecipeItems { get; set; } = new();
}

// DTO dùng để cập nhật sản phẩm
public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Note { get; set; }
    public List<RecipeItemForCreateDto> RecipeItems { get; set; } = new();
}
public record IngredientDto(int Id, string Name, string Unit);
// --- NhanVien DTOs ---

// DTO để hiển thị danh sách nhân viên ngoài trang quản lý
public record NhanVienListItemDto(
    int UserId,
    string Email,
    string? HoTen, // Có thể null nếu chưa có thông tin
    string Status  // "Đã có thông tin" hoặc "Chưa có thông tin"
);

// DTO cho việc tạo và cập nhật thông tin nhân viên
public record CreateOrUpdateNhanVienDto(
    string HoTen,
    DateTime NgaySinh,
    string GioiTinh,
    string DiaChi,
    string SoDienThoai,
    string Email,
    string CCCD,
    LoaiNhanVien LoaiNhanVien
);

public record NhanVienDetailDto(
    int MaNV,
    string HoTen,
    DateTime NgaySinh,
    string GioiTinh,
    string DiaChi,
    string SoDienThoai,
    string Email,
    string CCCD,
    string LoaiNhanVien
);
// DTO này dùng để hiển thị danh sách trong kho, bao gồm cả trạng thái tính toán
public record IngredientWarehouseDto(
    int Id,
    string Name,
    string Unit,
    decimal CostPrice,
    decimal QuantityInStock, // Số lượng tồn kho (Qualyti)
    double TotalUsed,        // Tổng số lượng đã dùng
    string Status           // Trạng thái: "Không Cần Nhập", "Cần Nhập", ...
);

// DTO dùng khi tạo mới một nguyên liệu
public record CreateIngredientDto(
    string Name,
    string Unit,
    decimal CostPrice,
    decimal QuantityInStock // Số lượng tồn kho ban đầu
);

// DTO dùng khi cập nhật một nguyên liệu
public record UpdateIngredientDto(
    string Name,
    string Unit,
    decimal CostPrice,
    decimal QuantityInStock
);

// DTO dùng để tính toán nội bộ, không cần trả về client
public record IngredientUsageDto(int IngredientId, double TotalIngredientUsed);
public class CartItemDto
{
    public int ProductId { get; set; }
    // Sửa ở đây: Gán giá trị mặc định
    public string Name { get; set; } = string.Empty;
    // Sửa ở đây: Gán giá trị mặc định
    public string ImageUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    // Sửa ở đây: Gán giá trị mặc định
    public string Size { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    // Sửa ở đây: Gán giá trị mặc định
    public List<ToppingDto> SelectedToppings { get; set; } = new List<ToppingDto>();
    public decimal FinalPrice { get; set; }
    // Sửa ở đây: Gán giá trị mặc định
    public string UniqueId { get; set; } = string.Empty;
}

public class ToppingDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}