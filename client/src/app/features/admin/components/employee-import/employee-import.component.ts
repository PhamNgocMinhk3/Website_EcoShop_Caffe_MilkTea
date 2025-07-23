import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeViewModel } from '../../../../core/models/employee.model';

@Component({
  selector: 'app-employee-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-import.component.html',
  styleUrls: ['./employee-import.component.css'],
})
export class EmployeeImportComponent {
  @Input() employeeVm: EmployeeViewModel | null = null;
  @Output() importSuccess = new EventEmitter<void>();
  @Output() importCanceled = new EventEmitter<void>();

  private employeeService = inject(EmployeeService);
  selectedFile: File | null = null;
  isLoading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImport(): void {
    if (!this.selectedFile) {
      alert('Vui lòng chọn một file Excel.');
      return;
    }
    if (!this.employeeVm) {
      alert('Lỗi: Không xác định được nhân viên cần import.');
      return;
    }

    this.isLoading = true;
    this.employeeService
      .importProfileForUser(this.employeeVm.userId, this.selectedFile)
      .subscribe({
        next: () => {
          alert('Import thành công!');
          this.isLoading = false;
          this.importSuccess.emit();
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi import file.');
          console.error(err);
          this.isLoading = false;
        },
      });
  }
}
