import type { Expense, Settlement, User, Balance, SuggestedTransfer, SplitScheme, SplitDetail } from '../types';

/**
 * Calculates the final net balance for each member in a group.
 * @param members - Array of users in the group.
 * @param activities - Array of all expenses and settlements for the group.
 * @returns An array of Balance objects for each member.
 */
export const calculateBalances = (members: User[], activities: (Expense | Settlement)[]): Balance[] => {
  const balances: { [userId: string]: number } = {};
  members.forEach(member => balances[member.id] = 0);

  for (const activity of activities) {
    if (activity.type === 'expense') {
      const expense = activity;
      const shares = splitExpense(expense, members);
      balances[expense.payerId] += expense.amountCents;
      shares.forEach(share => {
        balances[share.userId] -= share.amountCents;
      });
    } else if (activity.type === 'settlement') {
      const settlement = activity;
      balances[settlement.fromId] += settlement.amountCents;
      balances[settlement.toId] -= settlement.amountCents;
    }
  }

  return Object.entries(balances).map(([userId, netCents]) => ({
    userId,
    netCents: Math.round(netCents)
  }));
};

const distributeRemainder = (
    shares: { userId: string, amountCents: number }[],
    remainder: number,
    members: User[],
    payerId: string
) => {
     if (remainder === 0) return;
      // Distribute remainder
      const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
      const payerIndex = sortedMembers.findIndex(m => m.id === payerId);
      
      // Distribute starting from payer
      for (let i = 0; i < remainder; i++) {
        const memberIndex = (payerIndex + i) % sortedMembers.length;
        const memberIdToCredit = sortedMembers[memberIndex].id;
        const shareToUpdate = shares.find(s => s.userId === memberIdToCredit);
        if(shareToUpdate) shareToUpdate.amountCents++;
      }
}


/**
 * Splits an expense amount according to the specified scheme, handling rounding.
 * @param expense - The expense object.
 * @param members - Array of users involved in the split.
 * @returns An array of objects detailing how much each user owes.
 */
export const splitExpense = (expense: Expense, members: User[]): { userId: string; amountCents: number }[] => {
  const { amountCents, splitScheme, payerId } = expense;
  
  let shares: { userId: string; amountCents: number }[] = [];

  switch (splitScheme.type) {
    case 'equal': {
      const shareAmount = Math.floor(amountCents / members.length);
      let remainder = amountCents % members.length;
      shares = members.map(member => ({ userId: member.id, amountCents: shareAmount }));
      distributeRemainder(shares, remainder, members, payerId);
      break;
    }
    case 'shares': {
        const details = splitScheme.details || [];
        const totalShares = details.reduce((sum, detail) => sum + detail.value, 0);
        if (totalShares === 0) return members.map(m => ({ userId: m.id, amountCents: 0 }));

        let calculatedShares: {userId: string, amountCents: number}[] = [];
        let totalCalculated = 0;
        
        for(const detail of details) {
            const individualAmount = Math.floor((detail.value / totalShares) * amountCents);
            calculatedShares.push({userId: detail.userId, amountCents: individualAmount});
            totalCalculated += individualAmount;
        }

        const remainder = amountCents - totalCalculated;
        shares = calculatedShares;
        distributeRemainder(shares, remainder, members, payerId);
        break;
    }
    case 'percent': {
        const details = splitScheme.details || [];
        const totalPercent = details.reduce((sum, detail) => sum + detail.value, 0);
        if (totalPercent !== 100) return members.map(m => ({ userId: m.id, amountCents: 0 }));

        let calculatedShares: {userId: string, amountCents: number}[] = [];
        let totalCalculated = 0;

        for(const detail of details) {
            const individualAmount = Math.floor((detail.value / 100) * amountCents);
            calculatedShares.push({userId: detail.userId, amountCents: individualAmount});
            totalCalculated += individualAmount;
        }

        const remainder = amountCents - totalCalculated;
        shares = calculatedShares;
        distributeRemainder(shares, remainder, members, payerId);
        break;
    }
    default:
       // Fallback to equal split for unimplemented types like 'manual'
      return splitExpense({ ...expense, splitScheme: { type: 'equal' } }, members);
  }
  
  const totalSplit = shares.reduce((sum, s) => sum + s.amountCents, 0);
  if(totalSplit !== amountCents) {
    console.error("Split amount does not match total expense amount!");
    // This should ideally not happen with the remainder distribution logic
  }

  return shares;
};

/**
 * Implements a greedy algorithm to find the minimum number of transfers to settle debts.
 * @param balances - An array of user balances.
 * @returns An array of suggested transfers.
 */
export const simplifyDebts = (balances: Balance[]): SuggestedTransfer[] => {
  const creditors = balances.filter(b => b.netCents > 1).sort((a, b) => b.netCents - a.netCents);
  const debtors = balances.filter(b => b.netCents < -1).sort((a, b) => a.netCents - b.netCents);

  const transfers: SuggestedTransfer[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const amountToTransfer = Math.min(creditor.netCents, Math.abs(debtor.netCents));

    if(amountToTransfer < 1) {
        // Negligible amount, move on
        if(creditor.netCents < Math.abs(debtor.netCents)) creditorIndex++;
        else debtorIndex++;
        continue;
    }

    transfers.push({
      fromId: debtor.userId,
      toId: creditor.userId,
      amountCents: Math.round(amountToTransfer)
    });

    creditor.netCents -= amountToTransfer;
    debtor.netCents += amountToTransfer;

    if (Math.abs(creditor.netCents) < 1) {
      creditorIndex++;
    }
    if (Math.abs(debtor.netCents) < 1) {
      debtorIndex++;
    }
  }

  return transfers;
};