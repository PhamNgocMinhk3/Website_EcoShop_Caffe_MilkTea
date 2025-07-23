import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subject,
  switchMap,
  startWith,
  catchError,
  of,
} from 'rxjs';

import { Table, TableStatus } from '../../../../core/models/table.model';
import { TableService } from '../../../../core/services/table.service';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { TableCardComponent } from '../../components/table-card/table-card.component';
import { TableFormComponent } from '../../components/table-form/table-form.component';

@Component({
  selector: 'app-table-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    TableCardComponent,
    TableFormComponent,
  ],
  templateUrl: './table-management-page.component.html',
  styleUrls: ['./table-management-page.component.css'],
})
export class TableManagementPageComponent implements OnInit {
  private tableService = inject(TableService);

  tables$!: Observable<Table[]>;
  private refresh$ = new Subject<void>();

  isFormModalOpen = false;
  isDeleteModalOpen = false;
  tableToEdit: Table | null = null;
  tableToDelete: Table | null = null;

  ngOnInit(): void {
    this.tables$ = this.refresh$.pipe(
      startWith(null),
      switchMap(() =>
        this.tableService.getTables().pipe(catchError(() => of([])))
      )
    );
  }

  openAddTableModal(): void {
    this.tableToEdit = null;
    this.isFormModalOpen = true;
  }

  openEditTableModal(table: Table): void {
    this.tableToEdit = table;
    this.isFormModalOpen = true;
  }

  openDeleteConfirmModal(table: Table): void {
    this.tableToDelete = table;
    this.isDeleteModalOpen = true;
  }

  handleFormSave(isSuccess: boolean): void {
    this.isFormModalOpen = false;
    if (isSuccess) {
      this.refresh$.next();
    }
  }

  handleDeleteConfirm(): void {
    if (this.tableToDelete) {
      this.tableService.deleteTable(this.tableToDelete.id).subscribe({
        next: () => this.refresh$.next(),
        error: (err) => console.error('Lỗi khi xóa bàn', err),
        complete: () => {
          this.isDeleteModalOpen = false;
          this.tableToDelete = null;
        },
      });
    }
  }

  handleStatusChange({
    id,
    status,
  }: {
    id: number;
    status: TableStatus;
  }): void {
    this.tableService.updateTableStatus(id, status).subscribe({
      next: () => this.refresh$.next(),
      error: (err) => {
        console.error('Lỗi khi cập nhật trạng thái', err);
        this.refresh$.next();
      },
    });
  }
}
