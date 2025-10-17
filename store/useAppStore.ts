
import { create } from 'zustand';
import type { User, Group, Expense, Settlement, Activity } from '../types';
import * as mockApi from '../lib/mockApi';

interface AppState {
  user: User | null;
  groups: Group[];
  activities: { [groupId: string]: Activity[] };
  isLoading: boolean;
  init: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchActivities: (groupId: string) => Promise<void>;
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt'>) => Promise<Group>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'type'>) => Promise<void>;
  addSettlement: (settlementData: Omit<Settlement, 'id' | 'type'>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  groups: [],
  activities: {},
  isLoading: true,
  
  init: async () => {
    set({ isLoading: true });
    await mockApi.initMockData();
    const user = await mockApi.getCurrentUser();
    if (user) {
      const groups = await mockApi.getGroups();
      set({ user, groups, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    const updatedUser = await mockApi.updateUser(userData);
    set({ user: updatedUser });
  },

  fetchGroups: async () => {
    set({ isLoading: true });
    const groups = await mockApi.getGroups();
    set({ groups, isLoading: false });
  },

  fetchActivities: async (groupId: string) => {
    set(state => ({ isLoading: true, activities: { ...state.activities, [groupId]: [] } }));
    const activities = await mockApi.getGroupActivities(groupId);
    set(state => ({
      activities: { ...state.activities, [groupId]: activities },
      isLoading: false,
    }));
  },

  createGroup: async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<Group> => {
    const newGroup = await mockApi.createGroup(groupData);
    set(state => ({ groups: [...state.groups, newGroup] }));
    return newGroup;
  },

  addExpense: async (expenseData: Omit<Expense, 'id' | 'type'>) => {
    await mockApi.addExpense(expenseData);
    get().fetchActivities(expenseData.groupId); // Refresh activities for the group
  },

  addSettlement: async (settlementData: Omit<Settlement, 'id' | 'type'>) => {
    await mockApi.addSettlement(settlementData);
    get().fetchActivities(settlementData.groupId); // Refresh activities for the group
  },
}));
