// Services/IVnPayService.cs
using Server.Models;

// ✨ TẠO CLASS NÀY ĐỂ CHỨA KẾT QUẢ XÁC THỰC
public class VnpayTransactionResult
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? OrderId { get; set; }
    public string? VnPayResponseCode { get; set; }
}

public interface IVnPayService
{
    string CreatePaymentUrl(HttpContext context, Order order);
    // ✨ THÊM PHƯƠNG THỨC NÀY
    VnpayTransactionResult ValidatePaymentResponse(IQueryCollection responseData);
}