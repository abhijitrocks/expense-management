
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Wallet } from 'lucide-react';

const TopNav: React.FC = () => {
  const { user } = useAppStore();

  return (
    <nav className="flex justify-between items-center py-2">
      <div className="flex items-center space-x-2">
        <Wallet className="h-8 w-8 text-indigo-600" />
        <span className="text-xl font-bold text-gray-800 dark:text-white">ExpenseShare</span>
      </div>
      <div>
        <img
          src={user?.avatarUrl}
          alt={user?.name}
          className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200"
        />
      </div>
    </nav>
  );
};

export default TopNav;
