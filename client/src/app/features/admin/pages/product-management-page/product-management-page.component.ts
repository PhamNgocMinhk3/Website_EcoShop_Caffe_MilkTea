import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subject,
  switchMap,
  startWith,
  catchError,
  of,
} from 'rxjs';
import { gsap } from 'gsap';

import {
  Product,
  PaginatedProducts,
} from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

// BỎ COMMENT VÀ IMPORT CÁC COMPONENT CON
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-product-management-page',
  standalone: true,
  // THÊM CÁC COMPONENT VÀO MẢNG IMPORTS
  imports: [
    CommonModule,
    ProductCardComponent,
    ProductFormComponent,
    PaginationComponent,
    ModalComponent,
  ],
  templateUrl: './product-management-page.component.html',
  styleUrls: ['./product-management-page.component.css'],
})
export class ProductManagementPageComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);

  productsResponse$!: Observable<PaginatedProducts>;
  private refresh$ = new Subject<number>();

  isFormModalOpen = false;
  isDeleteModalOpen = false;
  selectedProduct: Product | null = null;
  productToDeleteId: number | null = null;

  currentPage = 1;

  ngOnInit(): void {
    this.productsResponse$ = this.refresh$.pipe(
      startWith(this.currentPage),
      switchMap((page) =>
        this.productService.getProducts(page).pipe(
          catchError(() =>
            of({
              items: [],
              pageNumber: 1,
              totalPages: 0,
              totalCount: 0,
              hasPreviousPage: false,
              hasNextPage: false,
            })
          )
        )
      )
    );
  }

  ngAfterViewInit(): void {
    gsap.from('.header-anim', {
      duration: 0.7,
      y: -50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.refresh$.next(page);
  }

  openAddProductModal(): void {
    this.selectedProduct = null;
    this.isFormModalOpen = true;
  }

  openEditProductModal(product: Product): void {
    this.productService.getProductById(product.id).subscribe((details) => {
      this.selectedProduct = details || null;
      this.isFormModalOpen = true;
    });
  }

  openDeleteConfirmModal(id: number): void {
    this.productToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  handleFormSave(isSuccess: boolean): void {
    this.isFormModalOpen = false;
    if (isSuccess) {
      const pageToRefresh = this.selectedProduct ? this.currentPage : 1;
      this.refresh$.next(pageToRefresh);
    }
  }

  handleDeleteConfirm(): void {
    if (this.productToDeleteId) {
      this.productService.deleteProduct(this.productToDeleteId).subscribe({
        next: () => {
          this.refresh$.next(this.currentPage);
        },
        error: (err) => console.error('Lỗi khi xóa sản phẩm', err),
        complete: () => {
          this.isDeleteModalOpen = false;
          this.productToDeleteId = null;
        },
      });
    }
  }
}
