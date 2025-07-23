import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { gsap } from 'gsap';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  // Nhận dữ liệu sản phẩm từ component cha
  @Input({ required: true }) product!: Product;

  // Gửi sự kiện khi người dùng nhấn nút Sửa hoặc Xóa
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<number>();

  onEdit(): void {
    this.edit.emit(this.product);
  }

  onDelete(): void {
    this.delete.emit(this.product.id);
  }
}
