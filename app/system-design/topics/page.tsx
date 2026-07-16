"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { systemDesignTopics } from '../../../data/systemDesign/topics';
import { TopicCard } from '../_components/TopicCard';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Handle hash in URL for automatic scrolling/highlighting
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-4', 'dark:ring-offset-zinc-950');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-4', 'dark:ring-offset-zinc-950');
          }, 2000);
        }, 100);
      }
    }
  }, []);
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(systemDesignTopics.map(t => t.category)))];

  const filteredTopics = useMemo(() => {
    return systemDesignTopics.filter(topic => {
      const matchesSearch = 
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.keyConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="lg:w-64 shrink-0">
        <div className="sticky top-6 space-y-6">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search topics or concepts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="space-y-1">
              {categories.map(category => {
                const count = category === "All" 
                  ? systemDesignTopics.length 
                  : systemDesignTopics.filter(t => t.category === category).length;
                  
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category 
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedCategory === category 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Topic Explorer
          </h2>
          <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
            {filteredTopics.length} topics found
          </span>
        </div>
        
        {filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredTopics.map(topic => (
              <div key={topic.id} id={topic.id} className="transition-all duration-300 rounded-2xl">
                <TopicCard topic={topic} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl border-dashed">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold mb-2">No topics found</h3>
            <p className="text-zinc-500">Try adjusting your search query or filters.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
