
import React, { useMemo } from 'react';
import type { Group, Balance, SuggestedTransfer } from '../types';
import Dialog from './ui/Dialog';
import { Button } from './ui/Button';
import { simplifyDebts } from '../utils/calc';
import { formatCurrency } from '../utils/formatters';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface SimplifyDebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  balances: Balance[];
}

const SimplifyDebtsModal: React.FC<SimplifyDebtsModalProps> = ({ isOpen, onClose, group, balances }) => {
  const { addSettlement } = useAppStore();
  const suggestedTransfers = useMemo(() => {
    if (!isOpen) return [];
    return simplifyDebts(balances);
  }, [isOpen, balances]);

  const handleMarkAsPaid = (transfer: SuggestedTransfer) => {
    // TODO: replace with real API call
    addSettlement({
        groupId: group.id,
        fromId: transfer.fromId,
        toId: transfer.toId,
        amountCents: transfer.amountCents,
        currency: group.currency,
        method: 'transfer',
        date: new Date().toISOString(),
        note: 'Settled via simplification'
    });
    // In a real app, you might want to optimistically update the UI here
    // For now, we rely on the side effect of addSettlement to refetch activities
    onClose();
  };

  const getUserName = (userId: string) => group.members.find(m => m.id === userId)?.name || 'Unknown User';
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Settle Up">
      {suggestedTransfers.length > 0 ? (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Here are the suggested transfers to settle all debts efficiently:
          </p>
          <ul className="space-y-3">
            {suggestedTransfers.map((transfer, index) => (
              <li key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{getUserName(transfer.fromId)}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{getUserName(transfer.toId)}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(transfer.amountCents, group.currency)}
                    </span>
                    <Button size="sm" onClick={() => handleMarkAsPaid(transfer)}>Pay</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300 py-4">
          Everyone is settled up. No transfers needed!
        </p>
      )}
    </Dialog>
  );
};

export default SimplifyDebtsModal;
