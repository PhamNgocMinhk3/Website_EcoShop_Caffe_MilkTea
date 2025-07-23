import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService } from '../../../../core/services/warehouse.service';

@Component({
  selector: 'app-ingredient-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredient-import.component.html',
  styleUrls: ['../../components/employee-import/employee-import.component.css'], // Tái sử dụng CSS
})
export class IngredientImportComponent {
  @Output() importSuccess = new EventEmitter<void>();
  @Output() importCanceled = new EventEmitter<void>();

  private warehouseService = inject(WarehouseService);
  selectedFile: File | null = null;
  isLoading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImport(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.warehouseService.importFromExcel(this.selectedFile).subscribe({
      next: (response) => {
        alert(response.message);
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
