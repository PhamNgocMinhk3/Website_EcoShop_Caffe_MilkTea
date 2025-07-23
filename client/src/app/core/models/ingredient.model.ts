// Định nghĩa cấu trúc cho một nguyên liệu
export interface Ingredient {
  id: number;
  name: string;
}

// Định nghĩa cấu trúc cho một item trong công thức
export interface RecipeItem {
  ingredientId: number;
  ingredientName?: string;
  quantity: number;
  unit: string;
}
export type IngredientStatus = 'Không Cần Nhập' | 'Chuẩn Bị Nhập' | 'Cần Nhập';
export interface WarehouseIngredient {
  id: number;
  name: string;
  unit: string;
  costPrice: number;
  quantityInStock: number;
  totalUsed: number;
  status: IngredientStatus;
}

// Model dùng cho việc Tạo/Cập nhật một nguyên liệu
export interface IngredientPayload {
  name: string;
  unit: string;
  costPrice: number;
  quantityInStock: number;
}
