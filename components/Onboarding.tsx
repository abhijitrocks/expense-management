
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Wallet } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { updateUser, init } = useAppStore();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // In mock setup, we update a placeholder user. A real app would create a new user.
      await updateUser({ name, defaultCurrency: currency });
      await init(); // Re-initialize the app state with the new user
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-indigo-600" />
          <CardTitle className="mt-2">Welcome to ExpenseShare</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Currency
              </label>
              <Select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
