import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OverviewStats,
  RevenueDataPoint,
  ProductStat,
  ToppingStat,
  EmployeeRevenue,
  EmployeeAttendance,
  InventoryStats,
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/Statistics';

  getOverviewStats(
    startDate?: string,
    endDate?: string
  ): Observable<OverviewStats> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<OverviewStats>(`${this.API_BASE_URL}/overview`, {
      params,
    });
  }

  getRevenueOverTime(
    startDate?: string,
    endDate?: string
  ): Observable<RevenueDataPoint[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<RevenueDataPoint[]>(
      `${this.API_BASE_URL}/revenue-over-time`,
      { params }
    );
  }

  getProductStats(): Observable<{
    topByRevenue: ProductStat[];
    topByQuantity: ProductStat[];
    leastPopular: ProductStat[];
  }> {
    return this.http.get<{
      topByRevenue: ProductStat[];
      topByQuantity: ProductStat[];
      leastPopular: ProductStat[];
    }>(`${this.API_BASE_URL}/products`);
  }

  getTopToppings(): Observable<ToppingStat[]> {
    return this.http.get<ToppingStat[]>(`${this.API_BASE_URL}/top-toppings`);
  }

  getTopEmployees(
    startDate?: string,
    endDate?: string
  ): Observable<EmployeeRevenue[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<EmployeeRevenue[]>(
      `${this.API_BASE_URL}/top-employees`,
      { params }
    );
  }

  getEmployeeAttendance(
    month?: number,
    year?: number
  ): Observable<EmployeeAttendance[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get<EmployeeAttendance[]>(
      `${this.API_BASE_URL}/employee-attendance`,
      { params }
    );
  }

  getInventoryStats(): Observable<InventoryStats> {
    return this.http.get<InventoryStats>(`${this.API_BASE_URL}/inventory`);
  }
}
