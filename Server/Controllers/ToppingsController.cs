using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ToppingsController : ControllerBase
{
    private readonly AppDbContext _context;
    public ToppingsController(AppDbContext context) { _context = context; }

    [HttpGet]
    public async Task<IActionResult> GetAllToppings()
    {
        var toppings = await _context.Toppings.OrderBy(t => t.Name).ToListAsync();
        return Ok(toppings);
    }
}