/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Shield } from 'lucide-react';
import { getThemeColorClasses, ThemeClasses } from '../theme';
import { MarkdownParser } from '../services/markdown/parser';
import { ASTNode } from '../services/markdown/types';

interface MarkdownRendererProps {
  content: string;
  themeColor?: string;
  isDark?: boolean;
}

const getContainerStyles = (color: string, isDark: boolean, themeClasses: ThemeClasses) => {
  const norm = color.toLowerCase().trim();
  
  let title = 'RESEARCH NOTE';
  if (['crimson', 'critical', 'danger', 'warning-red'].includes(norm)) title = 'CRITICAL ALERT';
  else if (['emerald', 'success', 'mitigated'].includes(norm)) title = 'MITIGATION SUCCESS';
  else if (['cyan', 'info', 'discovery'].includes(norm)) title = 'THREAT INTELLIGENCE';
  else if (['amber', 'warning', 'alert'].includes(norm)) title = 'SUSPICIOUS ACTIVITY WARNING';
  else if (['violet', 'purple', 'cyber'].includes(norm)) title = 'CYBER METRIC HIGHLIGHT';
  else if (['indigo', 'primary', 'tech'].includes(norm)) title = 'TECHNICAL INTELLIGENCE REPORT';

  const activeColorTheme = getThemeColorClasses(norm, isDark);

  return {
    border: activeColorTheme.border,
    bg: activeColorTheme.bgLight,
    text: themeClasses.fontSec,
    label: `${activeColorTheme.primary} ${activeColorTheme.border} ${activeColorTheme.primaryBgMuted} border px-2 py-0.5 rounded w-fit`,
    name: title
  };
};

