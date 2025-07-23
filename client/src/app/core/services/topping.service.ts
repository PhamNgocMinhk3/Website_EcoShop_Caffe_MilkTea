import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topping } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ToppingService {
  private baseUrl = 'http://localhost:5004/api';
  private http = inject(HttpClient);

  getToppings(): Observable<Topping[]> {
    return this.http.get<Topping[]>(`${this.baseUrl}/Toppings`);
  }
}
