import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  Observable,
  Subject,
  switchMap,
  startWith,
  catchError,
  of,
} from 'rxjs';
import { saveAs } from 'file-saver';

import {
  WarehouseIngredient,
  IngredientStatus,
} from '../../../../core/models/ingredient.model';
import { WarehouseService } from '../../../../core/services/warehouse.service';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { IngredientFormComponent } from '../../components/ingredient-form/ingredient-form.component';
import { IngredientImportComponent } from '../../components/ingredient-import/ingredient-import.component';
// SỬA LỖI: Import component phân trang
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-warehouse-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    IngredientFormComponent,
    IngredientImportComponent,
    PaginationComponent,
    DecimalPipe,
  ],
  templateUrl: './warehouse-management-page.component.html',
  styleUrls: ['./warehouse-management-page.component.css'],
})
export class WarehouseManagementPageComponent implements OnInit {
  private warehouseService = inject(WarehouseService);

  private allIngredients: WarehouseIngredient[] = [];
  public pagedIngredients: WarehouseIngredient[] = [];
  public isLoading = true;

  public currentPage = 1;
  public pageSize = 10;
  public totalCount = 0;
  public totalPages = 1;

  private refresh$ = new Subject<void>();

  isFormModalOpen = false;
  isImportModalOpen = false;
  ingredientToEdit: WarehouseIngredient | null = null;

  ngOnInit(): void {
    this.refresh$
      .pipe(
        startWith(null),
        switchMap(() => {
          this.isLoading = true;
          return this.warehouseService
            .getWarehouseStatus()
            .pipe(catchError(() => of([])));
        })
      )
      .subscribe((ingredients) => {
        this.allIngredients = ingredients;
        this.totalCount = this.allIngredients.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.setPage(1);
        this.isLoading = false;
      });
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalCount);
    this.pagedIngredients = this.allIngredients.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.setPage(page);
  }

  getStatusClass(status: IngredientStatus): string {
    switch (status) {
      case 'Cần Nhập':
        return 'status-danger';
      case 'Chuẩn Bị Nhập':
        return 'status-warning';
      case 'Không Cần Nhập':
        return 'status-ok';
      default:
        return '';
    }
  }

  refreshData(): void {
    this.refresh$.next();
  }

  openAddModal(): void {
    this.ingredientToEdit = null;
    this.isFormModalOpen = true;
  }

  openEditModal(ingredient: WarehouseIngredient): void {
    this.ingredientToEdit = ingredient;
    this.isFormModalOpen = true;
  }

  openImportModal(): void {
    this.isImportModalOpen = true;
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

  exportData(): void {
    this.warehouseService.exportToExcel().subscribe((blob) => {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      saveAs(blob, `DanhSachTonKho_${timestamp}.xlsx`);
    });
  }
}
