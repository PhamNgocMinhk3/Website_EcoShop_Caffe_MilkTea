using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Server.DTOs;
using Server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface ILuongService
{
    Task<List<BangLuongNhanVienDto>> GetPayrollDataAsync(int month, int year);
    Task<byte[]> ExportPayrollToExcelAsync(int month, int year);
}

public class LuongService : ILuongService
{
    private readonly AppDbContext _context;

    public LuongService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BangLuongNhanVienDto>> GetPayrollDataAsync(int month, int year)
    {
        var nhanViens = await _context.NhanViens.ToListAsync();
        var result = new List<BangLuongNhanVienDto>();

        var firstDayOfMonth = new DateTime(year, month, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        foreach (var nv in nhanViens)
        {
            var phanCongsTrongThang = await _context.PhanCongs
                .Where(p => p.MaNV == nv.MaNV && p.NgayLamViec >= firstDayOfMonth && p.NgayLamViec <= lastDayOfMonth)
                .ToListAsync();

            var phanCongIds = phanCongsTrongThang.Select(p => p.Id).ToList();

            var chamCongsTrongThang = await _context.ChamCongs
                .Where(c => phanCongIds.Contains(c.PhanCongId))
                .ToListAsync();

            double tongGioLam = 0;
            int soLanQuenCheckout = 0;
            
            foreach (var cc in chamCongsTrongThang)
            {
                if (cc.ThoiGianRa.HasValue)
                {
                    tongGioLam += (cc.ThoiGianRa.Value - cc.ThoiGianVao).TotalHours;
                }
                else
                {
                    // Xử lý quên check-out: cộng 1 giờ làm và ghi chú
                    tongGioLam += 1; 
                    soLanQuenCheckout++;
                }
            }

            var soLanDiTre = chamCongsTrongThang.Count(c => c.TrangThai == "Đi trễ");
            
            // Giả định: 0 = FullTime, 1 = PartTime.
            var loaiNvString = nv.LoaiNhanVien == 0 ? "Full-time" : "Part-time";
            var luongCoBan = nv.LoaiNhanVien == 0 ? 100000m : 40000m;

            var tongLuong = (decimal)tongGioLam * luongCoBan;
            var tienPhat = 0m;

            if (soLanDiTre > 4)
            {
                tienPhat = tongLuong * 0.1m; // Trừ 10% lương
            }

            var luongThucLanh = tongLuong - tienPhat;

            var ghiChu = soLanQuenCheckout > 0 ? $"Quên check-out {soLanQuenCheckout} lần." : "";

            result.Add(new BangLuongNhanVienDto
            {
                MaNV = nv.MaNV,
                HoTen = nv.HoTen,
                Email = nv.Email,
                SoDienThoai = nv.SoDienThoai,
                CCCD = nv.CCCD,
                LoaiNhanVien = loaiNvString,
                SoCaPhanCong = phanCongsTrongThang.Count,
                SoCaDiLam = chamCongsTrongThang.Count,
                SoLanDiTre = soLanDiTre,
                TongGioLam = Math.Round(tongGioLam, 2),
                LuongCoBanTheoGio = luongCoBan,
                TongLuongTruocPhat = tongLuong,
                TienPhat = tienPhat,
                LuongThucLanh = luongThucLanh,
                GhiChu = ghiChu
            });
        }
        return result;
    }

    public async Task<byte[]> ExportPayrollToExcelAsync(int month, int year)
    {
        var payrollData = await GetPayrollDataAsync(month, year);
        
        // --- FIX BUG 1: Xóa dòng LicenseContext ---
        // ExcelPackage.LicenseContext = LicenseContext.NonCommercial; 
        
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add($"LuongThang{month}-{year}");

        // Ghi header
        var headers = new string[] {
            "Mã NV", "Họ Tên", "Email", "SĐT", "CCCD", "Loại NV", 
            "Số Ca Phân Công", "Số Ca Đi Làm", "Số Lần Đi Trễ", "Tổng Giờ Làm",
            "Lương/giờ", "Tổng Lương", "Tiền Phạt", "Thực Lãnh", "Ghi Chú"
        };
        for (int i = 0; i < headers.Length; i++)
        {
            worksheet.Cells[1, i + 1].Value = headers[i];
        }

        // Ghi data
        for (int i = 0; i < payrollData.Count; i++)
        {
            var data = payrollData[i];
            int row = i + 2;
            worksheet.Cells[row, 1].Value = data.MaNV;
            worksheet.Cells[row, 2].Value = data.HoTen;
            worksheet.Cells[row, 3].Value = data.Email;
            worksheet.Cells[row, 4].Value = data.SoDienThoai;
            worksheet.Cells[row, 5].Value = data.CCCD;
            worksheet.Cells[row, 6].Value = data.LoaiNhanVien;
            worksheet.Cells[row, 7].Value = data.SoCaPhanCong;
            worksheet.Cells[row, 8].Value = data.SoCaDiLam;
            worksheet.Cells[row, 9].Value = data.SoLanDiTre;
            worksheet.Cells[row, 10].Value = data.TongGioLam;
            worksheet.Cells[row, 11].Value = data.LuongCoBanTheoGio;
            worksheet.Cells[row, 12].Value = data.TongLuongTruocPhat;
            worksheet.Cells[row, 13].Value = data.TienPhat;
            worksheet.Cells[row, 14].Value = data.LuongThucLanh;
            worksheet.Cells[row, 15].Value = data.GhiChu;
        }

        worksheet.Cells.AutoFitColumns();

        // --- FIX BUG 2: Sửa tên phương thức ---
        return package.GetAsByteArray();
    }
}
