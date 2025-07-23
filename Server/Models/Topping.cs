
// --- File: Models/Topping.cs ---
namespace Server.Models
{
    public class Topping
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
