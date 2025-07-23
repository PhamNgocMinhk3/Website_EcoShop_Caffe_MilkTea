import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Voucher } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private baseUrl = 'http://localhost:5004/api';
  private http = inject(HttpClient);

  applyVoucher(code: string): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(`${this.baseUrl}/Vouchers?code=${code}`);
  }
}
