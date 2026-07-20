import React, { useState, useEffect } from 'react';
import { 
  Shield, User, ChevronRight
} from 'lucide-react';
import { BlogPost, AuthorProfile } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AuthorDossierProps {
  posts: BlogPost[];
  authors?: AuthorProfile[];
  initialSelectedResearcher?: string | null;
  isDark?: boolean;
  onSelectPost: (id: string) => void;
  onClose: () => void;
}

export function AuthorDossier({ 
  posts, 
  authors = [], 
  initialSelectedResearcher, 
  isDark = false,
  onSelectPost, 
  onClose 
}: AuthorDossierProps) {
  
  // Dynamically compile registered & dynamic contributor profiles from loaded authors and posts
  const allResearchers: AuthorProfile[] = [];

  // 1. Seed with loaded author markdown portfolios
  authors.forEach(auth => {
    allResearchers.push({
      id: auth.id,
      name: auth.name,
      alias: auth.alias,
      githubUrl: auth.githubUrl,
      htbUrl: auth.htbUrl,
      role: auth.role,
      bio: auth.bio,
      specialties: auth.specialties,
      content: auth.content,
      active: auth.active,
      published: auth.published
    });
  });

  // 2. Discover other dynamic contributors from posts who are not registered in .md profiles
  posts.filter(p => p.published && !p.draft).forEach(post => {
    const authorName = post.author;
    if (!authorName || authorName.toLowerCase() === 'anonymous') return;

    const lower = authorName.toLowerCase();
    
    // Check if they are already in the researcher list
    const isRegistered = allResearchers.some(r => {
      const rId = r.id.toLowerCase();
      const rName = r.name.toLowerCase();
      const rAlias = r.alias?.toLowerCase();
      return rId === lower || rName === lower || rName.includes(lower) || lower.includes(rName) || (rAlias && rAlias === lower);
    });

    if (isRegistered) {
      // Add specialties dynamically from post categories if matching
      const existing = allResearchers.find(r => r.name.toLowerCase() === lower || r.id.toLowerCase() === lower);
      if (existing) {
        const spec = post.category === 'security' ? 'Security Operations' : post.category === 'malwarere' ? 'Malware Reversing' : 'Threat Analysis';
        if (!existing.specialties.includes(spec)) {
          existing.specialties.push(spec);
        }
      }
      return;
    }

    // Determine safe ID
    const id = lower.replace(/[^a-z0-9]/g, '_');

    // Compile dynamic profile from frontmatter overrides, or use sensible fallbacks
    const alias = post.authorAlias || lower.replace(/[^a-z0-9]/g, '');
    const role = post.authorRole || "Contributing Security Analyst";
    const bio = post.authorBio || `This security researcher authors deep-dive intelligence analyses, cyber threat assessments, and technical dissections on our portal. They coordinate with the core research desk for disclosure and peer reviews.`;
    const specialties = post.authorSpecialties || [
      post.category === 'security' ? 'Security Operations' : post.category === 'malwarere' ? 'Malware Reversing' : 'Threat Analysis'
    ];

    allResearchers.push({
      id,
      name: authorName,
      alias,
      role,
      bio,
      specialties,
      githubUrl: post.authorGithub,
      htbUrl: post.authorHtb,
      content: '', // No separate portfolio page content
      active: true,
      published: true
    });
  });

  // Filter down to visible/active researchers for the display interface
  const visibleResearchers = allResearchers.filter(r => r.active !== false && r.published !== false);

  // State for selected researcher
  const [selectedResearcher, setSelectedResearcher] = useState<string>('nayan');

  // Sync selected researcher with initial prop
  useEffect(() => {
    if (initialSelectedResearcher) {
      setSelectedResearcher(initialSelectedResearcher);
    }
  }, [initialSelectedResearcher]);

  const currentResearcher = visibleResearchers.find(r => r.id === selectedResearcher) || visibleResearchers[0];

  // Map post authors loosely to correspond to researchers
  const researcherPosts = posts.filter(p => {
    if (!p.published || p.draft) return false;
    const authorName = p.author.toLowerCase();
    
    if (currentResearcher.id === 'nayan') {
      return authorName.includes('nayan') || authorName.includes('rande');
    }
    if (currentResearcher.id === 'mandar') {
      return authorName.includes('mandar') || authorName.includes('kulkarni') || authorName.includes('sarah') || authorName.includes('jenkins');
    }
    if (currentResearcher.id === 'offsec') {
      return authorName.includes('offsec') || authorName.includes('research') || authorName.includes('desk') || authorName.includes('group');
    }
    
    const id = authorName.replace(/[^a-z0-9]/g, '_');
    return id === currentResearcher.id;
  });

  return (
    <div className="bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-lg transition-all relative">
      
      {/* Accent Ribbon Bar */}
      <div className="h-1 bg-gradient-to-r from-slate-400 via-rose-500/80 to-slate-500"></div>

      {/* Header Panel */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Shield size={18} />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Research Contributors & Analysts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Meet the security specialists, cryptographers, and reverse engineers authoring our advisories and publications.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold font-sans transition-all"
          >
            Back to Articles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        
        {/* Left Panel: Operator Directory Select */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Contributor Selection Directory */}
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 rounded-xl p-5 space-y-3.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono border-b border-slate-200 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <User size={12} />
              <span>Registered Contributors</span>
            </h3>
            <div className="space-y-1.5">
              {visibleResearchers.map(researcher => (
                <button
                  key={researcher.id}
                  onClick={() => {
                    setSelectedResearcher(researcher.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedResearcher === researcher.id
                      ? 'bg-rose-500/5 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold'
                      : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedResearcher === researcher.id ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {researcher.id === 'offsec' ? <Shield size={14} /> : <User size={14} />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200">
                        {researcher.name}
                        {researcher.alias && (
                          <span className="ml-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            ({researcher.alias})
                          </span>
                        )}
                      </p>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono tracking-tight uppercase">
                        {researcher.role.split('&')[0].trim()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={13} className={selectedResearcher === researcher.id ? 'text-rose-500' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Researcher Portfolio and Authored Articles */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="space-y-6 border border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 rounded-xl p-6">
            <div className="space-y-4">
              <div className="space-y-1 font-sans">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentResearcher.name}
                  </h2>
                  {currentResearcher.alias && (
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 px-1.5 py-0.5 rounded">
                      @{currentResearcher.alias}
                    </span>
                  )}
                  
                  {/* Social/platform links */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {currentResearcher.githubUrl && (
                      <a 
                        href={currentResearcher.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title={`View ${currentResearcher.name} on GitHub`}
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {currentResearcher.htbUrl && (
                      <a 
                        href={currentResearcher.htbUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1 px-1.5 rounded text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/20 text-[10px] font-mono font-bold transition-all leading-none"
                        title={currentResearcher.htbUrl.includes('linkedin') ? `View ${currentResearcher.name} on LinkedIn` : `View ${currentResearcher.name} on HackTheBox`}
                      >
                        {currentResearcher.htbUrl.includes('linkedin') ? 'LN' : 'HTB'}
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-rose-500 dark:text-rose-400 font-mono font-semibold tracking-wide">
                  {currentResearcher.role}
                </p>
              </div>

              {/* Render Portfolio content if it exists, otherwise fallback to bio */}
              <div className={`text-xs leading-relaxed font-sans pt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentResearcher.content ? (
                  <div className={`max-w-none text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <MarkdownRenderer content={currentResearcher.content} isDark={isDark} />
                  </div>
                ) : (
                  <p className="font-medium">
                    {currentResearcher.bio}
                  </p>
                )}
              </div>

              {/* Specialties / Core Expertise Tags */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
                  Areas of Expertise
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentResearcher.specialties.map((spec, sIdx) => (
                    <span 
                      key={sIdx} 
                      className="text-[10.5px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-sans font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Publications & Advisories */}
          <div className="space-y-4 border border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 rounded-xl p-6">
            <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono block border-b border-slate-200 dark:border-slate-800/60 pb-2">
              Authored Articles, Blogs & Learning Materials by {currentResearcher.name}
            </span>

            {researcherPosts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-400 text-xs font-mono">No reports currently published in this index.</p>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                {researcherPosts.map((post) => (
                  <div 
                    key={post.id}
                    onClick={() => onSelectPost(post.id)}
                    className="group border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 bg-white dark:bg-slate-900/40 p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                          /{post.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold uppercase leading-none">
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-white group-hover:text-rose-500 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {post.summary}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-rose-500 transition-colors shrink-0 group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
