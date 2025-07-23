export interface ScheduleEmployee {
  maNV: number;
  hoTen: string;
  email: string;
}

export interface WorkAssignment {
  maNV: number;
  hoTen: string;
  date: string;
  shiftSlot: number;
  caLamViec: number;
}

export interface CreateAssignmentDto {
  maNV: number;
  ngayLamViec: string;
  caLamViecs: number[];
}

export interface DeleteAssignmentDto {
  maNV: number;
  ngayLamViec: string;
  caLamViec: number;
}
