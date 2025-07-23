using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System.Security.Claims;
using System.Text.Json;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IVnPayService _vnPayService;
    public OrdersController(AppDbContext context, IVnPayService vnPayService)
    {
        _context = context;
        _vnPayService = vnPayService;
    }

    [HttpPost("session-cart")]
    public IActionResult SaveCartToSession([FromBody] List<CartItemDto> cartItems)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Token không hợp lệ.");
        }

        var sessionKey = $"Cart_{userId}";
        var cartJson = JsonSerializer.Serialize(cartItems);
        HttpContext.Session.SetString(sessionKey, cartJson);

        return Ok(new { message = "Giỏ hàng đã được lưu thành công." });
    }

    [HttpGet("session-cart")]
    public IActionResult GetCartFromSession()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Token không hợp lệ.");
        }

        var sessionKey = $"Cart_{userId}";
        var cartJson = HttpContext.Session.GetString(sessionKey);

        if (string.IsNullOrEmpty(cartJson))
        {
            return Ok(new List<CartItemDto>());
        }

        var cartItems = JsonSerializer.Deserialize<List<CartItemDto>>(cartJson);
        return Ok(cartItems);
    }

    [HttpGet]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<ActionResult<IEnumerable<OrderDetailDto>>> GetOrders()
    {
        // Bước 1: Lấy dữ liệu thô từ database vào bộ nhớ.
        var ordersFromDb = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Table)
            .Include(o => o.Voucher)
            .Include(o => o.ApprovedByUser)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemToppings)
                    .ThenInclude(oit => oit.Topping)
            .OrderBy(o =>
                o.Status == OrderStatus.PendingBooking ? 0 :
                o.Status == OrderStatus.Confirmed ? 1 :
                o.Status == OrderStatus.Paid ? 2 : 3)
            .ThenByDescending(o => o.BookingTime)
            .ToListAsync();

        // Bước 2: Chuyển đổi các đối tượng trong bộ nhớ thành DTO.
        var orderDtos = ordersFromDb.Select(o => new OrderDetailDto(
            o.Id,
            o.Table.Name,
            o.Voucher?.Code,
            o.TotalAmount,
            o.FinalAmount,
            o.Status.ToString(),
            o.PaymentMethod.ToString(),
            o.NumberOfGuests,
            o.BookingTime,
            o.CheckIn,
            o.CreatedAt,
            o.PaidAt,
            o.ApprovedByUser?.Email,
            o.OrderItems.Select(oi => new OrderItemDetailDto(
                oi.ProductId,
                oi.Product.Name,
                oi.Quantity,
                oi.UnitPrice,
                oi.OrderItemToppings.Select(oit => oit.Topping.Name).ToList()
            )).ToList()
        ));

        return Ok(orderDtos);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<ActionResult<OrderDetailDto>> GetOrder(int id)
    {
        // Bước 1: Lấy một đối tượng thô từ database vào bộ nhớ.
        var orderFromDb = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Table)
            .Include(o => o.Voucher)
            .Include(o => o.ApprovedByUser)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemToppings)
                    .ThenInclude(oit => oit.Topping)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (orderFromDb == null)
        {
            return NotFound($"Không tìm thấy hóa đơn với ID = {id}");
        }

        // Bước 2: Chuyển đổi đối tượng trong bộ nhớ thành DTO.
        var orderDto = new OrderDetailDto(
            orderFromDb.Id,
            orderFromDb.Table.Name,
            orderFromDb.Voucher?.Code,
            orderFromDb.TotalAmount,
            orderFromDb.FinalAmount,
            orderFromDb.Status.ToString(),
            orderFromDb.PaymentMethod.ToString(),
            orderFromDb.NumberOfGuests,
            orderFromDb.BookingTime,
            orderFromDb.CheckIn,
            orderFromDb.CreatedAt,
            orderFromDb.PaidAt,
            orderFromDb.ApprovedByUser?.Email,
            orderFromDb.OrderItems.Select(oi => new OrderItemDetailDto(
                oi.ProductId,
                oi.Product.Name,
                oi.Quantity,
                oi.UnitPrice,
                oi.OrderItemToppings.Select(oit => oit.Topping.Name).ToList()
            )).ToList()
        );

        return Ok(orderDto);
    }

    [HttpPut("{id}/check-in")]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<IActionResult> ToggleCheckInStatus(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound("Không tìm thấy hóa đơn.");
        }

        // Logic mới: Đảo ngược trạng thái CheckIn (true thành false, false thành true)
        order.CheckIn = !order.CheckIn;

        await _context.SaveChangesAsync();

        // Trả về trạng thái mới để client cập nhật UI
        return Ok(new { checkInStatus = order.CheckIn });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.Include(o => o.Table).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
        {
            return NotFound("Không tìm thấy hóa đơn.");
        }

        var newStatus = (OrderStatus)dto.Status;

        // Logic mới: Không còn chặn việc cập nhật thành "Confirmed"
        order.Status = newStatus;

        // Cập nhật trạng thái bàn và các thông tin khác dựa trên trạng thái mới của đơn hàng
        if (newStatus == OrderStatus.Confirmed)
        {
            order.Table.Status = TableStatus.Occupied;
        }
        else if (newStatus == OrderStatus.Paid || newStatus == OrderStatus.Cancelled)
        {
            order.Table.Status = TableStatus.Available;
            if (newStatus == OrderStatus.Paid)
            {
                order.PaidAt = DateTime.UtcNow;
            }
        }
        // Nếu là PendingBooking, ta có thể giả định bàn vẫn Available
        // (hoặc giữ nguyên trạng thái hiện tại tùy logic của bạn)
        else if (newStatus == OrderStatus.PendingBooking)
        {
            order.Table.Status = TableStatus.Available;
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Lỗi khi cập nhật trạng thái hóa đơn.");
        }
    }

    [HttpPost("check-availability")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckAvailability(CheckAvailabilityDto dto)
    {
        var bookingDurationHours = 2;
        var requestedStartTime = dto.BookingTime;
        var requestedEndTime = dto.BookingTime.AddHours(bookingDurationHours);

        var isOverlapping = await _context.Orders
            .AnyAsync(o => o.TableId == dto.TableId &&
                            o.Status != OrderStatus.Cancelled &&
                            o.Status != OrderStatus.Paid &&
                            requestedStartTime < o.BookingTime.AddHours(bookingDurationHours) &&
                            requestedEndTime > o.BookingTime);

        if (isOverlapping)
        {
            return Ok(new { isAvailable = false, message = "Khung giờ này đã có người khác đặt. Vui lòng chọn thời gian khác." });
        }
        return Ok(new { isAvailable = true });
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Kiểm tra lịch trùng lặp (giữ nguyên)
            var bookingDurationHours = 2;
            var requestedStartTime = dto.BookingTime;
            var requestedEndTime = dto.BookingTime.AddHours(bookingDurationHours);
            var isOverlapping = await _context.Orders.AnyAsync(o => o.TableId == dto.TableId && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Paid && requestedStartTime < o.BookingTime.AddHours(bookingDurationHours) && requestedEndTime > o.BookingTime);
            if (isOverlapping)
            {
                await transaction.RollbackAsync();
                return Conflict(new { message = "Rất tiếc, bàn này vừa có người khác đặt. Vui lòng thử lại." });
            }

            // 2. Lấy thông tin user (giữ nguyên)
            int? approvedByUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdValue, out var userId))
                {
                    approvedByUserId = userId;
                }
            }

            // 3. Xử lý voucher và tính toán (giữ nguyên)
            Voucher? voucher = null;
            decimal discountAmount = 0;
            if (dto.VoucherId.HasValue)
            {
                voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == dto.VoucherId && v.IsActive && v.UsageCount < v.UsageLimit);
                if (voucher == null) return BadRequest("Mã giảm giá không hợp lệ.");
                discountAmount = voucher.DiscountAmount;
            }

            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();
            foreach (var itemDto in dto.Items)
            {
                var product = await _context.Products.FindAsync(itemDto.ProductId);
                if (product == null) return BadRequest($"Sản phẩm với ID {itemDto.ProductId} không tồn tại.");
                var toppings = await _context.Toppings.Where(t => itemDto.ToppingIds.Contains(t.Id)).ToListAsync();
                decimal itemPrice = product.Price + toppings.Sum(t => t.Price);
                totalAmount += itemPrice * itemDto.Quantity;
                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemPrice,
                    OrderItemToppings = toppings.Select(t => new OrderItemTopping { ToppingId = t.Id }).ToList()
                };
                orderItems.Add(orderItem);
            }

            // 4. Tạo đối tượng Order (giữ nguyên)
            var order = new Order
            {
                TableId = dto.TableId,
                VoucherId = voucher?.Id,
                TotalAmount = totalAmount,
                FinalAmount = Math.Max(0, totalAmount - discountAmount),
                Status = OrderStatus.PendingBooking, // Luôn bắt đầu là Pending
                PaymentMethod = (PaymentMethod)dto.PaymentMethod,
                NumberOfGuests = dto.NumberOfGuests,
                BookingTime = dto.BookingTime,
                CreatedAt = DateTime.UtcNow,
                ApprovedByUserId = approvedByUserId,
                OrderItems = orderItems
            };

            // 5. Thêm Order vào context và lưu để lấy ID
            _context.Orders.Add(order);
            if (voucher != null)
            {
                voucher.UsageCount++;
            }
            await _context.SaveChangesAsync();

            // 6. ✨ LOGIC MỚI: Xử lý theo phương thức thanh toán ✨
            if (order.PaymentMethod == PaymentMethod.VNPAY)
            {
                // Nếu là VNPAY, tạo link và trả về
                var paymentUrl = _vnPayService.CreatePaymentUrl(HttpContext, order);

                await transaction.CommitAsync();
                return Ok(new { paymentUrl }); // Trả về object chứa link
            }
            else
            {
                // Nếu là phương thức khác, chỉ cần trả về ID như cũ
                await transaction.CommitAsync();
                return Ok(new { OrderId = order.Id, Message = "Đặt bàn và tạo hóa đơn thành công!" });
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine(ex.ToString());
            return StatusCode(500, "Đã có lỗi xảy ra ở phía máy chủ.");
        }
    }
    
    [HttpPost("vnpay-return")]
    [AllowAnonymous]
    public async Task<IActionResult> VnpayReturn([FromForm] IFormCollection form)
    {
        var collection = new QueryCollection(form.ToDictionary(k => k.Key, v => v.Value));
        var validationResult = _vnPayService.ValidatePaymentResponse(collection);

        if (!validationResult.IsSuccess || !int.TryParse(validationResult.OrderId, out int orderId))
        {
            return BadRequest(new { message = validationResult.Message });
        }

        var order = await _context.Orders.Include(o => o.Table).FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        if (validationResult.VnPayResponseCode != "00")
        {
            if (order.Status == OrderStatus.PendingBooking)
            {
                order.Status = OrderStatus.Cancelled;
                await _context.SaveChangesAsync();
            }
            return BadRequest(new { message = "Giao dịch trên VNPAY không thành công." });
        }

        if (order.Status == OrderStatus.PendingBooking)
        {
            order.Status = OrderStatus.Confirmed;
            order.PaidAt = DateTime.UtcNow;



            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Xác nhận thanh toán thành công!" });
        }
        
        if(order.Status == OrderStatus.Confirmed || order.Status == OrderStatus.Paid)
        {
            return Ok(new { message = "Đơn hàng đã được xác nhận thanh toán trước đó." });
        }

        return BadRequest(new { message = $"Đơn hàng đang ở trạng thái không hợp lệ: {order.Status}." });
    }
}
    
