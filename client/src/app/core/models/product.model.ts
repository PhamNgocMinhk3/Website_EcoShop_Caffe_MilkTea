// Định nghĩa cấu trúc cho Topping
export interface Topping {
  id: number;
  name: string;
  price: number;
}

// Model Product nhất quán được sử dụng trong toàn bộ ứng dụng
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  purchaseCount?: number; // Thêm cho trang quản trị
  toppings?: Topping[];
  recipeItems?: RecipeItem[]; // Thêm cho trang quản trị
}

// Cấu trúc sản phẩm thô từ API
export interface ApiProduct {
  id: number;
  name: string;
  note: string;
  price: number;
  img: string;
  purchaseCount: number;
  recipeItems?: RecipeItem[];
}

// Cấu trúc phân trang thô từ API
export interface RawPaginatedResponse {
  data: ApiProduct[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// Cấu trúc phân trang nhất quán được sử dụng trong ứng dụng
export interface PaginatedProducts {
  items: Product[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Model cho giỏ hàng
export interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  quantity: number;
  size: 'S' | 'M' | 'L';
  basePrice: number;
  selectedToppings: Topping[];
  finalPrice: number;
  uniqueId: string;
}

// --- CÁC MODEL MỚI (Bổ sung cho trang quản trị) ---

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
