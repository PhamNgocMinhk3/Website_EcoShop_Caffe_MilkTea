import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 6;
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];
  paginationInfo: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage']) {
      this.pages = this.generatePagesArray(this.currentPage, this.totalPages);
    }
    if (
      changes['totalCount'] ||
      changes['currentPage'] ||
      changes['pageSize']
    ) {
      this.updatePaginationInfo();
    }
  }

  generatePagesArray(currentPage: number, totalPages: number): number[] {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift(-1);
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return [...new Set(range)];
  }

  updatePaginationInfo(): void {
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(startItem + this.pageSize - 1, this.totalCount);
    this.paginationInfo = `Hiển thị ${startItem} - ${endItem} trên tổng số ${this.totalCount} mục.`;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
