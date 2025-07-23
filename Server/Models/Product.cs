using System.Collections.Generic;

namespace Server.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Img { get; set; } // Sẽ lưu tên file ảnh
        public decimal Price { get; set; }
        public int PurchaseCount { get; set; }
        public string? Note { get; set; }

        // Quan hệ: Một Product có nhiều RecipeItem
        public virtual ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
    }
}