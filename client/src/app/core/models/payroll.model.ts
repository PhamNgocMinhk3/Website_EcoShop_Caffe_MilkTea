export interface PayrollRecord {
  maNV: number;
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  cccd: string | null;
  loaiNhanVien: 'Full-time' | 'Part-time';
  soCaPhanCong: number;
  soCaDiLam: number;
  soLanDiTre: number;
  tongGioLam: number;
  luongCoBanTheoGio: number;
  tongLuongTruocPhat: number;
  tienPhat: number;
  luongThucLanh: number;
  ghiChu: string;
}
