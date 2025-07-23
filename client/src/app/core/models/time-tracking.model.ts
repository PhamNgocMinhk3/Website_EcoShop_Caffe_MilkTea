export interface ShiftStatusDto {
  coCaLamViec: boolean;
  hoTen?: string;
  thoiGianCaLamViec?: string;
  trangThaiChamCong?: 'Chưa chấm công' | 'Đã vào ca' | 'Đã kết thúc ca';
  thongBao?: string;
  thoiGianVao?: Date;
}

export interface TimeTrackingRequestDto {
  maNV: number;
}
