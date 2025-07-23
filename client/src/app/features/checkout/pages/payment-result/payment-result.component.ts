// payment-result.component.ts

import {
  Component,
  OnInit,
  inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { HttpParams } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var gsap: any;

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css'],
})
export class PaymentResultComponent implements OnInit, AfterViewInit {
  isLoading = true;
  isSuccess = false;
  message = 'Đang xử lý kết quả thanh toán...';

  @ViewChild('resultCard') resultCard!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let httpParams = new HttpParams();
      params.keys.forEach((key) => {
        httpParams = httpParams.append(key, params.get(key)!);
      });

      if (httpParams.keys().length > 0) {
        this.orderService.confirmVnpayPayment(httpParams).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.isSuccess = true;
            this.message =
              response.message ||
              'Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.';
            this.animateCard();
          },
          error: (err) => {
            this.isLoading = false;
            this.isSuccess = false;
            this.message =
              err.error?.message || 'Thanh toán thất bại hoặc có lỗi xảy ra.';
            this.animateCard();
          },
        });
      } else {
        this.isLoading = false;
        this.message = 'Không tìm thấy thông tin thanh toán.';
        this.animateCard();
      }
    });
  }

  ngAfterViewInit(): void {}

  animateCard(): void {
    if (this.isBrowser && this.resultCard) {
      setTimeout(() => {
        gsap.fromTo(
          this.resultCard.nativeElement,
          { rotationY: -90, opacity: 0, scale: 0.9 },
          {
            duration: 1.2,
            rotationY: 0,
            opacity: 1,
            scale: 1,
            ease: 'power3.out',
          }
        );
      }, 0);
    }
  }
}
