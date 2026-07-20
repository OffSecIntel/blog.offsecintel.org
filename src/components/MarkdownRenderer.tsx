/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Shield } from 'lucide-react';
import { getThemeColorClasses, ThemeClasses } from '../theme';

interface MarkdownRendererProps {
  content: string;
  themeColor?: string;
  isDark?: boolean;
}

const getContainerStyles = (color: string, isDark: boolean, themeClasses: ThemeClasses) => {
  const norm = color.toLowerCase().trim();
  
  // Custom container titles based on color keyword
  let title = 'RESEARCH NOTE';
  if (['crimson', 'critical', 'danger', 'warning-red'].includes(norm)) title = 'CRITICAL ALERT';
  else if (['emerald', 'success', 'mitigated'].includes(norm)) title = 'MITIGATION SUCCESS';
  else if (['cyan', 'info', 'discovery'].includes(norm)) title = 'THREAT INTELLIGENCE';
  else if (['amber', 'warning', 'alert'].includes(norm)) title = 'SUSPICIOUS ACTIVITY WARNING';
  else if (['violet', 'purple', 'cyber'].includes(norm)) title = 'CYBER METRIC HIGHLIGHT';
  else if (['indigo', 'primary', 'tech'].includes(norm)) title = 'TECHNICAL INTELLIGENCE REPORT';

  // If container matches active post theme, use that theme's custom properties,
  // otherwise look up that specific container color's theme
  const activeColorTheme = getThemeColorClasses(norm, isDark);

  return {
    border: activeColorTheme.border,
    bg: activeColorTheme.bgLight,
    text: themeClasses.fontSec,
    label: `${activeColorTheme.primary} ${activeColorTheme.border} ${activeColorTheme.primaryBgMuted} border px-2 py-0.5 rounded w-fit`,
    name: title
  };
};

