
import React from 'react';
import type { Balance } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent } from './ui/Card';

interface BalanceCardProps {
  balance: Balance | null;
  currency: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, currency }) => {
  const netCents = balance?.netCents ?? 0;
  const isOwed = netCents > 0;
  const isOwing = netCents < 0;
  const isSettled = !isOwed && !isOwing;

  const getStatusText = () => {
    if (isOwed) return "You are owed";
    if (isOwing) return "You owe";
    return "You are all settled up";
  };
  
  const cardBgColor = isOwed
    ? 'bg-green-50 dark:bg-green-900/50'
    : isOwing
    ? 'bg-red-50 dark:bg-red-900/50'
    : 'bg-gray-100 dark:bg-gray-700/50';

  const textColor = isOwed
    ? 'text-green-700 dark:text-green-300'
    : isOwing
    ? 'text-red-700 dark:text-red-300'
    : 'text-gray-700 dark:text-gray-300';
    
  return (
    <Card className={cardBgColor}>
      <CardContent className="p-6 text-center">
        <p className={`text-sm ${textColor}`}>{getStatusText()}</p>
        <p className={`text-4xl font-bold ${textColor}`}>
          {formatCurrency(Math.abs(netCents), currency)}
        </p>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