export function renderInlineStyles(text: string, themeClasses: ThemeClasses): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Bold Inline Code (**`code`**)
    const boldCodeMatch = remaining.match(/^\*\*`([\s\S]*?)`\*\*/);
    if (boldCodeMatch) {
      parts.push(
        <strong key={keyIdx++} className="font-bold">
          <code className={`${themeClasses.primaryBgMuted} ${themeClasses.primary} px-1.5 py-0.5 rounded font-mono text-xs md:text-[13px] border ${themeClasses.borderMuted}`}>
            {boldCodeMatch[1]}
          </code>
        </strong>
      );
      remaining = remaining.substring(boldCodeMatch[0].length);
      continue;
    }

    // 2. Bold (**text**)
    const boldMatch = remaining.match(/^\*\*([\s\S]*?)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={keyIdx++} className={`font-bold ${themeClasses.fontMain}`}>
          {renderInlineStyles(boldMatch[1], themeClasses)}
        </strong>
      );
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    // 3. Italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)([\s\S]*?)\1/);
    if (italicMatch) {
      parts.push(
        <em key={keyIdx++} className="italic text-slate-400 font-sans">
          {renderInlineStyles(italicMatch[2], themeClasses)}
        </em>
      );
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    // 4. Inline Code (`code`)
    const codeMatch = remaining.match(/^`([\s\S]*?)`/);
    if (codeMatch) {
      parts.push(
        <code key={keyIdx++} className={`${themeClasses.primaryBgMuted} ${themeClasses.primary} px-1.5 py-0.5 rounded font-mono text-xs md:text-[13px] border ${themeClasses.borderMuted} select-all`}>
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }

    // 5. Links ([text](url))
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

      parts.push(
        <a
          key={keyIdx++}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={`${themeClasses.primary} font-medium hover:underline inline-flex items-center gap-0.5 transition-colors`}
        >
          {linkText}
        </a>
      );
      remaining = remaining.substring(linkMatch[0].length);
      continue;
    }

    // 6. Plain text till next markdown token
    const nextTokenIdx = remaining.search(/(\*\*|\*|_|`|\[)/);
    if (nextTokenIdx === -1) {
      parts.push(remaining);
      break;
    } else if (nextTokenIdx === 0) {
      parts.push(remaining[0]);
      remaining = remaining.substring(1);
    } else {
      parts.push(remaining.substring(0, nextTokenIdx));
      remaining = remaining.substring(nextTokenIdx);
    }
  }

  return parts;
}

export function MarkdownRenderer({ content, themeColor = 'crimson', isDark = false }: MarkdownRendererProps) {
  if (!content) return null;

  const themeClasses = getThemeColorClasses(themeColor, isDark);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopyCode = (text: string, indexId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const highlightCode = (code: string, language: string) => {
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
                return <span key={pIdx} className="text-pink-400 font-semibold">{part}</span>;
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
              <span className="text-pink-400 font-semibold">{key}</span>: <span className="text-slate-300">{val}</span>
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
      const tokens = line.split(/(\s+|[(),;={}[\]])/);
      return (
        <div key={idx} className="table-row">
          <span className="table-cell text-right pr-4 select-none text-slate-600 text-[11px] font-mono">{idx + 1}</span>
          <span className="table-cell font-mono">
            {tokens.map((tok, tIdx) => {
              const trimmed = tok.trim();
              if (['const', 'let', 'var', 'function', 'return', 'import', 'export', 'class', 'interface', 'public', 'private', 'void', 'int', 'char', 'double', 'float', 'if', 'else', 'for', 'while', 'new', 'try', 'catch', 'async', 'await'].includes(trimmed)) {
                return <span key={tIdx} className="text-pink-400 font-bold">{tok}</span>;
              }
              if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || trimmed === 'undefined' || /^\d+$/.test(trimmed)) {
                return <span key={tIdx} className="text-amber-300 font-semibold">{tok}</span>;
              }
              if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith('`')) {
                return <span key={tIdx} className="text-emerald-400">{tok}</span>;
              }
              if (/^[A-Z][a-zA-Z0-9_]*$/.test(trimmed)) {
                return <span key={tIdx} className="text-cyan-400 font-medium">{tok}</span>;
              }
              return <span key={tIdx} className="text-slate-200">{tok}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  const parser = new MarkdownParser();
  const astNodes: ASTNode[] = parser.parse(content);

  const renderASTNode = (node: ASTNode): React.ReactNode => {
    switch (node.type) {
      case 'heading': {
        const level = node.level;
        if (level === 1) {
          return (
            <h1 key={node.id} id={node.id} className={`mt-8 mb-4 text-2xl md:text-3xl font-bold font-sans tracking-tight ${themeClasses.fontMain} border-b ${themeClasses.borderMuted} pb-2 scroll-mt-20`}>
              {renderInlineStyles(node.text, themeClasses)}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={node.id} id={node.id} className={`mt-7 mb-3 text-xl md:text-2xl font-semibold font-sans tracking-tight ${themeClasses.fontMain} scroll-mt-20`}>
              {renderInlineStyles(node.text, themeClasses)}
            </h2>
          );
        } else if (level === 3) {
          return (
            <h3 key={node.id} id={node.id} className={`mt-6 mb-2 text-lg md:text-xl font-semibold font-sans tracking-tight ${themeClasses.fontMain} scroll-mt-20`}>
              {renderInlineStyles(node.text, themeClasses)}
            </h3>
          );
        } else if (level === 4) {
          return (
            <h4 key={node.id} id={node.id} className={`mt-5 mb-2 text-base md:text-lg font-medium font-sans text-slate-800 dark:text-slate-200 scroll-mt-20`}>
              {renderInlineStyles(node.text, themeClasses)}
            </h4>
          );
        } else {
          return (
            <h5 key={node.id} id={node.id} className={`mt-4 mb-1.5 text-sm md:text-base font-medium font-sans text-slate-700 dark:text-slate-300 italic scroll-mt-20`}>
              {renderInlineStyles(node.text, themeClasses)}
            </h5>
          );
        }
      }

      case 'paragraph': {
        return (
          <p key={node.id} id={node.id} className={`my-4 ${themeClasses.fontSec} font-sans leading-relaxed text-base`}>
            {renderInlineStyles(node.text, themeClasses)}
          </p>
        );
      }

      case 'blockquote': {
        return (
          <blockquote key={node.id} id={node.id} className={`my-5 pl-4 border-l-4 ${themeClasses.blockquoteBorder} ${themeClasses.blockquoteBg} py-2.5 pr-2 rounded-r italic ${themeClasses.blockquoteText} font-sans leading-relaxed`}>
            {renderInlineStyles(node.text, themeClasses)}
          </blockquote>
        );
      }

      case 'list': {
        if (node.ordered) {
          return (
            <ol key={node.id} id={node.id} className={`my-4 pl-6 list-decimal space-y-2 ${themeClasses.fontSec}`}>
              {node.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed font-sans">
                  {renderInlineStyles(item.text, themeClasses)}
                </li>
              ))}
            </ol>
          );
        } else {
          return (
            <ul key={node.id} id={node.id} className={`my-4 pl-6 list-disc space-y-2 ${themeClasses.fontSec}`}>
              {node.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed font-sans">
                  {renderInlineStyles(item.text, themeClasses)}
                </li>
              ))}
            </ul>
          );
        }
      }

      case 'code': {
        return (
          <div key={node.id} id={node.id} className={`relative my-6 rounded-lg overflow-hidden border ${themeClasses.borderMuted} bg-slate-950 text-slate-100 font-mono text-xs md:text-sm shadow-md`}>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                {node.language.toLowerCase() === 'bash' || node.language.toLowerCase() === 'sh' ? (
                  <Terminal size={14} className={themeClasses.primary} />
                ) : node.language.toLowerCase() === 'http' ? (
                  <Shield size={14} className="text-cyan-400" />
                ) : (
                  <FileCode size={14} className={themeClasses.primary} />
                )}
                <span>{node.language ? node.language.toUpperCase() : 'CODE'}</span>
              </div>
              <button
                onClick={() => handleCopyCode(node.code, node.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors duration-150"
                title="Copy code"
              >
                {copiedIndex === node.id ? (
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
                  {highlightCode(node.code, node.language)}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      case 'table': {
        return (
          <div key={node.id} id={node.id} className={`my-6 overflow-x-auto rounded-lg border ${themeClasses.border}`}>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`${isDark ? 'bg-slate-900' : 'bg-slate-100'} border-b ${themeClasses.border} ${themeClasses.fontMain} font-semibold`}>
                  {node.headers.map((h, idx) => (
                    <th key={idx} className="p-3 font-medium">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.borderMuted} ${themeClasses.fontSec}`}>
                {node.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={`${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/50'} transition-colors`}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 font-sans">
                        {renderInlineStyles(cell.trim(), themeClasses)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'image': {
        const resolvedUrl = node.src.startsWith('http://') || node.src.startsWith('https://') || node.src.startsWith('data:') 
          ? node.src 
          : (node.src.startsWith('/') ? node.src : '/' + node.src);

        return (
          <div key={node.id} id={node.id} className="my-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800/85 bg-slate-50 dark:bg-slate-900/30 flex flex-col items-center">
            <img 
              src={resolvedUrl} 
              alt={node.alt} 
              className="w-full max-w-2xl rounded-lg shadow-sm border border-slate-200 dark:border-slate-800" 
              referrerPolicy="no-referrer"
            />
            {node.alt && (
              <p className="mt-2.5 text-xs text-center text-slate-400 dark:text-slate-500 font-sans italic">
                {node.alt}
              </p>
            )}
          </div>
        );
      }

      case 'container': {
        const styles = getContainerStyles(node.color, isDark, themeClasses);
        return (
          <div key={node.id} id={node.id} className={`my-6 p-5 rounded-xl border ${styles.border} ${styles.bg} ${styles.text} font-sans shadow-sm`}>
            <div className={`mb-3 text-[10px] uppercase font-bold tracking-wider font-mono ${styles.label}`}>
              {styles.name}
            </div>
            <div className="prose-container pl-1 space-y-3">
              {node.content.map(subNode => renderASTNode(subNode))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="prose-content space-y-4">
      {astNodes.map(node => renderASTNode(node))}
    </div>
  );
}
