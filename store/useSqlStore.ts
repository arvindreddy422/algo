import { create } from 'zustand';
import { SqlProblem, SqlPrerequisite, ConfidenceLevel } from '../types';
import { 
  updateSqlProblemStatus, 
  markSqlSolvedAction,
  togglePrerequisite
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

interface SqlState {
  sqlProblems: SqlProblem[];
  sqlPrerequisites: SqlPrerequisite[];
  isInitialized: boolean;
  
  // Initialization
  initSqlStore: (problems: SqlProblem[], prerequisites: SqlPrerequisite[]) => void;

  // Actions
  updateSqlProblem: (id: number, updates: Partial<SqlProblem>) => Promise<void>;
  markSqlSolved: (id: number, timeSpent: number, confidence: ConfidenceLevel, notes?: string) => Promise<void>;
  bookmarkSql: (id: number) => Promise<void>;
  removeSqlBookmark: (id: number) => Promise<void>;
  skipSql: (id: number) => Promise<void>;
  needSqlReview: (id: number) => Promise<void>;
  updateSqlNotes: (id: number, notes: string) => Promise<void>;
  
  togglePrerequisiteStatus: (id: number, completed: boolean) => Promise<void>;
  
  // Getters
  getNextSqlProblem: (problemOrder: "EasyFirst" | "HardFirst") => SqlProblem | null;
}

export const useSqlStore = create<SqlState>()(
  (set, get) => ({
    sqlProblems: [],
    sqlPrerequisites: [],
    isInitialized: false,

    initSqlStore: (fetchedProblems, fetchedPrerequisites) => {
      set({ 
        sqlProblems: fetchedProblems, 
        sqlPrerequisites: fetchedPrerequisites,
        isInitialized: true
      });
    },

    updateSqlProblem: async (id, updates) => {
      set((state) => ({
        sqlProblems: state.sqlProblems.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
      await updateSqlProblemStatus(id, updates); // Sync DB
    },

    markSqlSolved: async (id, timeSpent, confidence, notes) => {
      const nextReview = getNextReviewDate(confidence);
      
      // Optimistic update
      set((state) => ({
        sqlProblems: state.sqlProblems.map(p => {
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
      await markSqlSolvedAction(id, timeSpent, confidence, notes, nextReview);
    },

    bookmarkSql: async (id) => get().updateSqlProblem(id, { status: 'bookmarked' }),
    removeSqlBookmark: async (id) => get().updateSqlProblem(id, { status: 'pending' }),
    skipSql: async (id) => get().updateSqlProblem(id, { status: 'skipped' }),
    needSqlReview: async (id) => get().updateSqlProblem(id, { status: 'review' }),
    updateSqlNotes: async (id, notes) => get().updateSqlProblem(id, { notes }),

    togglePrerequisiteStatus: async (id, completed) => {
      set((state) => ({
        sqlPrerequisites: state.sqlPrerequisites.map(p => p.id === id ? { ...p, completed } : p)
      }));
      await togglePrerequisite(id, completed);
    },

    getNextSqlProblem: (problemOrder) => {
      const state = get();
      const today = new Date();
      
      const dueReview = state.sqlProblems.find(p => 
        p.status === 'solved' && 
        p.reviewDate && 
        new Date(p.reviewDate).getTime() <= today.getTime()
      );
      if (dueReview) return dueReview;

      const explicitReview = state.sqlProblems.find(p => p.status === 'review');
      if (explicitReview) return explicitReview;
      
      const pendingProblems = state.sqlProblems.filter(p => p.status === 'pending');
      if (pendingProblems.length > 0) {
        if (problemOrder === "HardFirst") {
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
