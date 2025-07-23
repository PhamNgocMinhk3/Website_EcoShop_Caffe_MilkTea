import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { WorkAssignment } from '../../../../core/models/schedule.model';
import { ScheduleService } from '../../../../core/services/schedule.service';

@Component({
  selector: 'app-view-schedule-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './view-schedule-page.component.html',
  styleUrls: ['./view-schedule-page.component.css'],
})
export class ViewSchedulePageComponent implements OnInit {
  // Inject service cần thiết
  private scheduleService = inject(ScheduleService);

  // Khai báo các biến cho lịch
  schedule: { [dateKey: string]: { [slotKey: number]: WorkAssignment } } = {};
  currentDate = new Date();
  weekStartDate!: Date;
  weekDates: Date[] = [];
  shifts: { name: string; slots: number[] }[] = [];

  isLoading = true;
  format = format; // Dùng để format ngày trong template

  ngOnInit(): void {
    // Khởi tạo ca làm việc và tải dữ liệu tuần hiện tại
    this.shifts = this.generateShifts();
    this.setWeek(this.currentDate);
    this.loadSchedule();
  }

  /**
   * Tải dữ liệu lịch làm việc cho tuần đã chọn từ service
   */
  loadSchedule(): void {
    this.isLoading = true;
    const startDateStr = format(this.weekStartDate, 'yyyy-MM-dd');
    this.scheduleService.getScheduleForWeek(startDateStr).subscribe({
      next: (response: any) => {
        // Gom nhóm các phân công theo ngày và ca
        this.schedule = this.groupAssignments(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải lịch làm việc: ', err);
        this.schedule = {}; // Reset lịch nếu có lỗi
        this.isLoading = false;
      },
    });
  }

  /**
   * Xử lý và gom nhóm dữ liệu trả về từ API
   * @param apiResponse Dữ liệu từ API
   * @returns Dữ liệu đã được gom nhóm
   */
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
              grouped[dateKey][assignment.caLamViec] = assignment;
            }
          }
        }
      }
    }
    return grouped;
  }

  /**
   * Thiết lập ngày bắt đầu và các ngày trong tuần
   * @param date Ngày bất kỳ trong tuần
   */
  setWeek(date: Date): void {
    this.weekStartDate = startOfWeek(date, { weekStartsOn: 1 }); // Tuần bắt đầu từ thứ 2
    this.weekDates = Array.from({ length: 7 }).map((_, i) => {
      const newDate = new Date(this.weekStartDate);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    });
  }

  /**
   * Tạo cấu trúc ca làm việc (Sáng, Chiều, Tối)
   */
  generateShifts(): { name: string; slots: number[] }[] {
    return [
      { name: 'Sáng', slots: Array.from({ length: 5 }, (_, i) => i + 1) }, // Ca 1-5
      { name: 'Chiều', slots: Array.from({ length: 5 }, (_, i) => i + 6) }, // Ca 6-10
      { name: 'Tối', slots: Array.from({ length: 5 }, (_, i) => i + 11) }, // Ca 11-15
    ];
  }

  /**
   * Chuyển sang tuần trước và tải lại lịch
   */
  previousWeek = (): void => {
    this.currentDate = subWeeks(this.currentDate, 1);
    this.setWeek(this.currentDate);
    this.loadSchedule();
  };

  /**
   * Chuyển sang tuần sau và tải lại lịch
   */
  nextWeek = (): void => {
    this.currentDate = addWeeks(this.currentDate, 1);
    this.setWeek(this.currentDate);
    this.loadSchedule();
  };
}
