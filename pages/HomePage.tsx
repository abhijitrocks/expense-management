
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import TopNav from '../components/TopNav';
import GroupCard from '../components/GroupCard';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Activity } from '../types';
import { calculateBalances } from '../utils/calc';
import { formatCurrency } from '../utils/formatters';

const HomePage: React.FC = () => {
  const { user, groups, fetchGroups } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // This is inefficient as it fetches all activities for all groups.
  // In a real app, the backend would provide the user's balance per group.
  const [balances, setBalances] = React.useState<{[groupId: string]: number}>({});

  useEffect(() => {
    const fetchAllBalances = async () => {
      if(!user) return;
      const allBalances: {[groupId: string]: number} = {};
      for (const group of groups) {
        // This is a mock API call, so we can't import it directly.
        // We'll simulate fetching activities for balance calculation.
        const activities: Activity[] = await (window as any).mockApi.getGroupActivities(group.id);
        const groupBalances = calculateBalances(group.members, activities);
        const userBalance = groupBalances.find(b => b.userId === user.id);
        if (userBalance) {
          allBalances[group.id] = userBalance.netCents;
        }
      }
      setBalances(allBalances);
    };
    // Expose mockApi for balance calculation on home page
    import('../lib/mockApi').then(api => {
        (window as any).mockApi = api;
        fetchAllBalances();
    });
  }, [groups, user]);


  return (
    <div className="p-4 md:p-6 min-h-screen">
      <TopNav />
      <header className="my-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Groups</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.name}!
        </p>
      </header>

      <div className="space-y-4">
        {groups.map((group) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            onClick={() => navigate(`/group/${group.id}`)}
            userBalanceText={
              balances[group.id] !== undefined 
                ? formatBalance(balances[group.id], group.currency)
                // FIX: Changed 'Loading...' to an object to match the prop type.
                : { text: 'Loading...', color: 'text-gray-500' }
            }
          />
        ))}
      </div>

      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full shadow-lg h-16 w-16">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Create Group</span>
        </Button>
      </div>
    </div>
  );
};

function formatBalance(balanceCents: number, currency: string): {text: string, color: string} {
    if (Math.abs(balanceCents) < 1) {
        return { text: "All settled up", color: "text-gray-500" };
    }
    if (balanceCents > 0) {
        return { text: `You are owed ${formatCurrency(balanceCents, currency)}`, color: "text-green-600" };
    }
    return { text: `You owe ${formatCurrency(Math.abs(balanceCents), currency)}`, color: "text-red-600" };
}

export default HomePage;