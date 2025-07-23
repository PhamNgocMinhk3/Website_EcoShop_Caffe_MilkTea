// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Npgsql;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // THÊM LẠI DÒNG NÀY ĐỂ SỬA LỖI BUILD
    // Khai báo tất cả các bảng
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<RecipeItem> RecipeItems { get; set; }
    public DbSet<Topping> Toppings { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<OrderItemTopping> OrderItemToppings { get; set; }
    public DbSet<NhanVien> NhanViens { get; set; }
    public DbSet<PhanCong> PhanCongs { get; set; }
    public DbSet<ChamCong> ChamCongs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OrderItemTopping>()
            .HasKey(ot => new { ot.OrderItemId, ot.ToppingId });
        modelBuilder.Entity<RecipeItem>()
            .HasOne(ri => ri.Product)
            .WithMany(p => p.RecipeItems)
            .HasForeignKey(ri => ri.ProductId)
            .OnDelete(DeleteBehavior.Cascade); // Khi xóa Product thì xóa luôn RecipeItem

        modelBuilder.Entity<RecipeItem>()
            .HasOne(ri => ri.Ingredient)
            .WithMany(i => i.RecipeItems)
            .HasForeignKey(ri => ri.IngredientId)
            .OnDelete(DeleteBehavior.Cascade); // Khi xóa Ingredient thì xóa luôn RecipeItem
        modelBuilder.Entity<PhanCong>()
            .HasOne(pc => pc.NhanVien) // Một phân công thuộc về một nhân viên
            .WithMany(nv => nv.PhanCongs) // Một nhân viên có nhiều phân công
            .HasForeignKey(pc => pc.MaNV) // Khóa ngoại là MaNV
            .OnDelete(DeleteBehavior.Cascade); 
        modelBuilder.Entity<User>()
            .HasOne(u => u.NhanVien) // Một User có một thông tin NhanVien
            .WithOne(nv => nv.User) // Một NhanVien thuộc về một User
            .HasForeignKey<NhanVien>(nv => nv.MaNV); // Khóa ngoại là MaNV
        modelBuilder.Entity<ChamCong>()
            .HasOne(cc => cc.PhanCong)
            .WithMany() 
            .HasForeignKey(cc => cc.PhanCongId)
            .OnDelete(DeleteBehavior.Cascade);
        // Dữ liệu ban đầu cho Role (bạn đã có)
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Khách Hàng" },
            new Role { Id = 2, Name = "Nhân Viên" },
            new Role { Id = 3, Name = "Quản Lý" }
        );
        modelBuilder.Entity<NhanVien>().ToTable("NhanVien");
    }
}
