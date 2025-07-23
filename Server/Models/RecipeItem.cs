namespace Server.Models
{
    // Đây là bảng trung gian cho quan hệ nhiều-nhiều
    public class RecipeItem
    {
        public int Id { get; set; }
        public float Quantity { get; set; }

        // Khóa ngoại tới Product
        public int ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        // Khóa ngoại tới Ingredient
        public int IngredientId { get; set; }
        public virtual Ingredient Ingredient { get; set; } = null!;
    }
}