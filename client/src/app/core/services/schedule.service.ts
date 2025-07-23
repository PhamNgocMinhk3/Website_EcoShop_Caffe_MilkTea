import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ScheduleEmployee,
  WorkAssignment,
  CreateAssignmentDto,
  DeleteAssignmentDto,
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/PhanCong';

  getEmployees(): Observable<ScheduleEmployee[]> {
    return this.http.get<ScheduleEmployee[]>(`${this.API_BASE_URL}/nhanvien`);
  }

  getScheduleForWeek(startDate: string): Observable<any> {
    const params = new HttpParams().set('ngayTrongTuan', startDate);
    return this.http.get<any>(`${this.API_BASE_URL}/LichLamViec`, { params });
  }

  createAssignments(payload: CreateAssignmentDto): Observable<any> {
    return this.http.post(this.API_BASE_URL, payload);
  }

  deleteAssignment(payload: DeleteAssignmentDto): Observable<any> {
    return this.http.request('delete', `${this.API_BASE_URL}/xoa`, {
      body: payload,
    });
  }
}
