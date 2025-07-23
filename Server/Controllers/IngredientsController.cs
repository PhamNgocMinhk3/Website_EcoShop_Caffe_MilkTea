using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Server.DTOs;
using Server.Models;
using System.Drawing;

[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IngredientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Ingredients (API ĐƯỢC THÊM MỚI)
    [HttpGet]
    [Authorize(Roles = "Quản Lý,Nhân Viên")]
    public async Task<ActionResult<IEnumerable<object>>> GetIngredients()
    {
        var ingredients = await _context.Ingredients
            .AsNoTracking()
            .Select(i => new { i.Id, i.Name })
            .ToListAsync();
        return Ok(ingredients);
    }

    [HttpPost]
    [Authorize(Roles = "Quản Lý")] 

    public async Task<ActionResult<Ingredient>> CreateIngredient([FromBody] CreateIngredientDto dto)
    {
        var newIngredient = new Ingredient
        {
            Name = dto.Name,
            Unit = dto.Unit,
            CostPrice = dto.CostPrice,
            QuantityInStock = dto.QuantityInStock
        };

        _context.Ingredients.Add(newIngredient);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWarehouseState), new { id = newIngredient.Id }, newIngredient);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Quản Lý")] 
    public async Task<IActionResult> UpdateIngredient(int id, [FromBody] UpdateIngredientDto dto)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);
        if (ingredient == null)
        {
            return NotFound("Không tìm thấy nguyên liệu.");
        }

        ingredient.Name = dto.Name;
        ingredient.Unit = dto.Unit;
        ingredient.CostPrice = dto.CostPrice;
        ingredient.QuantityInStock = dto.QuantityInStock;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("warehouse")]
    public async Task<ActionResult<IEnumerable<IngredientWarehouseDto>>> GetWarehouseState()
    {
        var data = await GetWarehouseDataAsync();
        return Ok(data);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportToExcel()
    {
        var warehouseData = await GetWarehouseDataAsync();

        if (warehouseData == null || !warehouseData.Any())
        {
            return NotFound("Không có dữ liệu để xuất file.");
        }

        using (var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add("TonKhoNguyenLieu");

            worksheet.Cells[1, 1].Value = "ID";
            worksheet.Cells[1, 2].Value = "Tên Nguyên Liệu";
            worksheet.Cells[1, 3].Value = "Đơn Vị";
            worksheet.Cells[1, 4].Value = "Giá Vốn";
            worksheet.Cells[1, 5].Value = "Tồn Kho (Qualyti)";
            worksheet.Cells[1, 6].Value = "Đã Dùng";
            worksheet.Cells[1, 7].Value = "Trạng Thái";

            using (var range = worksheet.Cells[1, 1, 1, 7])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            for (int i = 0; i < warehouseData.Count; i++)
            {
                var item = warehouseData[i];
                int row = i + 2;
                worksheet.Cells[row, 1].Value = item.Id;
                worksheet.Cells[row, 2].Value = item.Name;
                worksheet.Cells[row, 3].Value = item.Unit;
                worksheet.Cells[row, 4].Value = item.CostPrice;
                worksheet.Cells[row, 5].Value = item.QuantityInStock;
                worksheet.Cells[row, 6].Value = item.TotalUsed;
                worksheet.Cells[row, 7].Value = item.Status;

                Color rowColor;
                switch (item.Status)
                {
                    case "Cần Nhập":
                        rowColor = Color.FromArgb(255, 204, 204); // Đỏ nhạt
                        break;
                    case "Chuẩn Bị Nhập":
                        rowColor = Color.FromArgb(255, 255, 204); // Vàng nhạt
                        break;
                    default: // "Không Cần Nhập"
                        rowColor = Color.FromArgb(204, 255, 204); // Xanh nhạt
                        break;
                }
                using (var range = worksheet.Cells[row, 1, row, 7])
                {
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(rowColor);
                }
            }
            
            worksheet.Cells.AutoFitColumns();

            var stream = new MemoryStream();
            package.SaveAs(stream);
            stream.Position = 0;

            string excelName = $"DanhSachTonKho_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
        }
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng chọn một file Excel.");
        }

        var updatedCount = 0;
        var notFoundCount = 0;

        using (var stream = new MemoryStream())
        {
            await file.CopyToAsync(stream);
            using (var package = new ExcelPackage(stream))
            {
                if (package.Workbook.Worksheets.Count == 0)
                    return BadRequest("File excel không hợp lệ.");

                var worksheet = package.Workbook.Worksheets[0];
                var rowCount = worksheet.Dimension.Rows;

                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var id = Convert.ToInt32(worksheet.Cells[row, 1].Value);
                        
                        var name = worksheet.Cells[row, 2].Value?.ToString() ?? string.Empty;
                        var unit = worksheet.Cells[row, 3].Value?.ToString() ?? string.Empty;
                        
                        var costPrice = Convert.ToDecimal(worksheet.Cells[row, 4].Value);
                        var quantity = Convert.ToDecimal(worksheet.Cells[row, 5].Value);

                        var ingredient = await _context.Ingredients.FindAsync(id);
                        if (ingredient != null)
                        {
                            ingredient.Name = name;
                            ingredient.Unit = unit;
                            ingredient.CostPrice = costPrice;
                            ingredient.QuantityInStock = quantity;
                            updatedCount++;
                        }
                        else
                        {
                            notFoundCount++;
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Import hoàn tất. Đã cập nhật: {updatedCount} nguyên liệu. Không tìm thấy: {notFoundCount} nguyên liệu." });
    }

    // === PHƯƠNG THỨC HELPER ĐỂ TÁI SỬ DỤNG LOGIC ===
    private async Task<List<IngredientWarehouseDto>> GetWarehouseDataAsync()
    {
        // 1. Lấy danh sách tất cả nguyên liệu trong kho
        var allIngredients = await _context.Ingredients.AsNoTracking().ToListAsync();

        // 2. Tính tổng số lượng đã sử dụng cho mỗi nguyên liệu
        var ingredientsUsage = await _context.RecipeItems
            .AsNoTracking()
            .Include(ri => ri.Product)
            .GroupBy(ri => ri.IngredientId) // Group theo ID là đủ và hiệu quả hơn
            .Select(g => new IngredientUsageDto(
                g.Key,
                g.Sum(ri => ri.Product.PurchaseCount * ri.Quantity)
            ))
            .ToDictionaryAsync(x => x.IngredientId);

        // 3. Kết hợp dữ liệu và tạo DTO trả về
        var result = allIngredients.Select(ing =>
        {
            var usage = ingredientsUsage.GetValueOrDefault(ing.Id)?.TotalIngredientUsed ?? 0;
            
            string status;
            if (ing.QuantityInStock > (decimal)usage)
            {
                status = "Không Cần Nhập";
            }
            else if (ing.QuantityInStock == (decimal)usage)
            {
                status = "Chuẩn Bị Nhập";
            }
            else
            {
                status = "Cần Nhập";
            }

            return new IngredientWarehouseDto(
                ing.Id,
                ing.Name,
                ing.Unit,
                ing.CostPrice,
                ing.QuantityInStock,
                usage,
                status
            );
        }).ToList();

        return result;
    }
}