
import type { User, Group, Expense, Settlement, Activity } from '../types';
import { storage } from './storage';

const MOCK_API_DELAY = 500; // ms

const CURRENT_USER_ID = 'user_signed_in';
const MOCK_USERS_KEY = 'mock_users';
const MOCK_GROUPS_KEY = 'mock_groups';
const MOCK_EXPENSES_KEY = 'mock_expenses';
const MOCK_SETTLEMENTS_KEY = 'mock_settlements';

// --- SEED DATA ---
const createInitialData = () => {
  const users: User[] = [
    { id: CURRENT_USER_ID, name: 'You', avatarUrl: 'https://picsum.photos/seed/you/100', defaultCurrency: 'USD' },
    { id: 'user_a', name: 'Alice', avatarUrl: 'https://picsum.photos/seed/alice/100', defaultCurrency: 'USD' },
    { id: 'user_b', name: 'Bob', avatarUrl: 'https://picsum.photos/seed/bob/100', defaultCurrency: 'INR' },
    { id: 'user_c', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100', defaultCurrency: 'EUR' },
    { id: 'user_d', name: 'David', avatarUrl: 'https://picsum.photos/seed/david/100', defaultCurrency: 'USD' },
  ];

  const groups: Group[] = [
    { 
      id: 'grp_goa', 
      name: 'Trip to Goa', 
      members: [users[0], users[1], users[2], users[3]], 
      currency: 'INR', 
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'grp_flat', 
      name: 'Flatmates', 
      members: [users[0], users[1], users[4]], 
      currency: 'USD', 
      createdAt: new Date().toISOString() 
    },
  ];

  const expenses: Expense[] = [
    {
      type: 'expense', id: 'exp_001', groupId: 'grp_goa', payerId: 'user_a', amountCents: 12000, currency: 'INR',
      date: '2025-10-10T12:00:00.000Z', description: 'Scuba diving', splitScheme: { type: 'equal' }
    },
    {
      type: 'expense', id: 'exp_002', groupId: 'grp_goa', payerId: CURRENT_USER_ID, amountCents: 5000, currency: 'INR',
      date: '2025-10-11T12:00:00.000Z', description: 'Lunch', splitScheme: { type: 'equal' }
    },
     {
      type: 'expense', id: 'exp_003', groupId: 'grp_flat', payerId: 'user_d', amountCents: 9000, currency: 'USD',
      date: '2025-10-11T18:00:00.000Z', description: 'Groceries', splitScheme: { type: 'equal' }
    },
  ];
  
  const settlements: Settlement[] = [];

  storage.setItem(MOCK_USERS_KEY, users);
  storage.setItem(MOCK_GROUPS_KEY, groups);
  storage.setItem(MOCK_EXPENSES_KEY, expenses);
  storage.setItem(MOCK_SETTLEMENTS_KEY, settlements);
};

export const initMockData = async (): Promise<void> => {
  return new Promise(resolve => {
    if (!storage.getItem(MOCK_USERS_KEY)) {
      createInitialData();
    }
    resolve();
  });
};

const simulateApi = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, MOCK_API_DELAY);
  });
};


// --- API FUNCTIONS ---
// TODO: Replace these functions with real API calls

export const getCurrentUser = async (): Promise<User | null> => {
  const users = storage.getItem<User[]>(MOCK_USERS_KEY) || [];
  const user = users.find(u => u.id === CURRENT_USER_ID);
  return simulateApi(user || null);
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const users = storage.getItem<User[]>(MOCK_USERS_KEY) || [];
  let updatedUser: User | null = null;
  const newUsers = users.map(u => {
    if (u.id === CURRENT_USER_ID) {
      updatedUser = { ...u, ...userData };
      return updatedUser;
    }
    return u;
  });
  storage.setItem(MOCK_USERS_KEY, newUsers);
  if (!updatedUser) throw new Error("User not found");
  return simulateApi(updatedUser);
};


export const getUsers = async (): Promise<User[]> => {
    const users = storage.getItem<User[]>(MOCK_USERS_KEY) || [];
    return simulateApi(users);
}

export const getGroups = async (): Promise<Group[]> => {
  const groups = storage.getItem<Group[]>(MOCK_GROUPS_KEY) || [];
  return simulateApi(groups);
};

export const getGroupById = async (id: string): Promise<Group | undefined> => {
    const groups = storage.getItem<Group[]>(MOCK_GROUPS_KEY) || [];
    const group = groups.find(g => g.id === id);
    return simulateApi(group);
}

export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<Group> => {
    const groups = storage.getItem<Group[]>(MOCK_GROUPS_KEY) || [];
    const newGroup: Group = {
        ...groupData,
        id: `grp_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    storage.setItem(MOCK_GROUPS_KEY, [...groups, newGroup]);
    return simulateApi(newGroup);
};

export const getGroupActivities = async (groupId: string): Promise<Activity[]> => {
    const expenses = storage.getItem<Expense[]>(MOCK_EXPENSES_KEY) || [];
    const settlements = storage.getItem<Settlement[]>(MOCK_SETTLEMENTS_KEY) || [];
    
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    const groupSettlements = settlements.filter(s => s.groupId === groupId);

    const activities: Activity[] = [...groupExpenses, ...groupSettlements];
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return simulateApi(activities);
}

export const addExpense = async (expenseData: Omit<Expense, 'id' | 'type'>): Promise<Expense> => {
    const expenses = storage.getItem<Expense[]>(MOCK_EXPENSES_KEY) || [];
    const newExpense: Expense = {
        ...expenseData,
        type: 'expense',
        id: `exp_${Date.now()}`,
    };
    storage.setItem(MOCK_EXPENSES_KEY, [...expenses, newExpense]);
    return simulateApi(newExpense);
};

export const addSettlement = async (settlementData: Omit<Settlement, 'id' | 'type'>): Promise<Settlement> => {
    const settlements = storage.getItem<Settlement[]>(MOCK_SETTLEMENTS_KEY) || [];
    const newSettlement: Settlement = {
        ...settlementData,
        type: 'settlement',
        id: `set_${Date.now()}`,
    };
    storage.setItem(MOCK_SETTLEMENTS_KEY, [...settlements, newSettlement]);
    return simulateApi(newSettlement);
}
