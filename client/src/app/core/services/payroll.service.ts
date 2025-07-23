import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayrollRecord } from '../models/payroll.model';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/Luong';

  getPayroll(month: number, year: number): Observable<PayrollRecord[]> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<PayrollRecord[]>(this.API_BASE_URL, { params });
  }

  exportPayroll(month: number, year: number): Observable<Blob> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get(`${this.API_BASE_URL}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
