// Enum cho trạng thái đơn hàng (đã có và chính xác)
export enum OrderStatus {
  Pending = 0, // Chờ xác nhận
  Confirmed = 1, // Đã xác nhận
  Completed = 2, // Hoàn thành
  Cancelled = 3, // Đã hủy
}

// Model cho một sản phẩm trong đơn hàng chi tiết
export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  toppings: string[];
}

// Model cho một đơn hàng đầy đủ chi tiết mà admin thấy
export interface Order {
  id: number;
  tableName: string;
  voucherCode: string | null;
  totalAmount: number;
  finalAmount: number;
  status: number;
  paymentMethod: string;
  numberOfGuests: number;
  bookingTime: string;
  checkIn: boolean;
  createdAt: string;
  paidAt: string | null;
  approvedBy: string;
  items: OrderItem[];
}

export interface CreateOrderDto {
  tableId: number;
  voucherId?: number | null;
  paymentMethod: number;
  numberOfGuests: number;
  bookingTime: string;
  items: {
    productId: number;
    quantity: number;
    toppingIds: number[];
  }[];
}

export interface PaginatedOrders {
  items: Order[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface Voucher {
  id: number;
  code: string;
  discountAmount: number;
}
