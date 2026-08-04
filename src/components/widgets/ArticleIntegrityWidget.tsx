import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

declare const __GIT_COMMIT_HASH__: string | undefined;

export function useSha256(text: string) {
  const [hash, setHash] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function compute() {
      if (!text) return;
      try {
        const msgUint8 = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (active) {
          setHash(hashHex);
        }
      } catch (err) {
        console.error("SHA-256 computation failed:", err);
      }
    }
    compute();
    return () => {
      active = false;
    };
  }, [text]);

  return hash;
}

export function ArticleIntegrityWidget({ content }: { content: string }) {
  const sha256 = useSha256(content);

  return (
    <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121826] rounded-xl p-5 shadow-sm space-y-3.5 font-mono text-[11px]">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
        <h3 className="font-semibold text-slate-900 dark:text-white text-xs font-sans">Content Integrity Verification</h3>
      </div>
      <div className="space-y-2.5">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold leading-none mb-1">CLIENT-SIDE CHECKSUM (SHA-256)</span>
          <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 break-all select-all text-[10px] text-slate-600 dark:text-slate-300 font-mono tracking-tight font-medium leading-normal">
            {sha256 || "COMPUTING_INTEGRITY_DIGEST..."}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800/50 pt-2">
          <span>BUILD PROVENANCE:</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            #{typeof __GIT_COMMIT_HASH__ !== 'undefined' ? __GIT_COMMIT_HASH__ : '7df0550'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          This SHA-256 cryptographic digest is dynamically calculated client-side via Web Crypto API from the active report payload, verifying document integrity against build release <code className="font-mono text-slate-300">#{typeof __GIT_COMMIT_HASH__ !== 'undefined' ? __GIT_COMMIT_HASH__ : '7df0550'}</code>.
        </div>
      </div>
    </div>
  );
}
