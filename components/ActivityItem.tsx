
import React from 'react';
import type { Activity, Group, User } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Receipt, Handshake, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { useAppStore } from '../store/useAppStore';

interface ActivityItemProps {
  activity: Activity;
  group: Group;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, group }) => {
  const { user: currentUser } = useAppStore();
  const members = group.members;

  const getUser = (userId: string): User | undefined => members.find(m => m.id === userId);

  if (activity.type === 'expense') {
    const payer = getUser(activity.payerId);
    return (
      <Card>
        <CardContent className="p-4 flex items-start space-x-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Receipt className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-white">{activity.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {payer?.name === currentUser?.name ? 'You' : payer?.name} paid
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-800 dark:text-white">
              {formatCurrency(activity.amountCents, activity.currency)}
            </p>
            <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activity.type === 'settlement') {
    const fromUser = getUser(activity.fromId);
    const toUser = getUser(activity.toId);
    return (
      <Card>
        <CardContent className="p-4 flex items-start space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Handshake className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1 flex items-center">
            <p className="font-semibold text-gray-800 dark:text-white">
              {fromUser?.name === currentUser?.name ? 'You' : fromUser?.name}
            </p>
            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
            <p className="font-semibold text-gray-800 dark:text-white">
              {toUser?.name === currentUser?.name ? 'you' : toUser?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600 dark:text-green-400">
              {formatCurrency(activity.amountCents, activity.currency)}
            </p>
             <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ActivityItem;
