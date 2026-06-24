import { create } from 'zustand';
import { Problem, ProblemStatus, ConfidenceLevel } from '../types';
import { 
  updateDailyGoal, 
  updateStreak, 
  updateProblemStatus, 
  markSolvedAction,
  updateProblemOrder
} from '../app/actions';

const getNextReviewDate = (confidence: ConfidenceLevel): string => {
  const daysToAdd = {
    1: 1,
    2: 3,
    3: 7,
    4: 14,
    5: 30,
  }[confidence];
  
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
};

interface AppState {
  problems: Problem[];
  dailyGoal: number;
  streak: number;
  lastActiveDate: string | null;
  problemOrder: "EasyFirst" | "HardFirst";
  isInitialized: boolean;
  
  // Initialization
  initStore: (problems: Problem[], stats: any) => void;

  // Actions
  setDailyGoal: (goal: number) => Promise<void>;
  setProblemOrder: (order: "EasyFirst" | "HardFirst") => Promise<void>;
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
    isInitialized: false,

    initStore: (fetchedProblems, fetchedStats) => {
      set({ 
        problems: fetchedProblems, 
        dailyGoal: fetchedStats?.dailyGoal || 3,
        streak: fetchedStats?.streak || 0,
        lastActiveDate: fetchedStats?.lastActiveDate || null,
        problemOrder: fetchedStats?.problemOrder || "EasyFirst",
        isInitialized: true
      });
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
      const nextReview = getNextReviewDate(confidence);
      
      // Optimistic update
      set((state) => ({
        problems: state.problems.map(p => {
          if (p.id === id) {
            return {
              ...p,
              status: 'solved',
              attempts: p.attempts + 1,
              solveTime: (p.solveTime || 0) + timeSpent,
              solvedAt: new Date().toISOString(),
              reviewDate: nextReview,
              confidence,
              notes: notes ?? p.notes
            };
          }
          return p;
        })
      }));

      // Async DB write
      await markSolvedAction(id, timeSpent, confidence, notes, nextReview);
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

    getNextProblem: () => {
      const state = get();
      const today = new Date();
      
      const dueReview = state.problems.find(p => 
        p.status === 'solved' && 
        p.reviewDate && 
        new Date(p.reviewDate).getTime() <= today.getTime()
      );
      if (dueReview) return dueReview;

      const explicitReview = state.problems.find(p => p.status === 'review');
      if (explicitReview) return explicitReview;
      
      const pendingProblems = state.problems.filter(p => p.status === 'pending');
      if (pendingProblems.length > 0) {
        if (state.problemOrder === "HardFirst") {
          const difficultyRank = { Hard: 1, Medium: 2, Easy: 3 };
          const sorted = [...pendingProblems].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);
          return sorted[0];
        }
        return pendingProblems[0];
      }
      
      return null;
    }
  })
);
