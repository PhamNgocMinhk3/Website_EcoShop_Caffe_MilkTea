import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import {
  Product,
  Topping,
  CartItem,
} from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

declare var gsap: any;

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.css'],
})
export class ProductDetailPageComponent implements OnInit, AfterViewInit {
  product: Product | undefined;
  toppings: Topping[] = [];
  quantity: number = 1;
  selectedSize: 'S' | 'M' | 'L' = 'S';
  selectedToppings: { [key: number]: boolean } = {};
  totalPrice: number = 0;

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.productService.getProductById(id);
        })
      )
      .subscribe((product) => {
        this.product = product;
        this.loadToppings();
        this.calculatePrice();
      });
  }

  ngAfterViewInit(): void {
    gsap.from('.product-image-container', {
      duration: 1,
      opacity: 0,
      x: -100,
      ease: 'power3.out',
    });
    gsap.from('.product-details-container', {
      duration: 1,
      opacity: 0,
      x: 100,
      ease: 'power3.out',
      delay: 0.2,
    });
  }

  loadToppings() {
    this.productService.getToppings().subscribe((toppings: Topping[]) => {
      // SỬA LỖI: Thêm kiểu dữ liệu
      this.toppings = toppings;
    });
  }

  calculatePrice(): void {
    if (!this.product) return;
    let price = this.product.price;
    if (this.selectedSize === 'M') price += 3000;
    if (this.selectedSize === 'L') price += 7000;
    for (const topping of this.toppings) {
      if (this.selectedToppings[topping.id]) {
        price += topping.price;
      }
    }
    this.totalPrice = price * this.quantity;
  }

  onOptionChange(): void {
    this.calculatePrice();
  }
  increaseQuantity(): void {
    this.quantity++;
    this.calculatePrice();
  }
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculatePrice();
    }
  }

  addToCart(): void {
    if (!this.product) return;
    const toppings: Topping[] = this.toppings.filter(
      (t) => this.selectedToppings[t.id]
    );
    const toppingIds = toppings
      .map((t) => t.id)
      .sort()
      .join('-');
    const uniqueId = `${this.product.id}-${this.selectedSize}-${toppingIds}`;

    const cartItem: CartItem = {
      productId: this.product.id,
      name: this.product.name,
      imageUrl: this.product.imageUrl,
      quantity: this.quantity,
      size: this.selectedSize,
      basePrice: this.product.price,
      selectedToppings: toppings,
      finalPrice: this.totalPrice / this.quantity,
      uniqueId: uniqueId,
    };

    this.cartService.addToCart(cartItem);
    this.notificationService.show('Đã thêm vào giỏ hàng!', 'success', 2000);
  }
}
