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
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Table } from '../../../../core/models/table.model';
import { TableService } from '../../../../core/services/table.service';

@Component({
  selector: 'app-table-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './table-form.component.html',
  styleUrls: ['./table-form.component.css'],
})
export class TableFormComponent implements OnInit, OnChanges {
  @Input() tableToEdit: Table | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCanceled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private tableService = inject(TableService);

  tableForm = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableToEdit']) {
      this.updateForm();
    }
  }

  updateForm(): void {
    if (this.tableToEdit) {
      this.tableForm.patchValue({ name: this.tableToEdit.name });
    } else {
      this.tableForm.reset();
    }
  }

  onSubmit(): void {
    if (this.tableForm.invalid) return;

    const name = this.tableForm.value.name!;

    const handleResponse = {
      next: () => this.formSaved.emit(true),
      error: (err: any) => {
        console.error('Lỗi khi lưu bàn', err);
        this.formSaved.emit(false);
      },
    };

    if (this.tableToEdit) {
      this.tableService
        .updateTable(this.tableToEdit.id, name)
        .subscribe(handleResponse);
    } else {
      this.tableService.createTable(name).subscribe(handleResponse);
    }
  }
}
