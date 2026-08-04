import React from 'react';
import { Activity } from 'lucide-react';
import { BlogPost } from '../../types';

export function RecentIntelWidget({
  currentPostId,
  posts,
  themeClasses,
  onSelectPost
}: {
  currentPostId: string;
  posts: BlogPost[];
  themeClasses: any;
  onSelectPost: (id: string) => void;
}) {
  const recent = posts
    .filter(p => p.id !== currentPostId && p.published)
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
        <Activity size={12} className={themeClasses.text} />
        <span>Recent Investigations</span>
      </h4>
      <div className="space-y-2.5">
        {recent.map((p) => {
          const sev = p.threatIntel?.severity || 'info';
          const sevColor =
            sev === 'critical' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
              sev === 'high' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                sev === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                  'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';

          return (
            <div
              key={p.id}
              onClick={() => onSelectPost(p.id)}
              className="group cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 hover:bg-slate-100/75 dark:hover:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
            >
              <div className="flex justify-between items-center gap-2 mb-1.5">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">/{p.category}</span>
                <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border leading-none ${sevColor}`}>
                  {sev}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                {p.title}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">{p.date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
