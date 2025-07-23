import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ShiftStatusDto,
  TimeTrackingRequestDto,
} from '../models/time-tracking.model';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/ChamCong';

  getStatus(employeeId: number): Observable<ShiftStatusDto> {
    return this.http.get<ShiftStatusDto>(
      `${this.API_BASE_URL}/status/${employeeId}`
    );
  }

  checkIn(payload: TimeTrackingRequestDto): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/check-in`, payload);
  }

  checkOut(payload: TimeTrackingRequestDto): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/check-out`, payload);
  }
}
