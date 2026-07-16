"use client";

import React, { useState, useMemo } from 'react';
import { systemDesignBlogPosts } from '../../../data/systemDesign/blogPosts';
import { BlogPostCard } from '../_components/BlogPostCard';
import { Rss, Filter, CheckCircle2, Search } from 'lucide-react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';

export default function BlogFeedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  
  const { readBlogPosts } = useSystemDesignStore();
  
  // Extract unique companies
  const companies = ["All", ...Array.from(new Set(systemDesignBlogPosts.map(p => p.company)))];

  const filteredPosts = useMemo(() => {
    return systemDesignBlogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCompany = selectedCompany === "All" || post.company === selectedCompany;
      return matchesSearch && matchesCompany;
    });
  }, [searchQuery, selectedCompany]);
  
  const totalReadTime = systemDesignBlogPosts
    .filter(p => readBlogPosts.includes(p.id))
    .reduce((acc, p) => acc + p.readTime, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Feed */}
      <div className="flex-1 lg:max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Rss className="w-5 h-5 text-orange-500" />
            Engineering Blog Feed
          </h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search articles or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
        
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-500">No blog posts found matching your criteria.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCompany("All"); }}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Analytics Sidebar */}
      <div className="lg:w-80 shrink-0 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Reading Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Posts Read</span>
              <span className="text-xl font-bold">{readBlogPosts.length}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Time Invested</span>
              <span className="text-xl font-bold">{Math.floor(totalReadTime / 60)}h {totalReadTime % 60}m</span>
            </div>
            <div className="pt-2">
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (readBlogPosts.length / systemDesignBlogPosts.length) * 100)}%` }} 
                />
              </div>
              <p className="text-xs text-center text-zinc-500 mt-2">
                {readBlogPosts.length} of {systemDesignBlogPosts.length} articles read
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter by Company
          </h3>
          <div className="space-y-1">
            {companies.map(company => (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedCompany === company 
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
