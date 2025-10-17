import { describe, it, expect } from '@jest/globals';
import { calculateBalances, splitExpense, simplifyDebts } from './calc';
import type { User, Expense, Balance } from '../types';

// Mock data for testing
const mockUsers: User[] = [
    { id: 'u1', name: 'Alice', defaultCurrency: 'USD', avatarUrl: '' },
    { id: 'u2', name: 'Bob', defaultCurrency: 'USD', avatarUrl: '' },
    { id: 'u3', name: 'Charlie', defaultCurrency: 'USD', avatarUrl: '' },
];

describe('splitExpense: equal', () => {
    it('should split an amount equally among 3 users without remainder', () => {
        const expense: Expense = {
            type: 'expense', id: 'e1', groupId: 'g1', payerId: 'u1', amountCents: 300, currency: 'USD',
            date: '', description: '', splitScheme: { type: 'equal' }
        };
        const shares = splitExpense(expense, mockUsers);
        expect(shares).toEqual([
            { userId: 'u1', amountCents: 100 },
            { userId: 'u2', amountCents: 100 },
            { userId: 'u3', amountCents: 100 },
        ]);
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(300);
    });

    it('should distribute the remainder correctly for an unequal split (100 cents / 3 users)', () => {
        const expense: Expense = {
            type: 'expense', id: 'e2', groupId: 'g1', payerId: 'u1', amountCents: 100, currency: 'USD',
            date: '', description: '', splitScheme: { type: 'equal' }
        };
        // Payer is u1. Sorted order is u1, u2, u3. Remainder is 1. Payer gets the first cent.
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(34); // 33 + 1
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(33);
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(33);
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(100);
    });

    it('should distribute remainder correctly when payer is not first alphabetically', () => {
        const expense: Expense = {
            type: 'expense', id: 'e3', groupId: 'g1', payerId: 'u2', amountCents: 101, currency: 'USD',
            date: '', description: '', splitScheme: { type: 'equal' }
        };
        // Sorted: u1, u2, u3. Payer: u2. Amount per person: 33. Remainder: 2.
        // Remainder goes to u2, then u3.
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(33);
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(34); // 33 + 1
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(34); // 33 + 1
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(101);
    });
});

describe('splitExpense: shares', () => {
    it('should split by shares (2:1:1)', () => {
        const expense: Expense = {
            type: 'expense', id: 'e4', groupId: 'g1', payerId: 'u1', amountCents: 400, currency: 'USD',
            date: '', description: '', splitScheme: { 
                type: 'shares', 
                details: [
                    { userId: 'u1', value: 2 },
                    { userId: 'u2', value: 1 },
                    { userId: 'u3', value: 1 },
                ]
            }
        };
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(200);
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(100);
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(100);
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(400);
    });

    it('should split by shares with rounding (100 cents, 1:1:1)', () => {
         const expense: Expense = {
            type: 'expense', id: 'e5', groupId: 'g1', payerId: 'u1', amountCents: 100, currency: 'USD',
            date: '', description: '', splitScheme: { 
                type: 'shares', 
                details: [
                    { userId: 'u1', value: 1 },
                    { userId: 'u2', value: 1 },
                    { userId: 'u3', value: 1 },
                ]
            }
        };
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(34); // 33 + 1
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(33);
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(33);
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(100);
    });
});

