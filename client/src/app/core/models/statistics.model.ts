// DTO cho các chỉ số tổng quan (Trang Dashboard)
export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalGrossProfit: number;
}

// DTO cho Biểu đồ Doanh Thu Theo Thời Gian (Chức năng 5)
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  profit: number;
}

// DTO cho Thống kê Sản phẩm (Chức năng 6, 7, 9)
export interface ProductStat {
  productId: number;
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
}

// DTO cho Thống kê Topping (Chức năng 8)
export interface ToppingStat {
  toppingId: number;
  toppingName: string;
  usageCount: number;
}

// DTO cho Bảng Xếp Hạng Nhân Viên (Chức năng 11)
export interface EmployeeRevenue {
  maNV: number;
  hoTen: string;
  totalRevenue: number;
  totalOrders: number;
}

// DTO cho Thống kê Chuyên cần (Chức năng 12)
export interface EmployeeAttendance {
  maNV: number;
  hoTen: string;
  totalHoursWorked: number;
  lateCount: number;
  forgotCheckoutCount: number;
}

// DTO cho Thống kê Kho (Chức năng 13, 14)
export interface InventoryStats {
  totalInventoryValue: number;
  lowStockItems: LowStockIngredient[];
}

export interface LowStockIngredient {
  ingredientId: number;
  name: string;
  currentStock: number;
  unit: string;
}
