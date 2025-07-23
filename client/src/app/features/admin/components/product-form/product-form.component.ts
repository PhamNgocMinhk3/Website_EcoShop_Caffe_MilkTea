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
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { Observable } from 'rxjs';

import {
  Product,
  Ingredient,
  RecipeItem,
} from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() productToEdit: Product | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCanceled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  productForm!: FormGroup;
  ingredients$!: Observable<Ingredient[]>;
  imagePreview: string | ArrayBuffer | null =
    'https://placehold.co/400x300/e2e8f0/a0aec0?text=Ch%E1%BB%8Dn+%E1%BA%A3nh';
  selectedFile: File | null = null;

  get recipeItems(): FormArray {
    return this.productForm.get('recipeItems') as FormArray;
  }

  ngOnInit(): void {
    this.ingredients$ = this.productService.getIngredients();
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Chỉ khởi tạo lại form nếu có dữ liệu mới và form đã được tạo
    if (changes['productToEdit'] && this.productForm) {
      this.initForm();
      if (this.productToEdit) {
        this.patchForm();
      }
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      note: [''],
      recipeItems: this.fb.array([]),
    });
  }

  patchForm(): void {
    if (!this.productToEdit) return;

    this.productForm.patchValue({
      id: this.productToEdit.id,
      name: this.productToEdit.name,
      price: this.productToEdit.price,
      note: this.productToEdit.description,
    });

    this.imagePreview = this.productToEdit.imageUrl;
    this.selectedFile = null; // Reset file selection

    // Patch recipe items
    this.recipeItems.clear();
    this.productToEdit.recipeItems?.forEach((item) => {
      this.recipeItems.push(this.createRecipeItem(item));
    });
  }

  createRecipeItem(item: RecipeItem | null = null): FormGroup {
    return this.fb.group({
      ingredientId: [item?.ingredientId || '', Validators.required],
      quantity: [
        item?.quantity || '',
        [Validators.required, Validators.min(0.01)],
      ],
      unit: [item?.unit || '', Validators.required],
    });
  }

  addRecipeItem(): void {
    this.recipeItems.push(this.createRecipeItem());
  }

  removeRecipeItem(index: number): void {
    this.recipeItems.removeAt(index);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formData = this.buildFormData();
    const id = this.productForm.value.id;

    // SỬA LỖI: Tách riêng logic subscribe để tránh lỗi union type
    const handleResponse = {
      next: () => {
        this.formSaved.emit(true);
      },
      error: (err: any) => {
        // Thêm kiểu 'any' cho err để tránh lỗi implicit any
        console.error('Lỗi khi lưu sản phẩm', err);
        this.formSaved.emit(false);
      },
    };

    if (id) {
      this.productService.updateProduct(id, formData).subscribe(handleResponse);
    } else {
      this.productService.createProduct(formData).subscribe(handleResponse);
    }
  }

  private buildFormData(): FormData {
    const formValue = this.productForm.getRawValue();
    const formData = new FormData();

    formData.append('Name', formValue.name);
    formData.append('Price', formValue.price);
    formData.append('Note', formValue.note);

    if (this.selectedFile) {
      formData.append('ImageFile', this.selectedFile);
    }

    formValue.recipeItems.forEach((item: any, index: number) => {
      formData.append(`RecipeItems[${index}].IngredientId`, item.ingredientId);
      formData.append(`RecipeItems[${index}].Quantity`, item.quantity);
      formData.append(`RecipeItems[${index}].Unit`, item.unit);
    });

    return formData;
  }

  cancel(): void {
    this.formCanceled.emit();
  }
}