export function MarkdownRenderer({ content, themeColor = 'crimson', isDark = false }: MarkdownRendererProps) {
  if (!content) return null;

  const themeClasses = getThemeColorClasses(themeColor, isDark);

  // Simple state for copy button indicators
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopyCode = (text: string, indexId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Pre-process and split into blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let currentBlockType: 'paragraph' | 'code' | 'list' | 'table' | 'custom-container' | null = null;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let listItems: { text: string; ordered: boolean }[] = [];
  let tableRows: string[][] = [];
  let paragraphLines: string[] = [];
  let customContainerLines: string[] = [];
  let customContainerColor = 'slate';
  let blockIdCounter = 0;

  const flushBlock = () => {
    const id = `md-block-${blockIdCounter++}`;
    if (currentBlockType === 'code') {
      const fullCode = codeContent.join('\n');
      blocks.push(
        <div key={id} id={id} className={`relative my-6 rounded-lg overflow-hidden border ${themeClasses.borderMuted} bg-slate-950 text-slate-100 font-mono text-xs md:text-sm`}>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              {codeLanguage.toLowerCase() === 'bash' || codeLanguage.toLowerCase() === 'sh' ? (
                <Terminal size={14} className={themeClasses.primary} />
              ) : codeLanguage.toLowerCase() === 'http' ? (
                <Shield size={14} className="text-cyan-400" />
              ) : (
                <FileCode size={14} className={themeClasses.primary} />
              )}
              <span>{codeLanguage ? codeLanguage.toUpperCase() : 'CODE'}</span>
            </div>
            <button
              onClick={() => handleCopyCode(fullCode, id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors duration-150"
              title="Copy code"
            >
              {copiedIndex === id ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-sans text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span className="font-sans text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-[500px]">
            <pre className="m-0 leading-relaxed font-mono">
              <code>
                {highlightCode(fullCode, codeLanguage)}
              </code>
            </pre>
          </div>
        </div>
      );
      codeContent = [];
      codeLanguage = '';
    } else if (currentBlockType === 'list') {
      const isOrdered = listItems.length > 0 && listItems[0].ordered;
      if (isOrdered) {
        blocks.push(
          <ol key={id} id={id} className={`my-4 pl-6 list-decimal space-y-2 ${themeClasses.fontSec}`}>
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineStyles(item.text, themeClasses)}
              </li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={id} id={id} className={`my-4 pl-6 list-disc space-y-2 ${themeClasses.fontSec}`}>
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineStyles(item.text, themeClasses)}
              </li>
            ))}
          </ul>
        );
      }
      listItems = [];
    } else if (currentBlockType === 'table') {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(1).filter(r => r.some(c => c.trim() !== ''));
        
        blocks.push(
          <div key={id} id={id} className={`my-6 overflow-x-auto rounded-lg border ${themeClasses.border}`}>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`${isDark ? 'bg-slate-900' : 'bg-slate-100'} border-b ${themeClasses.border} ${themeClasses.fontMain} font-semibold`}>
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-3 font-medium">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.borderMuted} ${themeClasses.fontSec}`}>
                {bodyRows.map((row, rIdx) => {
                  if (row.some(cell => cell.includes('---'))) return null;
                  return (
                    <tr key={rIdx} className={`${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/50'} transition-colors`}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 font-sans">
                          {renderInlineStyles(cell.trim(), themeClasses)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
    } else if (currentBlockType === 'paragraph') {
      if (paragraphLines.length > 0) {
        const fullParaText = paragraphLines.join(' ');
        
        if (fullParaText.startsWith('> ')) {
          blocks.push(
            <blockquote key={id} id={id} className={`my-5 pl-4 border-l-4 ${themeClasses.blockquoteBorder} ${themeClasses.blockquoteBg} py-2.5 pr-2 rounded-r italic ${themeClasses.blockquoteText} font-sans leading-relaxed`}>
              {renderInlineStyles(fullParaText.substring(2), themeClasses)}
            </blockquote>
          );
        } else {
          blocks.push(
            <p key={id} id={id} className={`my-4 ${themeClasses.fontSec} font-sans leading-relaxed text-base`}>
              {renderInlineStyles(fullParaText, themeClasses)}
            </p>
          );
        }
        paragraphLines = [];
      }
    } else if (currentBlockType === 'custom-container') {
      const styles = getContainerStyles(customContainerColor, isDark, themeClasses);
      blocks.push(
        <div key={id} id={id} className={`my-6 p-5 rounded-xl border ${styles.border} ${styles.bg} ${styles.text} font-sans shadow-sm`}>
          <div className={`mb-3 text-[10px] uppercase font-bold tracking-wider font-mono ${styles.label}`}>
            {styles.name}
          </div>
          <div className="prose-container pl-1">
            <MarkdownRenderer content={customContainerLines.join('\n')} themeColor={themeColor} isDark={isDark} />
          </div>
        </div>
      );
      customContainerLines = [];
    }
    currentBlockType = null;
  };

  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // Check for Custom Container boundaries
    if (trimmedLine.startsWith(':::')) {
      if (currentBlockType === 'custom-container') {
        flushBlock();
      } else {
        flushBlock();
        currentBlockType = 'custom-container';
        customContainerColor = trimmedLine.slice(3).trim() || 'slate';
        customContainerLines = [];
      }
      continue;
    }

    if (currentBlockType === 'custom-container') {
      customContainerLines.push(rawLine);
      continue;
    }

    // 1. Check for Code Block boundaries
    if (trimmedLine.startsWith('```')) {
      if (currentBlockType === 'code') {
        flushBlock();
      } else {
        flushBlock();
        currentBlockType = 'code';
        codeLanguage = trimmedLine.slice(3).trim();
      }
      continue;
    }

    if (currentBlockType === 'code') {
      codeContent.push(rawLine);
      continue;
    }

    // 2. Check for Headings
    if (trimmedLine.startsWith('#')) {
      flushBlock();
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const text = trimmedLine.replace(/^#+\s*/, '');
      const slugified = text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const blockId = `hdr-${slugified}`;
      
      if (level === 1) {
        blocks.push(
          <h1 key={blockId} id={blockId} className={`mt-8 mb-4 text-2xl md:text-3xl font-bold font-sans tracking-tight ${themeClasses.fontMain} border-b ${themeClasses.borderMuted} pb-2 scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h1>
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={blockId} id={blockId} className={`mt-7 mb-3 text-xl md:text-2xl font-semibold font-sans tracking-tight ${themeClasses.fontMain} scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h2>
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={blockId} id={blockId} className={`mt-6 mb-2 text-lg md:text-xl font-semibold font-sans tracking-tight ${themeClasses.fontMain} scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h3>
        );
      } else if (level === 4) {
        blocks.push(
          <h4 key={blockId} id={blockId} className={`mt-5 mb-2 text-base md:text-lg font-medium font-sans text-slate-800 dark:text-slate-200 scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h4>
        );
      } else if (level === 5) {
        blocks.push(
          <h5 key={blockId} id={blockId} className={`mt-4 mb-1.5 text-sm md:text-base font-medium font-sans text-slate-700 dark:text-slate-300 italic scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h5>
        );
      } else {
        blocks.push(
          <h6 key={blockId} id={blockId} className={`mt-4 mb-1.5 text-xs md:text-sm font-medium font-sans text-slate-600 dark:text-slate-400 italic scroll-mt-20`}>
            {renderInlineStyles(text, themeClasses)}
          </h6>
        );
      }
      continue;
    }

    // 3. Check for list item
    const isOrderedItem = /^\d+\.\s/.test(trimmedLine);
    const isUnorderedItem = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');

    if ((isUnorderedItem || isOrderedItem) && !currentBlockType) {
      flushBlock();
      currentBlockType = 'list';
      const text = isUnorderedItem ? trimmedLine.substring(2) : trimmedLine.replace(/^\d+\.\s/, '');
      listItems.push({ text, ordered: isOrderedItem });
      continue;
    }

    if (currentBlockType === 'list') {
      const isNextOrderedItem = /^\d+\.\s/.test(trimmedLine);
      const isNextUnorderedItem = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');

      if (isNextUnorderedItem || isNextOrderedItem) {
        const text = isNextUnorderedItem ? trimmedLine.substring(2) : trimmedLine.replace(/^\d+\.\s/, '');
        listItems.push({ text, ordered: isNextOrderedItem });
        continue;
      } else if (trimmedLine === '') {
        flushBlock();
        continue;
      } else {
        if (listItems.length > 0) {
          listItems[listItems.length - 1].text += ' ' + trimmedLine;
        }
        continue;
      }
    }

    // 4. Check for tables
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (currentBlockType !== 'table') {
        flushBlock();
        currentBlockType = 'table';
      }
      const cells = trimmedLine.split('|').slice(1, -1);
      tableRows.push(cells);
      continue;
    } else if (currentBlockType === 'table') {
      flushBlock();
    }

    // 5. Blank line handles paragraph flushing
    if (trimmedLine === '') {
      flushBlock();
      continue;
    }

    // 6. Accumulate normal paragraph text
    if (!currentBlockType) {
      currentBlockType = 'paragraph';
    }
    if (currentBlockType === 'paragraph') {
      paragraphLines.push(rawLine);
    }
  }

  // Final flush
  flushBlock();

  return <div className="space-y-1 font-sans">{blocks}</div>;
}

// Replaces bold, italics, and inline code with actual React tags
function renderInlineStyles(text: string, themeClasses: ThemeClasses): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let keyCounter = 0;

  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  for (const part of tokens) {
    const currentKey = `inline-${keyCounter++}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      parts.push(
        <strong key={currentKey} className={`font-bold ${themeClasses.fontMain}`}>
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith('*') && part.endsWith('*')) {
      parts.push(
        <em key={currentKey} className={`italic ${themeClasses.fontSec}`}>
          {part.slice(1, -1)}
        </em>
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      parts.push(
        <code key={currentKey} className={`${themeClasses.inlineCodeBg} ${themeClasses.inlineCodeText} ${themeClasses.inlineCodeBorder} border px-1.5 py-0.5 rounded font-mono text-xs font-semibold`}>
          {part.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<span key={currentKey}>{part}</span>);
    }
  }

  return parts;
}

// Lightweight syntax highlighter helper to render colors inside pre tags
function highlightCode(code: string, language: string): React.ReactNode {
  const lang = language.toLowerCase();
  
  if (lang === 'bash' || lang === 'sh') {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('#')) {
        return <div key={idx} className="text-slate-500 italic">{line}</div>;
      }
      const parts = line.split(/(\s+)/);
      return (
        <div key={idx}>
          {parts.map((part, pIdx) => {
            if (['curl', 'wget', 'pkill', 'chmod', 'service', 'systemctl', 'echo', 'apt-get', 'yum', 'sudo', 'cat', 'grep', 'rm', 'mv'].includes(part.trim())) {
              return <span key={pIdx} className="text-rose-400 font-semibold">{part}</span>;
            }
            if (part.trim().startsWith('--') || part.trim().startsWith('-')) {
              return <span key={pIdx} className="text-cyan-400">{part}</span>;
            }
            if (part.trim().startsWith('http://') || part.trim().startsWith('https://')) {
              return <span key={pIdx} className="text-amber-300 underline">{part}</span>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  }

  if (lang === 'http' || lang === 'http-header') {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('POST ') || line.startsWith('GET ') || line.startsWith('PUT ') || line.startsWith('DELETE ') || line.startsWith('PATCH ')) {
        return <div key={idx} className="text-emerald-400 font-bold">{line}</div>;
      }
      if (line.includes(': ')) {
        const [key, val] = line.split(': ');
        return (
          <div key={idx}>
            <span className="text-rose-400">{key}</span>: <span className="text-slate-300">{val}</span>
          </div>
        );
      }
      return <div key={idx} className="text-slate-300">{line}</div>;
    });
  }

  const lines = code.split('\n');
  return lines.map((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <div key={idx} className="text-slate-500 italic">{line}</div>;
    }
    const tokens = line.split(/(\s+)/);
    return (
      <div key={idx}>
        {tokens.map((tok, tIdx) => {
          const trimmed = tok.trim();
          if (['const', 'let', 'var', 'function', 'return', 'import', 'export', 'class', 'interface', 'public', 'private', 'void', 'int', 'char', 'double', 'float', 'if', 'else', 'for', 'while', 'new'].includes(trimmed)) {
            return <span key={tIdx} className="text-rose-400 font-medium">{tok}</span>;
          }
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return <span key={tIdx} className="text-emerald-400">{tok}</span>;
          }
          if (trimmed.match(/^\d+$/)) {
            return <span key={tIdx} className="text-amber-400">{tok}</span>;
          }
          return <span key={tIdx}>{tok}</span>;
        })}
      </div>
    );
  });
}
