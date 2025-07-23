// Models/User.cs
using System.ComponentModel.DataAnnotations.Schema; // Sửa lỗi cú pháp: using phải ở trên cùng

namespace Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;
        public virtual NhanVien? NhanVien { get; set; }
    }
    
}
