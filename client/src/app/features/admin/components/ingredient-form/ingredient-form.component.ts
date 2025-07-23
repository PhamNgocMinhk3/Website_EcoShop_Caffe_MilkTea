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
import {
  WarehouseIngredient,
  IngredientPayload,
} from '../../../../core/models/ingredient.model';
import { WarehouseService } from '../../../../core/services/warehouse.service';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.css'],
})
export class IngredientFormComponent implements OnInit, OnChanges {
  @Input() ingredientToEdit: WarehouseIngredient | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCanceled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private warehouseService = inject(WarehouseService);

  ingredientForm = this.fb.group({
    name: ['', Validators.required],
    unit: ['', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    quantityInStock: [0, [Validators.required, Validators.min(0)]],
  });

  isEditMode = false;

  ngOnInit(): void {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ingredientToEdit']) {
      this.updateForm();
    }
  }

  updateForm(): void {
    this.isEditMode = !!this.ingredientToEdit;
    if (this.isEditMode) {
      this.ingredientForm.patchValue(this.ingredientToEdit!);
    } else {
      this.ingredientForm.reset();
    }
  }

  onSubmit(): void {
    if (this.ingredientForm.invalid) return;

    const payload = this.ingredientForm.value as IngredientPayload;

    // SỬA LỖI: Tách riêng logic subscribe để TypeScript không bị nhầm lẫn
    const handleResponse = {
      next: () => this.formSaved.emit(true),
      error: (err: any) => {
        // Thêm kiểu 'any' cho err
        console.error('Lỗi khi lưu nguyên liệu', err);
        this.formSaved.emit(false);
      },
    };

    if (this.isEditMode) {
      this.warehouseService
        .updateIngredient(this.ingredientToEdit!.id, payload)
        .subscribe(handleResponse);
    } else {
      this.warehouseService.createIngredient(payload).subscribe(handleResponse);
    }
  }
}
