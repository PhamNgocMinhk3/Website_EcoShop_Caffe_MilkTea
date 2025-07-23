// Định nghĩa các trạng thái có thể có của bàn
export type TableStatus = 'Available' | 'Occupied' | 'Maintenance';

export const TABLE_STATUS_MAP: { [key: number]: TableStatus } = {
  0: 'Available',
  1: 'Occupied',
  2: 'Maintenance',
};

export const REVERSE_TABLE_STATUS_MAP: { [key in TableStatus]: number } = {
  Available: 0,
  Occupied: 1,
  Maintenance: 2,
};

export interface Table {
  id: number;
  name: string;
  status: TableStatus;
}

export interface ApiTable {
  id: number;
  name: string;
  status: number;
}
