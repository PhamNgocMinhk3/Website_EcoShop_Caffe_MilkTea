import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeViewModel, NhanVien } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly NHANVIEN_API_URL = 'http://localhost:5004/api/NhanVien';

  getEmployees(): Observable<EmployeeViewModel[]> {
    return this.http.get<EmployeeViewModel[]>(this.NHANVIEN_API_URL);
  }

  getNhanVienById(userId: number): Observable<NhanVien> {
    return this.http.get<NhanVien>(`${this.NHANVIEN_API_URL}/${userId}`);
  }

  createNhanVien(
    userId: number,
    data: Partial<NhanVien>
  ): Observable<NhanVien> {
    return this.http.post<NhanVien>(`${this.NHANVIEN_API_URL}/${userId}`, data);
  }

  updateNhanVien(userId: number, data: Partial<NhanVien>): Observable<void> {
    return this.http.put<void>(`${this.NHANVIEN_API_URL}/${userId}`, data);
  }

  deleteNhanVien(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.NHANVIEN_API_URL}/${userId}`);
  }

  importProfileForUser(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(
      `${this.NHANVIEN_API_URL}/${userId}/import-profile`,
      formData
    );
  }
}
