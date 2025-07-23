import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ScheduleEmployee,
  CreateAssignmentDto,
} from '../../../../core/models/schedule.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-shift-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './shift-assignment-modal.component.html',
  styleUrls: ['./shift-assignment-modal.component.css'],
})
export class ShiftAssignmentModalComponent {
  @Input() employee: ScheduleEmployee | null = null;
  @Input() day: Date | null = null;
  @Output() save = new EventEmitter<CreateAssignmentDto>();
  @Output() cancel = new EventEmitter<void>();

  shifts = [
    { name: 'Sáng', slots: [1, 2, 3, 4, 5] },
    { name: 'Chiều', slots: [6, 7, 8, 9, 10] },
    { name: 'Tối', slots: [11, 12, 13, 14, 15] },
  ];

  selectedSlots: { [key: number]: boolean } = {};

  onSave(): void {
    if (!this.employee || !this.day) return;

    const selectedCaLamViecs = Object.keys(this.selectedSlots)
      .filter((key) => this.selectedSlots[+key])
      .map((slot) => +slot);

    const payload: CreateAssignmentDto = {
      maNV: this.employee.maNV,
      ngayLamViec: format(this.day, 'yyyy-MM-dd'),
      caLamViecs: selectedCaLamViecs,
    };

    this.save.emit(payload);
  }
}
