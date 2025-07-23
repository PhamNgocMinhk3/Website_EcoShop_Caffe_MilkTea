// notification.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var gsap: any;

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements AfterViewInit {
  // ✨ SỬA LẠI DÒNG NÀY
  @Input() type: 'success' | 'error' | 'info' = 'success';

  @Input() message: string = '';
  @Input() duration: number = 3000;
  @Output() close = new EventEmitter<void>();

  @ViewChild('toastElement') toastElement!: ElementRef;

  private timeline?: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.timeline = gsap.timeline({
        onComplete: () => this.startCloseTimer(),
      });
      this.timeline.to(this.toastElement.nativeElement, {
        duration: 0.5,
        x: 0,
        opacity: 1,
        ease: 'power3.out',
      });
    }
  }

  private startCloseTimer(): void {
    setTimeout(() => {
      this.closeToast();
    }, this.duration);
  }

  public closeToast(): void {
    if (this.isBrowser) {
      gsap.to(this.toastElement.nativeElement, {
        duration: 0.5,
        x: '110%',
        opacity: 0,
        ease: 'power3.in',
        onComplete: () => {
          this.close.emit();
        },
      });
    } else {
      this.close.emit();
    }
  }
}
