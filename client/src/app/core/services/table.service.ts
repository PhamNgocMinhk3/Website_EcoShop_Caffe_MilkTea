import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Table,
  REVERSE_TABLE_STATUS_MAP,
  TableStatus,
} from '../models/table.model';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5004/api/Tables';

  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.API_BASE_URL);
  }

  createTable(name: string): Observable<Table> {
    return this.http.post<Table>(this.API_BASE_URL, { name });
  }

  updateTable(id: number, name: string): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/${id}`, { name });
  }

  updateTableStatus(id: number, status: TableStatus): Observable<void> {
    const statusNumber = REVERSE_TABLE_STATUS_MAP[status];
    return this.http.put<void>(`${this.API_BASE_URL}/${id}/status`, {
      status: statusNumber,
    });
  }

  deleteTable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/${id}`);
  }
}
