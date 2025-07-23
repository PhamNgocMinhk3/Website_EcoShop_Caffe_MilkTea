import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private elementRef = inject(ElementRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleModal(this.isOpen);
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  private toggleModal(show: boolean): void {
    const modalWrapper =
      this.elementRef.nativeElement.querySelector('.modal-wrapper');
    if (!modalWrapper) return;

    const backdrop = modalWrapper.querySelector('.modal-backdrop');
    const content = modalWrapper.querySelector('.modal-content');

    if (!backdrop || !content) return;

    gsap.killTweensOf([modalWrapper, backdrop, content]);

    if (show) {
      gsap.to(modalWrapper, { autoAlpha: 1, duration: 0 });
      gsap.to(backdrop, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(
        content,
        { autoAlpha: 0, y: -30 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(content, {
        autoAlpha: 0,
        y: -30,
        duration: 0.3,
        ease: 'power2.in',
      });
      gsap.to(backdrop, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.to(modalWrapper, { autoAlpha: 0, duration: 0 });
        },
      });
    }
  }
}
