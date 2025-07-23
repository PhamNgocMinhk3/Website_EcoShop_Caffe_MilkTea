using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs; 
using Server.Models; 

[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly AppDbContext _context;
    public VouchersController(AppDbContext context) { _context = context; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublicVoucherDto>>> GetAllValidVouchers()
    {
        var vouchers = await _context.Vouchers
            .Where(v => v.IsActive && v.UsageCount < v.UsageLimit)
            .Select(v => new PublicVoucherDto(v.Id, v.Code, v.DiscountAmount))
            .ToListAsync();
        return Ok(vouchers);
    }

    [HttpGet("manage")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AdminVoucherDto>>> GetAllVouchersForAdmin()
    {
        var vouchers = await _context.Vouchers
            .Select(v => new AdminVoucherDto(v.Id, v.Code, v.DiscountAmount, v.UsageCount, v.UsageLimit, v.IsActive))
            .ToListAsync();
        return Ok(vouchers);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateVoucher(CreateVoucherDto dto)
    {
        var voucher = new Voucher
        {
            Code = dto.Code,
            DiscountAmount = dto.DiscountAmount,
            UsageLimit = dto.UsageLimit,
            IsActive = true,
            UsageCount = 0
        };
        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAllVouchersForAdmin), new { id = voucher.Id }, voucher);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateVoucher(int id, UpdateVoucherDto dto)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();
        voucher.Code = dto.Code;
        voucher.DiscountAmount = dto.DiscountAmount;
        voucher.UsageLimit = dto.UsageLimit;
        voucher.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteVoucher(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return NotFound();
        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}