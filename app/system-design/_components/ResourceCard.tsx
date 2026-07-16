import React from 'react';
import { Resource } from '../../../data/systemDesign/types';
import { ExternalLink, FileText, Play, Newspaper } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'paper':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'blog':
      default:
        return <Newspaper className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <a 
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {resource.title}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            {resource.company && <span className="font-medium">{resource.company}</span>}
            {resource.readTime && <span>{resource.readTime} min read</span>}
            {resource.duration && <span>{resource.duration} min watch</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </a>
  );
}
