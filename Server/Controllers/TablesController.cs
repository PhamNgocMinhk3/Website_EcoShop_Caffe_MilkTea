using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TablesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tables
    // Lấy danh sách tất cả các bàn
    [HttpGet]
    public async Task<IActionResult> GetTables()
    {
        var tables = await _context.Tables
            .OrderBy(t => t.Id)
            .Select(t => new TableDto(t.Id, t.Name, t.Status.ToString())) // Chuyển status enum thành chuỗi cho dễ hiểu
            .ToListAsync();
            
        return Ok(tables);
    }

    // GET: api/tables/{id}
    // Lấy thông tin một bàn cụ thể
    [HttpGet("{id}")]
    public async Task<ActionResult<TableDto>> GetTable(int id)
    {
        var table = await _context.Tables.FindAsync(id);

        if (table == null)
        {
            return NotFound();
        }

        return Ok(new TableDto(table.Id, table.Name, table.Status.ToString()));
    }

    // POST: api/tables
    // Tạo một bàn mới (chỉ Admin/Quản lý có quyền)
    [HttpPost]
    [Authorize(Roles = "Quản Lý")]
    public async Task<ActionResult<Table>> CreateTable(CreateTableDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Name))
        {
            return BadRequest("Tên bàn không được để trống.");
        }

        var newTable = new Table
        {
            Name = createDto.Name,
            Status = TableStatus.Available // Mặc định khi tạo mới, bàn sẽ "Trống" (Available)
        };

        _context.Tables.Add(newTable);
        await _context.SaveChangesAsync();

        // Trả về thông tin bàn vừa tạo theo chuẩn RESTful
        return CreatedAtAction(nameof(GetTable), new { id = newTable.Id }, newTable);
    }

    // PUT: api/tables/{id}
    // Cập nhật tên của một bàn (chỉ Admin/Quản lý có quyền)
    [HttpPut("{id}")]
    [Authorize(Roles = "Quản Lý")]
    public async Task<IActionResult> UpdateTable(int id, CreateTableDto updateDto)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
        {
            return NotFound("Không tìm thấy bàn.");
        }

        if (string.IsNullOrWhiteSpace(updateDto.Name))
        {
            return BadRequest("Tên bàn không được để trống.");
        }

        table.Name = updateDto.Name;
        await _context.SaveChangesAsync();

        return NoContent(); // Cập nhật thành công
    }
    
    // PUT: api/tables/{id}/status
    // Cập nhật trạng thái của một bàn
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Quản Lý,Nhân Viên")] // Cho phép cả Quản lý và Nhân viên
    public async Task<IActionResult> UpdateTableStatus(int id, UpdateTableStatusDto updateDto)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
        {
            return NotFound("Không tìm thấy bàn.");
        }

        // Kiểm tra xem status gửi lên có hợp lệ không
        if (!Enum.IsDefined(typeof(TableStatus), updateDto.Status))
        {
            return BadRequest("Trạng thái không hợp lệ.");
        }

        table.Status = (TableStatus)updateDto.Status;
        await _context.SaveChangesAsync();

        return NoContent(); // Trả về 204 No Content khi cập nhật thành công
    }

    // DELETE: api/tables/{id}
    // Xóa một bàn (chỉ Admin/Quản lý có quyền)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Quản Lý")]
    public async Task<IActionResult> DeleteTable(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
        {
            return NotFound();
        }

        // Thêm kiểm tra: Không cho xóa bàn đang có khách để đảm bảo nghiệp vụ
        if (table.Status == TableStatus.Occupied)
        {
            return BadRequest("Không thể xóa bàn đang có khách.");
        }

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}