import React from 'react';
import { BlogPost } from '../../../data/systemDesign/types';
import { CheckCircle2, Clock } from 'lucide-react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const { readBlogPosts, markBlogRead } = useSystemDesignStore();
  const isRead = readBlogPosts.includes(post.id);

  // Use a pseudo-random color based on company name for the logo avatar
  const hash = post.company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    'bg-red-500 text-white', 'bg-blue-500 text-white', 'bg-emerald-500 text-white', 
    'bg-purple-500 text-white', 'bg-orange-500 text-white', 'bg-indigo-500 text-white'
  ];
  const colorClass = colors[hash % colors.length];

  return (
    <div className={cn(
      "group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all",
      isRead 
        ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-transparent opacity-75"
        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm"
    )}>
      <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:w-12">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm", colorClass)}>
          {post.company.charAt(0)}
        </div>
        <div className="sm:hidden text-sm font-medium text-zinc-500">
          {post.company}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a>
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="hidden sm:inline">{post.company}</span>
              <span className="hidden sm:inline">•</span>
              <span>{post.publishedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readTime} min read
              </span>
            </div>
          </div>
          
          <button
            onClick={() => markBlogRead(post.id, post.readTime)}
            disabled={isRead}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              isRead 
                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 cursor-default"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isRead ? "Read" : "Mark as read"}
          </button>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
