import {
  Component,
  AfterViewInit,
  inject,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

declare var gsap: any;
declare var ScrollTrigger: any; // Sửa lỗi: Khai báo ScrollTrigger cho TypeScript

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('featureSection') featureSection?: ElementRef<HTMLElement>;

  private isBrowser: boolean;
  private scrollTriggers: any[] = []; // Mảng để lưu trữ các trigger

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Đăng ký plugin ScrollTrigger
      gsap.registerPlugin(ScrollTrigger);

      // Dùng setTimeout để đảm bảo DOM đã sẵn sàng
      setTimeout(() => {
        this.playHeroAnimation();
        this.playScrollAnimations();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Hủy tất cả các ScrollTrigger khi component bị phá hủy
    if (this.isBrowser) {
      this.scrollTriggers.forEach((st) => st.kill());
    }
  }

  playHeroAnimation(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-title', { duration: 1.2, y: 0, opacity: 1 }, 0.2)
      .to('.hero-subtitle', { duration: 1.2, y: 0, opacity: 1 }, 0.4)
      .to('.hero-cta', { duration: 1.2, y: 0, opacity: 1 }, 0.6)
      .to(
        '.bubble',
        {
          duration: 1.5,
          y: 0,
          opacity: 1,
          stagger: 0.2,
          ease: 'elastic.out(1, 0.5)',
        },
        0.8
      );

    // Đặt trạng thái ban đầu
    gsap.set('.hero-title, .hero-subtitle, .hero-cta', { y: 50, opacity: 0 });
  }

  playScrollAnimations(): void {
    const cards = gsap.utils.toArray('.feature-card');
    cards.forEach((card: any) => {
      const image = card.querySelector('.card-image');
      const content = card.querySelector('.card-content');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'bottom 50%',
          toggleActions: 'play none none none',
        },
      });

      tl.from(image, {
        duration: 1,
        x: card.classList.contains('card-2') ? 100 : -100,
        opacity: 0,
        ease: 'power3.out',
      }).from(
        content,
        { duration: 1, y: 50, opacity: 0, ease: 'power3.out' },
        '-=0.8'
      );

      this.scrollTriggers.push(tl.scrollTrigger);
    });
  }

  scrollToFeatures(): void {
    this.featureSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
