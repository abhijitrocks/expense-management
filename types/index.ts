
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  defaultCurrency: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  currency: string;
  createdAt: string;
}

export type SplitType = 'equal' | 'shares' | 'percent' | 'manual';

export interface SplitDetail {
  userId: string;
  value: number; // Represents shares, percentage, or amount in cents
}

export interface SplitScheme {
  type: SplitType;
  details?: SplitDetail[]; // required for shares, percent, manual
}

export interface Expense {
  type: 'expense';
  id:string;
  groupId: string;
  payerId: string;
  amountCents: number;
  currency: string;
  date: string;
  description: string;
  splitScheme: SplitScheme;
  receiptBase64?: string;
  notes?: string;
}

export interface Settlement {
  type: 'settlement';
  id: string;
  groupId: string;
  fromId: string;
  toId: string;
  amountCents: number;
  currency: string;
  method: 'cash' | 'transfer' | 'request';
  date: string;
  note?: string;
}

export type Activity = Expense | Settlement;

export interface Balance {
  userId: string;
  netCents: number;
}

export interface SuggestedTransfer {
  fromId: string;
  toId: string;
  amountCents: number;
}
