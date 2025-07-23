import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  Product,
  PaginatedProducts,
} from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { NotificationService } from '../../../../core/services/notification.service';

declare var gsap: any;

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './product-list-page.component.html',
  styleUrls: ['./product-list-page.component.css'],
})
export class ProductListPageComponent implements OnInit {
  products: Product[] = [];
  pagination: PaginatedProducts | null = null;
  isLoading = false;
  paginationWindow: number[] = [];

  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const page = Number(params.get('pageNumber')) || 1;
      this.loadProducts(page);
    });
  }

  loadProducts(page: number): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.products = [];
    this.pagination = null;
    this.cdr.detectChanges();

    const pageSize = 6;

    this.productService.getProducts(page, pageSize).subscribe({
      next: (response) => {
        if (response.items.length === 0 && page > 1) {
          this.notificationService.showError('Sản phẩm đã hết!', 2000);
          this.goToPage(page - 1);
          return;
        }

        this.products = response.items;

        // ✅ Tính lại totalPages nếu backend không trả về
        const totalPages = Math.ceil(response.totalCount / pageSize);

        this.pagination = {
          ...response,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          pageNumber: page,
        };

        this.isLoading = false;
        console.log('pagination:', this.pagination);
        this.updatePaginationWindow();
        this.cdr.detectChanges();
        this.animateCards();
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
        this.isLoading = false;
        this.notificationService.showError(
          'Không thể tải danh sách sản phẩm.',
          2000
        );
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= (this.pagination?.totalPages ?? 1) &&
      page !== this.pagination?.pageNumber
    ) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { pageNumber: page },
        queryParamsHandling: 'merge',
      });
    }
  }

  updatePaginationWindow(): void {
    if (!this.pagination) return;
    const { pageNumber, totalPages } = this.pagination;
    const windowSize = 4;

    let startPage = Math.max(1, pageNumber - 1);
    let endPage = Math.min(totalPages, startPage + windowSize - 1);

    if (endPage - startPage + 1 < windowSize && totalPages >= windowSize) {
      startPage = endPage - windowSize + 1;
    }

    this.paginationWindow = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  animateCards(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        gsap.fromTo(
          '.product-card',
          { opacity: 0, y: 50 },
          {
            duration: 0.8,
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }, 50);
    }
  }
}
