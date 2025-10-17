
// This component is not used in the main flow but is provided as requested.
// The SimplifyDebtsModal provides a more direct way to settle up.
import React, { useState } from 'react';
import type { Group } from '../types';
import Dialog from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useAppStore } from '../store/useAppStore';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

const SettleUpModal: React.FC<SettleUpModalProps> = ({ isOpen, onClose, group }) => {
  const { user, addSettlement } = useAppStore();
  const [amount, setAmount] = useState('');
  const [fromId, setFromId] = useState(user?.id || '');
  const [toId, setToId] = useState('');
  const [note, setNote] = useState('');

  const handleSettle = async () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || !fromId || !toId || fromId === toId) {
      alert("Please fill in all fields correctly.");
      return;
    }

    await addSettlement({
      groupId: group.id,
      fromId,
      toId,
      amountCents,
      currency: group.currency,
      method: 'cash',
      date: new Date().toISOString(),
      note,
    });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Record a Payment">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">From</label>
          <Select value={fromId} onChange={e => setFromId(e.target.value)}>
            {group.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium">To</label>
          <Select value={toId} onChange={e => setToId(e.target.value)}>
            <option value="">Select recipient</option>
            {group.members.filter(m => m.id !== fromId).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <Input 
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Note (optional)</label>
          <Input 
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g., Rent payment"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSettle}>Record Payment</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default SettleUpModal;
