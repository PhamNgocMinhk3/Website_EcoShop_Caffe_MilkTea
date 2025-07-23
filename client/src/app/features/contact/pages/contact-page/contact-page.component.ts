import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { NotificationService } from '../../../../core/services/notification.service';

declare var gsap: any;

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
})
export class ContactPageComponent implements AfterViewInit {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificationService: NotificationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.playIntroAnimations();
    }
  }

  playIntroAnimations(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.form-title', { duration: 1, y: 50, opacity: 0 })
      .from('.form-subtitle', { duration: 1, y: 40, opacity: 0 }, '-=0.8')
      .from(
        '.info-item',
        { duration: 0.8, x: -50, opacity: 0, stagger: 0.2 },
        '-=0.6'
      )
      .from(
        '.form-field',
        { duration: 0.8, y: 30, opacity: 0, stagger: 0.2 },
        '-=0.5'
      )
      .from('.submit-btn', { duration: 1, opacity: 0, scale: 0.8 }, '-=0.5');

    const path = document.querySelector('.map-path');
    if (path) {
      const length = (path as SVGPathElement).getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        duration: 2,
        strokeDashoffset: 0,
        delay: 1,
        ease: 'power2.inOut',
      });
    }

    gsap.from('.map-land', { duration: 1.5, opacity: 0, y: 200, delay: 0.5 });
    gsap.from('.map-dot', {
      duration: 1,
      scale: 0,
      opacity: 0,
      stagger: 0.3,
      delay: 1.5,
      ease: 'back.out(1.7)',
    });
  }

  // SỬA LỖI: Cập nhật hàm để nhận NgForm và reset form
  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Form Submitted!', form.value);
      this.notificationService.show(
        'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn.',
        'success'
      );
      form.reset();
    }
  }
}
