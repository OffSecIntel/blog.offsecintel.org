import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <div className="py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
        Was this page helpful?
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFeedback('up')}
          className={`p-1.5 rounded-md border transition-all ${
            feedback === 'up' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Yes"
        >
          <ThumbsUp size={16} className={feedback === 'up' ? 'fill-current' : ''} />
        </button>
        <button
          onClick={() => setFeedback('down')}
          className={`p-1.5 rounded-md border transition-all ${
            feedback === 'down' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="No"
        >
          <ThumbsDown size={16} className={feedback === 'down' ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
}
