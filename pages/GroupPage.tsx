
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Scale } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import * as mockApi from '../lib/mockApi';
import type { Group, Activity } from '../types';
import BalanceCard from '../components/BalanceCard';
import ActivityFeed from '../components/ActivityFeed';
import { Button } from '../components/ui/Button';
import AddExpenseModal from '../components/AddExpenseModal';
import SimplifyDebtsModal from '../components/SimplifyDebtsModal';
import { calculateBalances } from '../utils/calc';

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, fetchActivities, activities: allActivities } = useAppStore();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isSimplifyOpen, setSimplifyOpen] = useState(false);

  const activities = useMemo(() => allActivities[id || ''] || [], [allActivities, id]);

  useEffect(() => {
    if (id) {
      mockApi.getGroupById(id).then(setGroup);
      fetchActivities(id);
    }
  }, [id, fetchActivities]);

  const balances = useMemo(() => {
    if (!group) return [];
    return calculateBalances(group.members, activities);
  }, [group, activities]);

  const userBalance = useMemo(() => {
    if (!user) return null;
    return balances.find(b => b.userId === user.id) || null;
  }, [balances, user]);

  if (!group || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading group...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <header className="flex items-center justify-between mb-4">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{group.name}</h1>
        <Button variant="ghost" size="icon" onClick={() => setSimplifyOpen(true)}>
          <Scale className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </Button>
      </header>

      <main>
        <BalanceCard balance={userBalance} currency={group.currency} />
        
        <div className="my-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Members</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {group.members.map(member => (
              <div key={member.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
                <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        <ActivityFeed activities={activities} group={group} />
      </main>

      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full shadow-lg h-16 w-16" onClick={() => setAddExpenseOpen(true)}>
          <Plus className="h-8 w-8" />
          <span className="sr-only">Add Expense</span>
        </Button>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        group={group}
      />
      <SimplifyDebtsModal
        isOpen={isSimplifyOpen}
        onClose={() => setSimplifyOpen(false)}
        group={group}
        balances={balances}
      />
    </div>
  );
};

export default GroupPage;
