import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { startOfWeek, addWeeks, subWeeks, format, getDay } from 'date-fns';
import {
  ScheduleEmployee,
  WorkAssignment,
  CreateAssignmentDto,
  DeleteAssignmentDto,
} from '../../../../core/models/schedule.model';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ShiftAssignmentModalComponent } from '../../components/shift-assignment-modal/shift-assignment-modal.component';

@Component({
  selector: 'app-work-schedule-page',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    DatePipe,
    ModalComponent,
    ShiftAssignmentModalComponent,
  ],
  templateUrl: './work-schedule-page.component.html',
  styleUrls: ['./work-schedule-page.component.css'],
})
export class WorkSchedulePageComponent implements OnInit {
  private scheduleService = inject(ScheduleService);

  employees: ScheduleEmployee[] = [];
  schedule: { [dateKey: string]: { [slotKey: number]: WorkAssignment } } = {};

  currentDate = new Date();
  weekStartDate!: Date;
  weekDates: Date[] = [];
  shifts: { name: string; slots: number[] }[] = [];

  isLoading = true;
  format = format;
  isModalOpen = false;
  employeeToAssign: ScheduleEmployee | null = null;
  dayToAssign: Date | null = null;

  // SỬA LỖI: Thêm lại phương thức ngOnInit
  ngOnInit(): void {
    this.shifts = this.generateShifts();
    this.setWeek(this.currentDate);
    this.loadInitialData();
  }

  // SỬA LỖI: Thêm lại phương thức loadInitialData
  loadInitialData(): void {
    this.isLoading = true;
    this.scheduleService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.loadSchedule();
    });
  }

  // SỬA LỖI: Thêm lại phương thức loadSchedule
  loadSchedule(): void {
    this.isLoading = true;
    const startDateStr = format(this.weekStartDate, 'yyyy-MM-dd');
    this.scheduleService.getScheduleForWeek(startDateStr).subscribe({
      next: (response: any) => {
        this.schedule = this.groupAssignments(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải lịch làm việc: ', err);
        this.schedule = {};
        this.isLoading = false;
      },
    });
  }

  groupAssignments(apiResponse: any): {
    [dateKey: string]: { [slotKey: number]: WorkAssignment };
  } {
    const grouped: {
      [dateKey: string]: { [slotKey: number]: WorkAssignment };
    } = {};
    const assignmentsObject = apiResponse?.lichLamViec;
    if (!assignmentsObject || typeof assignmentsObject !== 'object')
      return grouped;

    for (const dateKey in assignmentsObject) {
      if (Object.prototype.hasOwnProperty.call(assignmentsObject, dateKey)) {
        const assignmentsForDay: WorkAssignment[] = assignmentsObject[dateKey];
        if (Array.isArray(assignmentsForDay) && assignmentsForDay.length > 0) {
          grouped[dateKey] = {};
          for (const assignment of assignmentsForDay) {
            if (assignment && assignment.caLamViec) {
              assignment.date = dateKey; // Gán thêm ngày vào object để tiện cho việc xóa
              grouped[dateKey][assignment.caLamViec] = assignment;
            }
          }
        }
      }
    }
    return grouped;
  }

  setWeek(date: Date): void {
    this.weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
    this.weekDates = Array.from({ length: 7 }).map((_, i) => {
      const newDate = new Date(this.weekStartDate);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    });
  }

  onDrop(event: CdkDragDrop<any>, day: Date): void {
    this.employeeToAssign = event.item.data as ScheduleEmployee;
    this.dayToAssign = day;
    this.isModalOpen = true;
  }

  handleAssignmentSave(payload: CreateAssignmentDto): void {
    if (payload && payload.caLamViecs.length > 0) {
      this.scheduleService.createAssignments(payload).subscribe(() => {
        this.loadSchedule();
      });
    }
    this.isModalOpen = false;
  }

  removeAssignment(assignment: WorkAssignment): void {
    const payload: DeleteAssignmentDto = {
      maNV: assignment.maNV,
      ngayLamViec: format(new Date(assignment.date!), 'yyyy-MM-dd'),
      caLamViec: assignment.caLamViec,
    };
    this.scheduleService.deleteAssignment(payload).subscribe(() => {
      this.loadSchedule();
    });
  }

  generateShifts(): { name: string; slots: number[] }[] {
    return [
      { name: 'Sáng', slots: Array.from({ length: 5 }, (_, i) => i + 1) }, // 1-5
      { name: 'Chiều', slots: Array.from({ length: 5 }, (_, i) => i + 6) }, // 6-10
      { name: 'Tối', slots: Array.from({ length: 5 }, (_, i) => i + 11) }, // 11-15
    ];
  }

  previousWeek = () => {
    this.currentDate = subWeeks(this.currentDate, 1);
    this.setWeek(this.currentDate);
    this.loadSchedule();
  };
  nextWeek = () => {
    this.currentDate = addWeeks(this.currentDate, 1);
    this.setWeek(this.currentDate);
    this.loadSchedule();
  };
}
