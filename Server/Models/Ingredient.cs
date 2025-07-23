using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Ingredient
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal CostPrice { get; set; }

        [Column("Qualyti")]
        public decimal QuantityInStock { get; set; }

        public virtual ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
    }
}