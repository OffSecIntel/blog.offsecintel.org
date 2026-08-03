import React from 'react';
import { BlogPost } from '../../types';

export function ImpactLevelRibbon({ level }: { level?: BlogPost['impactLevel'] }) {
  if (!level) return null;
  const norm = level.toLowerCase();
  let bg = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
  let label = 'CRITICAL ASSESSMENT / SYSTEM OVERVIEW REQUIREMENT';
  let desc = 'This cybersecurity and research publication describes elements carrying active zero-day traits, system vulnerabilities, or immediate computational safety risk vectors.';

  if (norm === 'high') {
    bg = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
    label = 'HIGH EXPOSURE REPORT / DIRECTED MITIGATION';
    desc = 'Vulnerability telemetry or research benchmarks demonstrate significant lateral reach. Follow listed patching indicators or validation matrices.';
  } else if (norm === 'medium') {
    bg = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    label = 'MEDIUM IMPACT DISCLOSURE / LOCAL TELEMETRY';
    desc = 'Observed research signals a moderate attack surface expansion or targeted technical application. Mitigation tactics are verified stable under standard testing.';
  } else if (norm === 'low') {
    bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    label = 'ROUTINE EVALUATION / INTEGRATION COMPLETED';
    desc = 'Low threat metrics. The techniques and theoretical computer science frameworks described represent standard educational paradigms or mitigated indicators.';
  } else if (norm === 'info') {
    bg = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400';
    label = 'ACADEMIC WHITE PAPER / RESEARCH DISCLOSURE';
    desc = 'This publication represents foundational peer-reviewed research, systemic computer science paradigms, or high-level threat matrix disclosures.';
  }

  return (
    <div className={`p-4 rounded-xl border font-sans text-xs flex gap-3.5 items-start leading-relaxed shadow-sm ${bg}`}>
      <div className="flex-1">
        <p className="font-mono font-extrabold tracking-wider text-[9px] uppercase mb-1">{label}</p>
        <p className="opacity-90 font-medium">{desc}</p>
      </div>
    </div>
  );
}
