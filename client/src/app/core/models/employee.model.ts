export interface AppUser {
  id: number;
  userName: string;
  email: string;
}

export interface NhanVien {
  maNV: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
  soDienThoai: string;
  cccd: string;
  loaiNhanVien: string | number;
  email: string;
}

// Model để hiển thị trong bảng danh sách
export interface EmployeeViewModel {
  userId: number;
  email: string;
  hoTen: string | null;
  status: 'Đã có thông tin' | 'Chưa có thông tin';
  details?: NhanVien | null;
}
