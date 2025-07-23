using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // GET: api/products (Lấy danh sách, giữ nguyên từ code của bạn - rất tốt!)
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? sortBy,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 6)
    {
        var query = _context.Products.AsQueryable();
        if (sortBy?.ToLower() == "bestseller")
        {
            query = query.OrderByDescending(p => p.PurchaseCount);
        }
        else
        {
            query = query.OrderBy(p => p.Name);
        }
        var totalCount = await query.CountAsync();
        var products = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Name,
                Img = string.IsNullOrEmpty(p.Img) ? null : $"{Request.Scheme}://{Request.Host}/images/{p.Img}",
                p.Price,
                p.PurchaseCount,
                p.Note
            })
            .ToListAsync();
        var response = new
        {
            Data = products,
            CurrentPage = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
        return Ok(response);
    }

    // GET: api/products/{id} (Lấy chi tiết, giữ nguyên từ code của bạn)
   [HttpGet("{id}")]
public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
{
    var product = await _context.Products
        .AsNoTracking()
        .Include(p => p.RecipeItems)
            .ThenInclude(ri => ri.Ingredient)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (product == null) return NotFound();

    var productDto = new ProductDetailDto(
        product.Id,
        product.Name,
        string.IsNullOrEmpty(product.Img) ? null : $"{Request.Scheme}://{Request.Host}/images/{product.Img}",
        product.Price,
        product.PurchaseCount,
        product.Note,
        product.RecipeItems.Select(ri => new RecipeItemDetailDto( 
            ri.IngredientId,
            ri.Ingredient.Name,
            ri.Quantity,
            ri.Ingredient.Unit
        )).ToList()
    );
    return Ok(productDto);
}

    // POST: api/products (Tạo mới - Áp dụng cách gộp upload và tạo dữ liệu)
    [HttpPost]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<IActionResult> CreateProduct([FromForm] CreateOrUpdateProductDto dto, IFormFile? imageFile)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            string? uniqueFileName = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadPath = Path.Combine(_env.ContentRootPath, "Assets", "images");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var filePath = Path.Combine(uploadPath, uniqueFileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await imageFile.CopyToAsync(stream);
            }

            var newProduct = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Note = dto.Note,
                Img = uniqueFileName
            };

            foreach (var itemDto in dto.RecipeItems)
            {
                newProduct.RecipeItems.Add(new RecipeItem
                {
                    IngredientId = itemDto.IngredientId,
                    Quantity = itemDto.Quantity
                });
            }

            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = newProduct.Id }, newProduct);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // PUT: api/products/{id} (Cập nhật - Áp dụng cách gộp upload và cập nhật dữ liệu)
    [HttpPut("{id}")]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] CreateOrUpdateProductDto dto, IFormFile? imageFile)
    {
        var productToUpdate = await _context.Products
            .Include(p => p.RecipeItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (productToUpdate == null) return NotFound();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (imageFile != null && imageFile.Length > 0)
            {
                if (!string.IsNullOrEmpty(productToUpdate.Img))
                {
                    var oldImagePath = Path.Combine(_env.ContentRootPath, "Assets", "images", productToUpdate.Img);
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }
                var uploadPath = Path.Combine(_env.ContentRootPath, "Assets", "images");
                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var filePath = Path.Combine(uploadPath, uniqueFileName);
                await using var fileStream = new FileStream(filePath, FileMode.Create);
                await imageFile.CopyToAsync(fileStream);
                productToUpdate.Img = uniqueFileName;
            }

            productToUpdate.Name = dto.Name;
            productToUpdate.Price = dto.Price;
            productToUpdate.Note = dto.Note;

            _context.RecipeItems.RemoveRange(productToUpdate.RecipeItems);
            foreach (var itemDto in dto.RecipeItems)
            {
                productToUpdate.RecipeItems.Add(new RecipeItem
                {
                    IngredientId = itemDto.IngredientId,
                    Quantity = itemDto.Quantity
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // DELETE: api/products/{id} (Giữ nguyên từ code của bạn - đã xử lý xóa file rất tốt)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Quản Lý")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        if (!string.IsNullOrEmpty(product.Img))
        {
            var imagePath = Path.Combine(_env.ContentRootPath, "Assets", "images", product.Img);
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }
        }
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}