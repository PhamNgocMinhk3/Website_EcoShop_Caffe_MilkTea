import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateOrderDto,
  PaginatedOrders,
  OrderStatus,
  Order,
} from '../models/order.model';
import { CartItem } from '../models/product.model';
import { TokenService } from './token.service';
import { HttpParams } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:5004/api';
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  private createAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getOrders(): Observable<Order[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<Order[]>(`${this.baseUrl}/Orders`, {
      headers,
      withCredentials: true,
    });
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.put(
      `${this.baseUrl}/Orders/${id}/status`,
      { status },
      { headers, withCredentials: true }
    );
  }

  updateCheckInStatus(id: number): Observable<any> {
    const headers = this.createAuthHeaders();
    const url = `${this.baseUrl}/Orders/${id}/check-in`;
    return this.http.put(url, {}, { headers, withCredentials: true });
  }

  checkAvailability(tableId: number, bookingTime: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.post(
      `${this.baseUrl}/Orders/check-availability`,
      {
        tableId,
        bookingTime,
      },
      { headers, withCredentials: true }
    );
  }

  createOrder(orderData: CreateOrderDto): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.post(`${this.baseUrl}/Orders`, orderData, {
      headers,
      withCredentials: true,
    });
  }

  saveCartToSession(cartItems: CartItem[]): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.post(`${this.baseUrl}/Orders/session-cart`, cartItems, {
      headers,
      withCredentials: true,
    });
  }

  getCartFromSession(): Observable<CartItem[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<CartItem[]>(`${this.baseUrl}/Orders/session-cart`, {
      headers,
      withCredentials: true,
    });
  }

  createVnpayPaymentUrl(payload: {
    amount: number;
    orderInfo: string;
  }): Observable<{ paymentUrl: string }> {
    const headers = this.createAuthHeaders();
    return this.http.post<{ paymentUrl: string }>(
      `${this.baseUrl}/Payments/vnpay`,
      payload,
      { headers, withCredentials: true }
    );
  }
  confirmVnpayPayment(params: HttpParams): Observable<any> {
    const headers = this.createAuthHeaders();
    // Endpoint mới trên backend mà chúng ta sẽ tạo ở bước sau
    return this.http.post(`${this.baseUrl}/Orders/vnpay-return`, params, {
      headers,
      withCredentials: true,
    });
  }
}
