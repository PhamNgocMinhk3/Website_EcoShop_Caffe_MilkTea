import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { gsap } from 'gsap';

import { TimeTrackingService } from '../../../../core/services/time-tracking.service';
import { ShiftStatusDto } from '../../../../core/models/time-tracking.model';
import { CookieService } from '../../../../core/services/cookie.service';

@Component({
  selector: 'app-time-tracking-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './time-tracking-page.component.html',
  styleUrls: ['./time-tracking-page.component.css'],
})
export class TimeTrackingPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Inject các service cần thiết
  private timeTrackingService = inject(TimeTrackingService);
  private cookieService = inject(CookieService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // SỬA LỖI: Khai báo lại đầy đủ các @ViewChild
  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLDivElement>;
  @ViewChild('clockCard', { static: true })
  clockCard!: ElementRef<HTMLDivElement>;
  @ViewChild('statusCard', { static: true })
  statusCard!: ElementRef<HTMLDivElement>;
  @ViewChild('actions') actions: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('hourHand', { static: true })
  hourHand!: ElementRef<SVGLineElement>;
  @ViewChild('minuteHand', { static: true })
  minuteHand!: ElementRef<SVGLineElement>;
  @ViewChild('secondHand', { static: true })
  secondHand!: ElementRef<SVGLineElement>;

  // State của component
  shiftStatus: ShiftStatusDto | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  currentTime = new Date();
  private clockInterval: any;
  private employeeId: number | null = null;

  public get statusClass(): string {
    if (!this.shiftStatus?.trangThaiChamCong) {
      return '';
    }
    return this.shiftStatus.trangThaiChamCong
      .split(' ')
      .join('-')
      .toLowerCase();
  }

  ngOnInit(): void {
    const userIdFromCookie = this.cookieService.get('userId');
    if (userIdFromCookie) {
      this.employeeId = parseInt(userIdFromCookie, 10);
      this.loadStatus();
    } else {
      this.isLoading = false;
      this.errorMessage =
        'Không tìm thấy thông tin người dùng (userId cookie). Vui lòng đăng nhập lại.';
    }
    this.startClock();
  }

  ngAfterViewInit(): void {
    this.introAnimation();
    this.updateClockHands();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  loadStatus(): void {
    if (!this.employeeId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.timeTrackingService.getStatus(this.employeeId).subscribe({
      next: (data) => {
        this.shiftStatus = data;
        this.isLoading = false;
        this.animateStatusUpdate();
        setTimeout(() => this.animateInActions(), 0);
      },
      error: (err) => {
        this.errorMessage =
          'Không thể tải trạng thái chấm công. Vui lòng thử lại.';
        if (err.status === 403) {
          this.errorMessage =
            'Lỗi 403: Không có quyền truy cập. Vui lòng kiểm tra CORS hoặc Authentication trên server.';
        }
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  onCheckIn(): void {
    if (!this.employeeId) return;
    this.animateButtonPress('.check-in-btn');
    this.timeTrackingService.checkIn({ maNV: this.employeeId }).subscribe({
      next: () => this.loadStatus(),
      error: (err) =>
        (this.errorMessage = err.error.message || 'Lỗi khi check-in'),
    });
  }

  onCheckOut(): void {
    if (!this.employeeId) return;
    this.animateButtonPress('.check-out-btn');
    this.timeTrackingService.checkOut({ maNV: this.employeeId }).subscribe({
      next: () => this.loadStatus(),
      error: (err) =>
        (this.errorMessage = err.error.message || 'Lỗi khi check-out'),
    });
  }

  private startClock(): void {
    this.zone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        this.currentTime = new Date();
        this.updateClockHands();
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  private updateClockHands(): void {
    const hours = this.currentTime.getHours();
    const minutes = this.currentTime.getMinutes();
    const seconds = this.currentTime.getSeconds();

    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const secondDeg = seconds * 6;

    gsap.to(this.hourHand.nativeElement, {
      duration: 0.5,
      rotation: hourDeg,
      transformOrigin: '50% 100%',
    });
    gsap.to(this.minuteHand.nativeElement, {
      duration: 0.5,
      rotation: minuteDeg,
      transformOrigin: '50% 100%',
    });
    gsap.to(this.secondHand.nativeElement, {
      duration: 0.5,
      rotation: secondDeg,
      transformOrigin: '50% 100%',
    });
  }

  private introAnimation(): void {
    gsap.from(this.container.nativeElement, {
      duration: 0.8,
      autoAlpha: 0,
      ease: 'power2.inOut',
    });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(this.clockCard.nativeElement, {
      duration: 1,
      y: -50,
      autoAlpha: 0,
      delay: 0.3,
    }).from(
      this.statusCard.nativeElement,
      { duration: 1, y: 50, autoAlpha: 0 },
      '-=0.7'
    );
  }

  private animateInActions(): void {
    if (this.actions?.nativeElement) {
      gsap.from(this.actions.nativeElement.children, {
        duration: 0.5,
        scale: 0.5,
        autoAlpha: 0,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }
  }

  private animateStatusUpdate(): void {
    const tl = gsap.timeline();
    tl.to(this.statusCard.nativeElement, {
      duration: 0.3,
      y: -20,
      autoAlpha: 0,
      ease: 'power2.in',
    }).to(this.statusCard.nativeElement, {
      duration: 0.5,
      y: 0,
      autoAlpha: 1,
      ease: 'power2.out',
    });
  }

  private animateButtonPress(buttonClass: string): void {
    gsap.to(buttonClass, {
      duration: 0.1,
      scale: 0.95,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
    });
  }
}