describe('splitExpense: percent', () => {
    it('should split by percentage (50:25:25)', () => {
        const expense: Expense = {
            type: 'expense', id: 'e6', groupId: 'g1', payerId: 'u1', amountCents: 1000, currency: 'USD',
            date: '', description: '', splitScheme: {
                type: 'percent',
                details: [
                    { userId: 'u1', value: 50 },
                    { userId: 'u2', value: 25 },
                    { userId: 'u3', value: 25 },
                ]
            }
        };
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(500);
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(250);
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(250);
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(1000);
    });

     it('should split by percentage with rounding (101 cents, 30:30:40)', () => {
        const expense: Expense = {
            type: 'expense', id: 'e7', groupId: 'g1', payerId: 'u3', amountCents: 101, currency: 'USD',
            date: '', description: '', splitScheme: {
                type: 'percent',
                details: [
                    { userId: 'u1', value: 30 }, // 30.3 -> 30
                    { userId: 'u2', value: 30 }, // 30.3 -> 30
                    { userId: 'u3', value: 40 }, // 40.4 -> 40
                ]
            }
        };
        // Remainder is 1. Payer is u3. Sorted is u1, u2, u3. Payer index is 2.
        // Remainder goes to u3.
        const shares = splitExpense(expense, mockUsers);
        expect(shares.find(s => s.userId === 'u1')?.amountCents).toBe(30);
        expect(shares.find(s => s.userId === 'u2')?.amountCents).toBe(30);
        expect(shares.find(s => s.userId === 'u3')?.amountCents).toBe(41); // 40 + 1
        expect(shares.reduce((sum, s) => sum + s.amountCents, 0)).toBe(101);
    });
});

describe('simplifyDebts', () => {
    it('should return an empty array if all balances are zero', () => {
        const balances: Balance[] = [
            { userId: 'u1', netCents: 0 },
            { userId: 'u2', netCents: 0 },
            { userId: 'u3', netCents: 0 },
        ];
        expect(simplifyDebts(balances)).toEqual([]);
    });

    it('should generate a single transfer for a simple debtor/creditor pair', () => {
        const balances: Balance[] = [
            { userId: 'u1', netCents: -1000 },
            { userId: 'u2', netCents: 1000 },
            { userId: 'u3', netCents: 0 },
        ];
        const transfers = simplifyDebts(balances);
        expect(transfers).toHaveLength(1);
        expect(transfers[0]).toEqual({ fromId: 'u1', toId: 'u2', amountCents: 1000 });
    });

    it('should simplify a complex debt scenario into N-1 transfers', () => {
        // u1 owes 10, u2 owes 20, u3 is owed 30
        const balances: Balance[] = [
            { userId: 'u1', netCents: -1000 },
            { userId: 'u2', netCents: -2000 },
            { userId: 'u3', netCents: 3000 },
        ];
        const transfers = simplifyDebts(balances);
        // Expects u2 pays u3 20, and u1 pays u3 10
        expect(transfers).toHaveLength(2); // <= N-1 (3-1=2)
        expect(transfers).toContainEqual({ fromId: 'u2', toId: 'u3', amountCents: 2000 });
        expect(transfers).toContainEqual({ fromId: 'u1', toId: 'u3', amountCents: 1000 });

        const totalTransferred = transfers.reduce((sum, t) => sum + t.amountCents, 0);
        const totalDebt = Math.abs(balances.filter(b => b.netCents < 0).reduce((sum, b) => sum + b.netCents, 0));
        expect(totalTransferred).toBe(totalDebt);
    });

    it('should handle multiple debtors and creditors', () => {
        // u1 owed 50, u2 owed 10. u3 owes 40, u4 owes 20.
        const balances: Balance[] = [
            { userId: 'u1', netCents: 5000 },
            { userId: 'u2', netCents: 1000 },
            { userId: 'u3', netCents: -4000 },
            { userId: 'u4', netCents: -2000 },
        ];
        const transfers = simplifyDebts(balances);
        // Debtors sorted: u3 (-40), u4 (-20). Creditors sorted: u1 (50), u2 (10)
        // 1. u3 pays u1 40. u1 balance becomes 10. u3 balance becomes 0.
        // 2. u4 pays u1 10. u1 balance becomes 0. u4 balance becomes -10.
        // 3. u4 pays u2 10. u2 balance becomes 0. u4 balance becomes 0.
        expect(transfers).toHaveLength(3); // <= N-1 (4-1=3)
        const totalTransferred = transfers.reduce((sum, t) => sum + t.amountCents, 0);
        expect(totalTransferred).toBe(6000);
    });
});