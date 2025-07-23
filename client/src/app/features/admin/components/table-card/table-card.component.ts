import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableStatus } from '../../../../core/models/table.model';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-card.component.html',
  styleUrls: ['./table-card.component.css'],
})
export class TableCardComponent {
  @Input({ required: true }) table!: Table;
  @Output() edit = new EventEmitter<Table>();
  @Output() delete = new EventEmitter<Table>();
  @Output() statusChange = new EventEmitter<{
    id: number;
    status: TableStatus;
  }>();

  isMenuOpen = false;

  onEdit(): void {
    this.edit.emit(this.table);
    this.isMenuOpen = false;
  }

  onDelete(): void {
    this.delete.emit(this.table);
    this.isMenuOpen = false;
  }

  changeStatus(newStatus: TableStatus): void {
    if (this.table.status !== newStatus) {
      this.statusChange.emit({ id: this.table.id, status: newStatus });
    }
  }
}
