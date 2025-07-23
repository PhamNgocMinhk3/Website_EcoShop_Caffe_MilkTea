import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  EmployeeViewModel,
  NhanVien,
} from '../../../../core/models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
})
export class EmployeeFormComponent implements OnInit, OnChanges {
  @Input() employeeVm: EmployeeViewModel | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCanceled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private datePipe = inject(DatePipe);

  employeeForm!: FormGroup;
  isEditMode = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeVm'] && this.employeeForm) {
      this.isEditMode = !!this.employeeVm?.details;
      if (this.employeeVm?.details) {
        this.patchForm();
      } else {
        // Reset về giá trị mặc định khi thêm mới
        this.employeeForm.reset({
          gioiTinh: 'Nam',
          loaiNhanVien: 0,
        });
      }
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      hoTen: ['', Validators.required],
      ngaySinh: ['', Validators.required],
      gioiTinh: ['Nam', Validators.required],
      diaChi: ['', Validators.required],
      soDienThoai: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)],
      ],
      cccd: ['', [Validators.required, Validators.pattern(/^[0-9]{9,12}$/)]],
      loaiNhanVien: [0, Validators.required],
    });
  }

  patchForm(): void {
    const details = this.employeeVm?.details;
    if (!details) return;

    let loaiNhanVienAsNumber = 0; // Mặc định là 'Bán thời gian'
    if (typeof details.loaiNhanVien === 'string') {
      if (details.loaiNhanVien.toLowerCase() === 'fulltime') {
        loaiNhanVienAsNumber = 1;
      }
    } else {
      loaiNhanVienAsNumber = details.loaiNhanVien;
    }

    this.employeeForm.patchValue({
      ...details,
      ngaySinh: this.datePipe.transform(details.ngaySinh, 'yyyy-MM-dd'),
      loaiNhanVien: loaiNhanVienAsNumber,
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    if (!this.employeeVm) return;

    const formData = {
      ...this.employeeForm.value,
      email: this.employeeVm.email,
    } as Partial<NhanVien>;

    const handleResponse = {
      next: () => this.formSaved.emit(true),
      error: (err: any) => {
        console.error('Lỗi khi lưu thông tin nhân viên', err);
        alert('Lưu thông tin thất bại. Vui lòng kiểm tra lại dữ liệu.');
        this.formSaved.emit(false);
      },
    };

    if (this.isEditMode) {
      this.employeeService
        .updateNhanVien(this.employeeVm.userId, formData)
        .subscribe(handleResponse);
    } else {
      this.employeeService
        .createNhanVien(this.employeeVm.userId, formData)
        .subscribe(handleResponse);
    }
  }

  cancel(): void {
    this.formCanceled.emit();
  }
}
