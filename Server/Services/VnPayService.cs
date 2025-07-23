// Services/VnPayService.cs
using Server.Models;
using System.Net.Sockets;
using System.Net;

public class VnPayService : IVnPayService
{
    private readonly IConfiguration _config;

    public VnPayService(IConfiguration config)
    {
        _config = config;
    }

    public string CreatePaymentUrl(HttpContext context, Order order)
    {
        var vnpaySettings = _config.GetSection("VnPaySettings");
        var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
        var tick = DateTime.Now.Ticks.ToString();
        var pay = new VnPayLibrary();

        pay.AddRequestData("vnp_Version", vnpaySettings["Version"] ?? "2.1.0");
        pay.AddRequestData("vnp_Command", vnpaySettings["Command"] ?? "pay");
        pay.AddRequestData("vnp_TmnCode", vnpaySettings["TmnCode"]!);
        pay.AddRequestData("vnp_Amount", ((long)order.FinalAmount * 100).ToString());
        pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
        pay.AddRequestData("vnp_CurrCode", vnpaySettings["CurrCode"] ?? "VND");
        pay.AddRequestData("vnp_IpAddr", GetIpAddress(context));
        pay.AddRequestData("vnp_Locale", vnpaySettings["Locale"] ?? "vn");
        pay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang The Alley: {order.Id}");
        pay.AddRequestData("vnp_OrderType", "other");
        pay.AddRequestData("vnp_ReturnUrl", vnpaySettings["ReturnUrl"]!);
        pay.AddRequestData("vnp_TxnRef", order.Id.ToString());

        var paymentUrl = pay.CreateRequestUrl(vnpaySettings["Url"]!, vnpaySettings["HashSecret"]!);
        return paymentUrl;
    }

    private string GetIpAddress(HttpContext context)
    {
        var ipAddress = string.Empty;
        try
        {
            var remoteIpAddress = context.Connection.RemoteIpAddress;
            if (remoteIpAddress != null)
            {
                if (remoteIpAddress.AddressFamily == AddressFamily.InterNetworkV6)
                {
                    remoteIpAddress = Dns.GetHostEntry(remoteIpAddress).AddressList
                        .FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);
                }
                if (remoteIpAddress != null) ipAddress = remoteIpAddress.ToString();
            }
        }
        catch (Exception)
        {
            ipAddress = "127.0.0.1";
        }
        return ipAddress;
    }
     // ✨ THÊM PHƯƠNG THỨC NÀY
    public VnpayTransactionResult ValidatePaymentResponse(IQueryCollection responseData)
    {
        var result = new VnpayTransactionResult();
        var vnp_HashSecret = _config.GetSection("VnPaySettings")["HashSecret"]!;
        var pay = new VnPayLibrary();

        foreach (var (key, value) in responseData)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                pay.AddResponseData(key, value.ToString());
            }
        }

        var vnp_TxnRef = pay.GetResponseData("vnp_TxnRef");
        var vnp_ResponseCode = pay.GetResponseData("vnp_ResponseCode");
        var vnp_SecureHash = pay.GetResponseData("vnp_SecureHash");

        result.OrderId = vnp_TxnRef;
        result.VnPayResponseCode = vnp_ResponseCode;

        bool checkSignature = pay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);
        if (!checkSignature)
        {
            result.IsSuccess = false;
            result.Message = "Chữ ký không hợp lệ.";
            return result;
        }

        if (vnp_ResponseCode == "00")
        {
            result.IsSuccess = true;
            result.Message = "Giao dịch thành công.";
        }
        else
        {
            result.IsSuccess = false;
            result.Message = $"Giao dịch thất bại. Mã lỗi: {vnp_ResponseCode}";
        }

        return result;
    }
}