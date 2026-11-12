import { create } from 'zustand';
import { SqlProblem, SqlPrerequisite, ConfidenceLevel } from '../types';
import { 
  updateSqlProblemStatus, 
  markSqlSolvedAction,
  togglePrerequisite
} from '../app/actions';
import { pickNextItem, solvedFields, type ProblemOrder } from '@/features/study/schedule';

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
  getNextSqlProblem: (problemOrder: ProblemOrder) => SqlProblem | null;
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
      set((state) => ({
        sqlProblems: state.sqlProblems.map(p => {
          if (p.id !== id) return p;
          const next = solvedFields(p, timeSpent, confidence, notes);
          return { ...p, ...next, notes: next.notes ?? undefined };
        })
      }));

      await markSqlSolvedAction(id, timeSpent, confidence, notes);
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

    getNextSqlProblem: (problemOrder) => pickNextItem(get().sqlProblems, problemOrder),
  })
);
