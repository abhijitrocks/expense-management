import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Group, Expense, SplitType, SplitDetail } from '../types';
import Dialog from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useAppStore } from '../store/useAppStore';
import ReceiptUploader from './ReceiptUploader';
import { splitExpense } from '../utils/calc';
import { formatCurrency } from '../utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, group }) => {
  const { user, addExpense } = useAppStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payerId, setPayerId] = useState(user?.id || '');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>();
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);

  const amountCents = useMemo(() => Math.round(parseFloat(amount) * 100 || 0), [amount]);

  useEffect(() => {
    if (group) {
        setSplitDetails(group.members.map(m => ({ userId: m.id, value: 1 })));
    }
  }, [group]);

  const resetForm = useCallback(() => {
    setAmount('');
    setDescription('');
    setPayerId(user?.id || '');
    setSplitType('equal');
    setReceiptBase64(undefined);
    setSplitDetails(group.members.map(m => ({ userId: m.id, value: 1 })));
  }, [user, group]);

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSplitDetailChange = (userId: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSplitDetails(prev => prev.map(d => d.userId === userId ? { ...d, value: numericValue } : d));
  }

  const { isSplitValid, splitTotal } = useMemo(() => {
    if (splitType === 'percent') {
      const total = splitDetails.reduce((sum, d) => sum + d.value, 0);
      return { isSplitValid: total === 100, splitTotal: total };
    }
     if (splitType === 'shares') {
      const total = splitDetails.reduce((sum, d) => sum + d.value, 0);
      return { isSplitValid: total > 0, splitTotal: total };
    }
    return { isSplitValid: true, splitTotal: null };
  }, [splitType, splitDetails]);

  const previewSplits = useMemo(() => {
    if (!amountCents || !isSplitValid) return [];

    const tempExpense: Expense = {
        type: 'expense', id: 'temp', groupId: group.id, payerId, amountCents, currency: group.currency,
        date: '', description: '',
        splitScheme: { type: splitType, details: splitDetails }
    };
    return splitExpense(tempExpense, group.members);

  }, [amountCents, splitType, splitDetails, isSplitValid, group, payerId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountCents || amountCents <= 0 || !payerId || !isSplitValid) {
      alert("Please fill in all required fields correctly.");
      return;
    }
    
    const expenseData: Omit<Expense, 'id' | 'type'> = {
      groupId: group.id,
      payerId,
      amountCents,
      currency: group.currency,
      date: new Date().toISOString(),
      description: description || 'Untitled Expense',
      splitScheme: { 
          type: splitType,
          details: splitType !== 'equal' ? splitDetails : undefined,
      },
      receiptBase64,
    };
    
    await addExpense(expenseData);
    handleClose();
  };
  
  const isFormValid = amountCents > 0 && description.trim() !== '' && isSplitValid;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add an Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({group.currency})</label>
          <Input 
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <Input 
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner, Groceries"
            required
          />
        </div>
        <div>
          <label htmlFor="payer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paid by</label>
          <Select id="payer" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
            {group.members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="split" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Split</label>
           <Select id="split" value={splitType} onChange={(e) => setSplitType(e.target.value as SplitType)}>
              <option value="equal">Equally</option>
              <option value="shares">By Shares</option>
              <option value="percent">By Percentage</option>
              <option value="manual" disabled>Manually</option>
            </Select>
        </div>

        {(splitType === 'shares' || splitType === 'percent') && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Split Details</h4>
                    {splitType === 'percent' && (
                        <span className={`text-sm font-bold ${isSplitValid ? 'text-green-600' : 'text-red-600'}`}>
                           Total: {splitTotal}%
                        </span>
                    )}
                     {splitType === 'shares' && (
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                           Total: {splitTotal} shares
                        </span>
                    )}
                </div>
                {group.members.map(member => (
                    <div key={member.id} className="flex items-center space-x-2">
                        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{member.name}</span>
                        <Input 
                            type="number"
                            min="0"
                            className="w-24"
                            placeholder={splitType === 'shares' ? 'shares' : '%'}
                            value={splitDetails.find(d => d.userId === member.id)?.value || ''}
                            onChange={(e) => handleSplitDetailChange(member.id, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        )}

        {previewSplits.length > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-sm">
                <p className="font-semibold mb-1">Preview:</p>
                <ul className="list-disc list-inside">
                    {previewSplits.map(s => (
                        <li key={s.userId}>
                            {group.members.find(m => m.id === s.userId)?.name} owes{' '}
                            <strong>{formatCurrency(s.amountCents, group.currency)}</strong>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        
        <ReceiptUploader onReceiptUpload={setReceiptBase64} />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={!isFormValid}>Add Expense</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddExpenseModal;