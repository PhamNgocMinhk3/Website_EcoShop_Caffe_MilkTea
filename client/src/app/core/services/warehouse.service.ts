import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WarehouseIngredient,
  IngredientPayload,
} from '../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/ingredients';

  // Lấy trạng thái kho
  getWarehouseStatus(): Observable<WarehouseIngredient[]> {
    return this.http.get<WarehouseIngredient[]>(
      `${this.API_BASE_URL}/warehouse`
    );
  }

  // Tạo nguyên liệu mới
  createIngredient(
    payload: IngredientPayload
  ): Observable<WarehouseIngredient> {
    return this.http.post<WarehouseIngredient>(this.API_BASE_URL, payload);
  }

  // Cập nhật nguyên liệu
  updateIngredient(id: number, payload: IngredientPayload): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/${id}`, payload);
  }

  // Xuất file Excel
  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/export`, {
      responseType: 'blob',
    });
  }

  // Import từ file Excel
  importFromExcel(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ message: string }>(
      `${this.API_BASE_URL}/import`,
      formData
    );
  }
}
