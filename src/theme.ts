/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemeClasses {
  primary: string;
  primaryBg: string;
  primaryBgHover: string;
  primaryBgMuted: string;
  
  secondary: string;
  secondaryBg: string;
  secondaryBgMuted: string;
  
  fontMain: string;
  fontSec: string;
  fontMuted: string;
  
  bgPage: string;
  bgCard: string;
  bgInput: string;
  
  border: string;
  borderMuted: string;
  borderFocus: string;
  
  selection: string;
  scrollBar: string;
  
  complementaryText: string;
  complementaryBg: string;
  complementaryBorder: string;
  
  inlineCodeText: string;
  inlineCodeBg: string;
  inlineCodeBorder: string;
  
  blockquoteText: string;
  blockquoteBg: string;
  blockquoteBorder: string;

  accentHex: string;
  text: string;           // Legacy compatibility
  textHover: string;      // Legacy compatibility
  bg: string;             // Legacy compatibility
  bgHover: string;        // Legacy compatibility
  bgLight: string;        // Legacy compatibility
}

export const getThemeColorClasses = (color?: string, isDark?: boolean): ThemeClasses => {
  const norm = (color || 'crimson').toLowerCase();
  
  // Base font colors & background colors depending on mode
  const fontMain = isDark ? 'text-slate-100' : 'text-slate-900';
  const fontSec = isDark ? 'text-slate-300' : 'text-slate-700';
  const fontMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const bgPage = isDark ? 'bg-[#0b0f19]' : 'bg-[#f8fafc]';
  const bgCard = isDark ? 'bg-[#0d1321]' : 'bg-white';
  const bgInput = isDark ? 'bg-[#0b0f19]/80' : 'bg-slate-50';

  switch (norm) {
    case 'emerald':
      return {
        primary: isDark ? 'text-emerald-400' : 'text-emerald-700',
        primaryBg: isDark ? 'bg-emerald-500' : 'bg-emerald-600',
        primaryBgHover: isDark ? 'hover:bg-emerald-600' : 'hover:bg-emerald-700',
        primaryBgMuted: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
        
        secondary: isDark ? 'text-teal-400' : 'text-teal-700',
        secondaryBg: isDark ? 'bg-teal-500' : 'bg-teal-600',
        secondaryBgMuted: isDark ? 'bg-teal-500/10' : 'bg-teal-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
        borderMuted: isDark ? 'border-emerald-500/10' : 'border-emerald-100',
        borderFocus: 'focus:ring-emerald-500',
        
        selection: isDark ? 'selection:bg-emerald-500/20' : 'selection:bg-emerald-500/10',
        scrollBar: 'bg-emerald-500',
        
        complementaryText: isDark ? 'text-amber-400' : 'text-amber-700',
        complementaryBg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
        complementaryBorder: isDark ? 'border-amber-500/20' : 'border-amber-200',
        
        inlineCodeText: isDark ? 'text-emerald-400' : 'text-emerald-700',
        inlineCodeBg: isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/50',
        inlineCodeBorder: isDark ? 'border-emerald-500/20' : 'border-emerald-200/50',
        
        blockquoteText: isDark ? 'text-emerald-300' : 'text-emerald-800',
        blockquoteBg: isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/20',
        blockquoteBorder: isDark ? 'border-emerald-500/40' : 'border-emerald-500/30',
        
        accentHex: '#10b981',
        text: isDark ? 'text-emerald-400' : 'text-emerald-600',
        textHover: isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600',
        bg: 'bg-emerald-500',
        bgHover: 'hover:bg-emerald-600',
        bgLight: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      };
    case 'cyan':
      return {
        primary: isDark ? 'text-cyan-400' : 'text-cyan-700',
        primaryBg: isDark ? 'bg-cyan-500' : 'bg-cyan-600',
        primaryBgHover: isDark ? 'hover:bg-cyan-600' : 'hover:bg-cyan-700',
        primaryBgMuted: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
        
        secondary: isDark ? 'text-indigo-400' : 'text-indigo-700',
        secondaryBg: isDark ? 'bg-indigo-500' : 'bg-indigo-600',
        secondaryBgMuted: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-cyan-500/20' : 'border-cyan-200',
        borderMuted: isDark ? 'border-cyan-500/10' : 'border-cyan-100',
        borderFocus: 'focus:ring-cyan-500',
        
        selection: isDark ? 'selection:bg-cyan-500/20' : 'selection:bg-cyan-500/10',
        scrollBar: 'bg-cyan-500',
        
        complementaryText: isDark ? 'text-rose-400' : 'text-rose-700',
        complementaryBg: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
        complementaryBorder: isDark ? 'border-rose-500/20' : 'border-rose-200',
        
        inlineCodeText: isDark ? 'text-cyan-400' : 'text-cyan-700',
        inlineCodeBg: isDark ? 'bg-cyan-500/5' : 'bg-cyan-50/50',
        inlineCodeBorder: isDark ? 'border-cyan-500/20' : 'border-cyan-200/50',
        
        blockquoteText: isDark ? 'text-cyan-300' : 'text-cyan-800',
        blockquoteBg: isDark ? 'bg-cyan-500/5' : 'bg-cyan-50/20',
        blockquoteBorder: isDark ? 'border-cyan-500/40' : 'border-cyan-500/30',
        
        accentHex: '#06b6d4',
        text: isDark ? 'text-cyan-400' : 'text-cyan-600',
        textHover: isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600',
        bg: 'bg-cyan-500',
        bgHover: 'hover:bg-cyan-600',
        bgLight: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
      };
    case 'amber':
      return {
        primary: isDark ? 'text-amber-400' : 'text-amber-700',
        primaryBg: isDark ? 'bg-amber-500' : 'bg-amber-600',
        primaryBgHover: isDark ? 'hover:bg-amber-600' : 'hover:bg-amber-700',
        primaryBgMuted: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
        
        secondary: isDark ? 'text-orange-400' : 'text-orange-700',
        secondaryBg: isDark ? 'bg-orange-500' : 'bg-orange-600',
        secondaryBgMuted: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-amber-500/20' : 'border-amber-200',
        borderMuted: isDark ? 'border-amber-500/10' : 'border-amber-100',
        borderFocus: 'focus:ring-amber-500',
        
        selection: isDark ? 'selection:bg-amber-500/20' : 'selection:bg-amber-500/10',
        scrollBar: 'bg-amber-500',
        
        complementaryText: isDark ? 'text-violet-400' : 'text-violet-700',
        complementaryBg: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
        complementaryBorder: isDark ? 'border-violet-500/20' : 'border-violet-200',
        
        inlineCodeText: isDark ? 'text-amber-400' : 'text-amber-700',
        inlineCodeBg: isDark ? 'bg-amber-500/5' : 'bg-amber-50/50',
        inlineCodeBorder: isDark ? 'border-amber-500/20' : 'border-amber-200/50',
        
        blockquoteText: isDark ? 'text-amber-300' : 'text-amber-800',
        blockquoteBg: isDark ? 'bg-amber-500/5' : 'bg-amber-50/20',
        blockquoteBorder: isDark ? 'border-amber-500/40' : 'border-amber-500/30',
        
        accentHex: '#f59e0b',
        text: isDark ? 'text-amber-400' : 'text-amber-600',
        textHover: isDark ? 'hover:text-amber-400' : 'hover:text-amber-600',
        bg: 'bg-amber-500',
        bgHover: 'hover:bg-amber-600',
        bgLight: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      };
    case 'violet':
      return {
        primary: isDark ? 'text-violet-400' : 'text-violet-700',
        primaryBg: isDark ? 'bg-violet-500' : 'bg-violet-600',
        primaryBgHover: isDark ? 'hover:bg-violet-600' : 'hover:bg-violet-700',
        primaryBgMuted: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
        
        secondary: isDark ? 'text-fuchsia-400' : 'text-fuchsia-700',
        secondaryBg: isDark ? 'bg-fuchsia-500' : 'bg-fuchsia-600',
        secondaryBgMuted: isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-violet-500/20' : 'border-violet-200',
        borderMuted: isDark ? 'border-violet-500/10' : 'border-violet-100',
        borderFocus: 'focus:ring-violet-500',
        
        selection: isDark ? 'selection:bg-violet-500/20' : 'selection:bg-violet-500/10',
        scrollBar: 'bg-violet-500',
        
        complementaryText: isDark ? 'text-emerald-400' : 'text-emerald-700',
        complementaryBg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
        complementaryBorder: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
        
        inlineCodeText: isDark ? 'text-violet-400' : 'text-violet-700',
        inlineCodeBg: isDark ? 'bg-violet-500/5' : 'bg-violet-50/50',
        inlineCodeBorder: isDark ? 'border-violet-500/20' : 'border-violet-200/50',
        
        blockquoteText: isDark ? 'text-violet-300' : 'text-violet-800',
        blockquoteBg: isDark ? 'bg-violet-500/5' : 'bg-violet-50/20',
        blockquoteBorder: isDark ? 'border-violet-500/40' : 'border-violet-500/30',
        
        accentHex: '#8b5cf6',
        text: isDark ? 'text-violet-400' : 'text-violet-600',
        textHover: isDark ? 'hover:text-violet-400' : 'hover:text-violet-600',
        bg: 'bg-violet-500',
        bgHover: 'hover:bg-violet-600',
        bgLight: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
      };
    case 'slate':
      return {
        primary: isDark ? 'text-slate-300' : 'text-slate-800',
        primaryBg: isDark ? 'bg-slate-600' : 'bg-slate-700',
        primaryBgHover: isDark ? 'hover:bg-slate-500' : 'hover:bg-slate-800',
        primaryBgMuted: isDark ? 'bg-slate-500/10' : 'bg-slate-100',
        
        secondary: isDark ? 'text-zinc-400' : 'text-zinc-700',
        secondaryBg: isDark ? 'bg-zinc-500' : 'bg-zinc-600',
        secondaryBgMuted: isDark ? 'bg-zinc-500/10' : 'bg-zinc-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-slate-600/30' : 'border-slate-300',
        borderMuted: isDark ? 'border-slate-700/20' : 'border-slate-200',
        borderFocus: 'focus:ring-slate-500',
        
        selection: isDark ? 'selection:bg-slate-500/20' : 'selection:bg-slate-500/10',
        scrollBar: 'bg-slate-500',
        
        complementaryText: isDark ? 'text-indigo-400' : 'text-indigo-700',
        complementaryBg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
        complementaryBorder: isDark ? 'border-indigo-500/20' : 'border-indigo-200',
        
        inlineCodeText: isDark ? 'text-slate-300' : 'text-slate-700',
        inlineCodeBg: isDark ? 'bg-slate-500/5' : 'bg-slate-100/50',
        inlineCodeBorder: isDark ? 'border-slate-500/20' : 'border-slate-300/50',
        
        blockquoteText: isDark ? 'text-slate-300' : 'text-slate-800',
        blockquoteBg: isDark ? 'bg-slate-500/5' : 'bg-slate-100/20',
        blockquoteBorder: isDark ? 'border-slate-500/40' : 'border-slate-500/30',
        
        accentHex: '#94a3b8',
        text: isDark ? 'text-slate-300' : 'text-slate-600',
        textHover: isDark ? 'hover:text-slate-200' : 'hover:text-slate-700',
        bg: 'bg-slate-500',
        bgHover: 'hover:bg-slate-600',
        bgLight: isDark ? 'bg-slate-500/10' : 'bg-slate-100',
      };
    case 'indigo':
      return {
        primary: isDark ? 'text-indigo-400' : 'text-indigo-700',
        primaryBg: isDark ? 'bg-indigo-500' : 'bg-indigo-600',
        primaryBgHover: isDark ? 'hover:bg-indigo-600' : 'hover:bg-indigo-700',
        primaryBgMuted: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
        
        secondary: isDark ? 'text-pink-400' : 'text-pink-700',
        secondaryBg: isDark ? 'bg-pink-500' : 'bg-pink-600',
        secondaryBgMuted: isDark ? 'bg-pink-500/10' : 'bg-pink-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-indigo-500/20' : 'border-indigo-200',
        borderMuted: isDark ? 'border-indigo-500/10' : 'border-indigo-100',
        borderFocus: 'focus:ring-indigo-500',
        
        selection: isDark ? 'selection:bg-indigo-500/20' : 'selection:bg-indigo-500/10',
        scrollBar: 'bg-indigo-500',
        
        complementaryText: isDark ? 'text-amber-400' : 'text-amber-700',
        complementaryBg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
        complementaryBorder: isDark ? 'border-amber-500/20' : 'border-amber-200',
        
        inlineCodeText: isDark ? 'text-indigo-400' : 'text-indigo-700',
        inlineCodeBg: isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/50',
        inlineCodeBorder: isDark ? 'border-indigo-500/20' : 'border-indigo-200/50',
        
        blockquoteText: isDark ? 'text-indigo-300' : 'text-indigo-800',
        blockquoteBg: isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/20',
        blockquoteBorder: isDark ? 'border-indigo-500/40' : 'border-indigo-500/30',
        
        accentHex: '#6366f1',
        text: isDark ? 'text-indigo-400' : 'text-indigo-600',
        textHover: isDark ? 'hover:text-indigo-400' : 'hover:text-indigo-600',
        bg: 'bg-indigo-500',
        bgHover: 'hover:bg-indigo-600',
        bgLight: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
      };
    case 'crimson':
    default:
      return {
        primary: isDark ? 'text-rose-400' : 'text-rose-700',
        primaryBg: isDark ? 'bg-rose-500' : 'bg-rose-600',
        primaryBgHover: isDark ? 'hover:bg-rose-600' : 'hover:bg-rose-700',
        primaryBgMuted: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
        
        secondary: isDark ? 'text-orange-400' : 'text-orange-700',
        secondaryBg: isDark ? 'bg-orange-500' : 'bg-orange-600',
        secondaryBgMuted: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
        
        fontMain,
        fontSec,
        fontMuted,
        bgPage,
        bgCard,
        bgInput,
        
        border: isDark ? 'border-rose-500/20' : 'border-rose-200',
        borderMuted: isDark ? 'border-rose-500/10' : 'border-rose-100',
        borderFocus: 'focus:ring-rose-500',
        
        selection: isDark ? 'selection:bg-rose-500/20' : 'selection:bg-rose-500/10',
        scrollBar: 'bg-rose-500',
        
        complementaryText: isDark ? 'text-cyan-400' : 'text-cyan-700',
        complementaryBg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
        complementaryBorder: isDark ? 'border-cyan-500/20' : 'border-cyan-200',
        
        inlineCodeText: isDark ? 'text-rose-400' : 'text-rose-700',
        inlineCodeBg: isDark ? 'bg-rose-500/5' : 'bg-rose-50/50',
        inlineCodeBorder: isDark ? 'border-rose-500/20' : 'border-rose-200/50',
        
        blockquoteText: isDark ? 'text-rose-300' : 'text-rose-800',
        blockquoteBg: isDark ? 'bg-rose-500/5' : 'bg-rose-50/20',
        blockquoteBorder: isDark ? 'border-rose-500/40' : 'border-rose-500/30',
        
        accentHex: '#f43f5e',
        text: isDark ? 'text-rose-400' : 'text-rose-600',
        textHover: isDark ? 'hover:text-rose-400' : 'hover:text-rose-600',
        bg: 'bg-rose-500',
        bgHover: 'hover:bg-rose-600',
        bgLight: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
      };
  }
};
