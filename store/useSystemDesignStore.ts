import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { systemDesignTopics } from '../data/systemDesign/topics';

type TopicStatus = 'not-started' | 'in-progress' | 'mastered';
type QuestionStatus = 'not-ready' | 'learning' | 'ready' | 'mastered';

interface TopicProgress {
  topicId: string;
  status: TopicStatus;
  studyDate?: string;
  nextReviewDate?: string;
  timesReviewed: number;
}

interface SystemDesignState {
  // Streak & Activity
  streakDays: number;
  streakStartDate: string | null;
  lastStudyDate: string | null;
  totalStudyMinutes: number;
  weeklyStudyLog: Record<string, number>; // date (YYYY-MM-DD) -> minutes
  
  // Progress Data
  topicsStatus: Record<string, TopicProgress>;
  questionStatus: Record<string, QuestionStatus>;
  
  // Lists
  favorites: string[];
  readBlogPosts: string[];
  achievements: string[];
  
  // Actions
  markTopicStudied: (topicId: string, minutesSpent: number) => void;
  updateTopicStatus: (topicId: string, status: TopicStatus) => void;
  toggleFavorite: (topicId: string) => void;
  setQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  markBlogRead: (blogId: string, readTime: number) => void;
  addStudyTime: (minutes: number) => void;
  getDailyChallengeTopic: () => string; // Returns a topic ID based on the current date
  
  // Helper / Utility
  checkAndUpdateStreak: () => void;
}

const getDeterministicTopicForToday = (): string => {
  const today = new Date();
  // Use YYYY-MM-DD as seed
  const seedString = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
  
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % systemDesignTopics.length;
  return systemDesignTopics[index].id;
};

export const useSystemDesignStore = create<SystemDesignState>()(
  persist(
    (set, get) => ({
      streakDays: 0,
      streakStartDate: null,
      lastStudyDate: null,
      totalStudyMinutes: 0,
      weeklyStudyLog: {},
      
      topicsStatus: {},
      questionStatus: {},
      favorites: [],
      readBlogPosts: [],
      achievements: [],
      
      checkAndUpdateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.lastStudyDate === today) return; // Already studied today
        
        let newStreak = state.streakDays;
        let newStartDate = state.streakStartDate;
        
        if (!state.lastStudyDate) {
          // First time ever studying
        } else {
          const lastActive = new Date(state.lastStudyDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const lastActiveStr = lastActive.toISOString().split('T')[0];
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActiveStr !== yesterdayStr && lastActiveStr !== today) {
            // Streak broken
            newStreak = 0;
            newStartDate = null;
          }
        }
        
        // We only update the date when they actually study something, not just by opening the app.
        // So this function just resets the streak if it's broken.
        if (newStreak === 0 && state.streakDays > 0) {
          set({ streakDays: 0, streakStartDate: null });
        }
      },
      
      addStudyTime: (minutes: number) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const log = { ...state.weeklyStudyLog };
          log[today] = (log[today] || 0) + minutes;
          return {
            totalStudyMinutes: state.totalStudyMinutes + minutes,
            weeklyStudyLog: log
          };
        });
      },
      
      markTopicStudied: (topicId: string, minutesSpent: number) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => {
          let newStreak = state.streakDays;
          let newStartDate = state.streakStartDate;
          
          if (state.lastStudyDate !== today) {
            // They studied today for the first time
            newStreak = state.streakDays === 0 ? 1 : state.streakDays + 1;
            if (!newStartDate) newStartDate = today;
            
            // Check for achievements
            // (Leaving achievement logic out for brevity, but this is where it'd go)
          }
          
          const currentTopic = state.topicsStatus[topicId] || { 
            topicId, 
            timesReviewed: 0 
          };
          
          // Simple next review date logic (+3 days)
          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + 3);
          
          return {
            lastStudyDate: today,
            streakDays: newStreak,
            streakStartDate: newStartDate,
            topicsStatus: {
              ...state.topicsStatus,
              [topicId]: {
                ...currentTopic,
                status: 'mastered',
                studyDate: today,
                nextReviewDate: nextReview.toISOString().split('T')[0],
                timesReviewed: currentTopic.timesReviewed + 1
              }
            }
          };
        });
        
        get().addStudyTime(minutesSpent);
      },
      
      updateTopicStatus: (topicId: string, status: TopicStatus) => {
        set((state) => {
          const current = state.topicsStatus[topicId] || { topicId, timesReviewed: 0 };
          return {
            topicsStatus: {
              ...state.topicsStatus,
              [topicId]: { ...current, status }
            }
          };
        });
      },
      
      toggleFavorite: (topicId: string) => {
        set((state) => {
          const isFav = state.favorites.includes(topicId);
          return {
            favorites: isFav 
              ? state.favorites.filter(id => id !== topicId)
              : [...state.favorites, topicId]
          };
        });
      },
      
      setQuestionStatus: (questionId: string, status: QuestionStatus) => {
        set((state) => ({
          questionStatus: {
            ...state.questionStatus,
            [questionId]: status
          }
        }));
      },
      
      markBlogRead: (blogId: string, readTime: number) => {
        const state = get();
        if (!state.readBlogPosts.includes(blogId)) {
          set({
            readBlogPosts: [...state.readBlogPosts, blogId]
          });
          state.addStudyTime(readTime);
          
          const today = new Date().toISOString().split('T')[0];
          if (state.lastStudyDate !== today) {
             // Basic streak update just in case reading a blog is their only activity
             let newStreak = state.streakDays === 0 ? 1 : state.streakDays + 1;
             set({ lastStudyDate: today, streakDays: newStreak });
          }
        }
      },
      
      getDailyChallengeTopic: () => {
        return getDeterministicTopicForToday();
      }
    }),
    {
      name: 'system-design-storage', // key in localStorage
    }
  )
);
