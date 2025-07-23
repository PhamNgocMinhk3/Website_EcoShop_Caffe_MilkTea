import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// Khai báo để TypeScript không báo lỗi khi dùng GSAP từ CDN
declare var gsap: any;

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('card') card?: ElementRef<HTMLDivElement>;
  
  private routerSubscription?: Subscription;
  private isBrowser: boolean;

  constructor(
    private router: Router, 
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Chỉ kiểm tra môi trường, không chạy logic phức tạp
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    // Chỉ chạy TOÀN BỘ logic animation và router trên TRÌNH DUYỆT
    if (this.isBrowser) {
        this.setupRouterEvents();
        this.playInitialAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) this.routerSubscription.unsubscribe();
  }

  setupRouterEvents() {
    this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
        if (event instanceof NavigationStart) this.animateOut();
        if (event instanceof NavigationEnd) this.animateIn();
    });
  }
  
  playInitialAnimations() {
    // Dùng setTimeout(..., 0) là cách an toàn nhất để đảm bảo DOM đã sẵn sàng
    setTimeout(() => {
      if (this.card) {
        gsap.from(this.card.nativeElement, {
            duration: 1.2, y: 50, opacity: 0, scale: 0.95, ease: 'power3.out'
        });
        this.animateIn();
      }
    }, 0);
  }

  animateOut() {
    const formElements = this.elementRef.nativeElement.querySelectorAll('.anim-element');
    gsap.to(formElements, {
      duration: 0.4, opacity: 0, y: -30, stagger: 0.05, ease: 'power2.in'
    });
  }

  animateIn() {
    const formElements = this.elementRef.nativeElement.querySelectorAll('.anim-element');
    gsap.fromTo(formElements, 
      { opacity: 0, y: 30 }, 
      {
        duration: 0.6, opacity: 1, y: 0, stagger: 0.1, ease: 'power2.out', delay: 0.4
      }
    );
  }
}
