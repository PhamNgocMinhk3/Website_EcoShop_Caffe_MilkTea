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

import { EmployeeViewModel } from '../../../../core/models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeImportComponent } from '../../components/employee-import/employee-import.component';

@Component({
  selector: 'app-employee-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    EmployeeFormComponent,
    EmployeeImportComponent,
  ],
  templateUrl: './employee-management-page.component.html',
  styleUrls: ['./employee-management-page.component.css'],
})
export class EmployeeManagementPageComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  employees$!: Observable<EmployeeViewModel[]>;
  private refresh$ = new Subject<void>();

  isFormModalOpen = false;
  isImportModalOpen = false;
  isDeleteModalOpen = false;

  selectedEmployee: EmployeeViewModel | null = null;
  employeeToDelete: EmployeeViewModel | null = null;

  ngOnInit(): void {
    this.employees$ = this.refresh$.pipe(
      startWith(null),
      switchMap(() =>
        this.employeeService.getEmployees().pipe(
          catchError((err) => {
            console.error('Lỗi khi tải danh sách nhân viên:', err);
            return of([]);
          })
        )
      )
    );
  }

  refreshData(): void {
    this.refresh$.next();
  }

  // SỬA LỖI: Cập nhật logic mở form
  openFormModal(employee: EmployeeViewModel): void {
    // Nếu nhân viên đã có thông tin, gọi API để lấy dữ liệu chi tiết nhất
    if (employee.status === 'Đã có thông tin') {
      this.employeeService.getNhanVienById(employee.userId).subscribe({
        next: (details) => {
          // Tạo một ViewModel mới với đầy đủ chi tiết để truyền vào form
          this.selectedEmployee = {
            ...employee,
            details: details,
          };
          this.isFormModalOpen = true;
        },
        error: (err) => {
          console.error(
            `Không thể lấy chi tiết cho userId: ${employee.userId}`,
            err
          );
          // Vẫn mở form với thông tin cơ bản nếu API lỗi
          this.selectedEmployee = employee;
          this.isFormModalOpen = true;
        },
      });
    } else {
      // Nếu là thêm mới, chỉ cần truyền thông tin cơ bản
      this.selectedEmployee = employee;
      this.isFormModalOpen = true;
    }
  }

  openImportModal(employee: EmployeeViewModel): void {
    this.selectedEmployee = employee;
    this.isImportModalOpen = true;
  }

  openDeleteConfirmModal(employee: EmployeeViewModel): void {
    this.employeeToDelete = employee;
    this.isDeleteModalOpen = true;
  }

  handleFormSave(isSuccess: boolean): void {
    this.isFormModalOpen = false;
    if (isSuccess) {
      this.refreshData();
    }
  }

  handleImportSuccess(): void {
    this.isImportModalOpen = false;
    this.refreshData();
  }

  handleDeleteConfirm(): void {
    if (this.employeeToDelete) {
      this.employeeService
        .deleteNhanVien(this.employeeToDelete.userId)
        .subscribe({
          next: () => this.refreshData(),
          error: (err) => console.error('Lỗi khi xóa nhân viên', err),
          complete: () => {
            this.isDeleteModalOpen = false;
            this.employeeToDelete = null;
          },
        });
    }
  }
}
