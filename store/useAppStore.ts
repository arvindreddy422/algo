import { create } from 'zustand';
import { Problem, ConfidenceLevel } from '../types';
import { 
  updateDailyGoal, 
  updateStreak, 
  updateProblemStatus, 
  markSolvedAction,
  updateProblemOrder
} from '../app/actions';
import { pickNextItem, solvedFields, type ProblemOrder } from '@/features/study/schedule';

interface AppState {
  problems: Problem[];
  dailyGoal: number;
  streak: number;
  lastActiveDate: string | null;
  problemOrder: ProblemOrder;
  isProblemsLoaded: boolean;
  dueCounts: { dsa: number; sql: number };

  initStats: (stats: { dailyGoal?: number; streak?: number; lastActiveDate?: string | null; problemOrder?: ProblemOrder }) => void;
  initProblems: (problems: Problem[]) => void;
  setDueCounts: (counts: { dsa: number; sql: number }) => void;

  // Actions
  setDailyGoal: (goal: number) => Promise<void>;
  setProblemOrder: (order: ProblemOrder) => Promise<void>;
  updateProblem: (id: number, updates: Partial<Problem>) => Promise<void>;
  markSolved: (id: number, timeSpent: number, confidence: ConfidenceLevel, notes?: string) => Promise<void>;
  bookmark: (id: number) => Promise<void>;
  removeBookmark: (id: number) => Promise<void>;
  skip: (id: number) => Promise<void>;
  needReview: (id: number) => Promise<void>;
  updateNotes: (id: number, notes: string) => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  
  // Getters
  getNextProblem: () => Problem | null;
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
    problems: [],
    dailyGoal: 3,
    streak: 0,
    lastActiveDate: null,
    problemOrder: "EasyFirst",
    isProblemsLoaded: false,
    dueCounts: { dsa: 0, sql: 0 },

    initStats: (fetchedStats) => {
      set({
        dailyGoal: fetchedStats?.dailyGoal || 3,
        streak: fetchedStats?.streak || 0,
        lastActiveDate: fetchedStats?.lastActiveDate || null,
        problemOrder: fetchedStats?.problemOrder || "EasyFirst",
      });
    },

    initProblems: (fetchedProblems) => {
      set({ problems: fetchedProblems, isProblemsLoaded: true });
    },

    setDueCounts: (counts) => {
      set({ dueCounts: counts });
    },

    setDailyGoal: async (goal) => {
      set({ dailyGoal: goal });
      await updateDailyGoal(goal); // Sync to DB
    },

    setProblemOrder: async (order) => {
      set({ problemOrder: order });
      await updateProblemOrder(order); // Sync to DB
    },

    updateProblem: async (id, updates) => {
      set((state) => ({
        problems: state.problems.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
      await updateProblemStatus(id, updates); // Sync DB
    },

    markSolved: async (id, timeSpent, confidence, notes) => {
      set((state) => ({
        problems: state.problems.map(p => {
          if (p.id !== id) return p;
          const next = solvedFields(p, timeSpent, confidence, notes);
          return { ...p, ...next, notes: next.notes ?? undefined };
        })
      }));

      await markSolvedAction(id, timeSpent, confidence, notes);
    },

    bookmark: async (id) => get().updateProblem(id, { status: 'bookmarked' }),
    removeBookmark: async (id) => get().updateProblem(id, { status: 'pending' }),
    skip: async (id) => get().updateProblem(id, { status: 'skipped' }),
    needReview: async (id) => get().updateProblem(id, { status: 'review' }),
    updateNotes: async (id, notes) => get().updateProblem(id, { notes }),

    checkAndUpdateStreak: async () => {
      const state = get();
      const today = new Date().toISOString().split('T')[0];
      
      let newStreak = state.streak;
      let newLastActive = state.lastActiveDate;

      if (!state.lastActiveDate) {
        newLastActive = today;
        newStreak = 1;
      } else if (state.lastActiveDate !== today) {
        const lastActive = new Date(state.lastActiveDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newLastActive = today;
          newStreak = state.streak + 1;
        } else {
          newLastActive = today;
          newStreak = 1;
        }
      }

      if (newStreak !== state.streak || newLastActive !== state.lastActiveDate) {
        set({ lastActiveDate: newLastActive, streak: newStreak });
        await updateStreak(newStreak, newLastActive!); // Sync DB
      }
    },

    getNextProblem: () => pickNextItem(get().problems, get().problemOrder),
  })
);
