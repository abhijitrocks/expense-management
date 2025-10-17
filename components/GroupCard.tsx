
import React from 'react';
import type { Group } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Users } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
  userBalanceText: { text: string; color: string };
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick, userBalanceText }) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{group.members.length} members</span>
          </div>
          <div className={`font-semibold ${userBalanceText.color}`}>{userBalanceText.text}</div>
        </div>
        <div className="flex -space-x-2 mt-4">
          {group.members.slice(0, 5).map(member => (
            <img 
              key={member.id} 
              src={member.avatarUrl} 
              alt={member.name} 
              className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
            />
          ))}
          {group.members.length > 5 && (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white dark:border-gray-800">
              +{group.members.length - 5}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
