/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThreatIntel, IoCEntry, MITRETechnique } from '../types';
import { Shield, ShieldAlert, Cpu, Activity, Database, Check, Copy, ExternalLink, Flame } from 'lucide-react';

interface ThreatIntelPanelProps {
  intel: ThreatIntel;
  isSidebar?: boolean;
}

export function ThreatIntelPanel({ intel, isSidebar = false }: ThreatIntelPanelProps) {
  const [copiedIoC, setCopiedIoC] = useState<string | null>(null);

  const handleCopyIoC = (val: string, indexId: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIoC(indexId);
    setTimeout(() => setCopiedIoC(null), 2000);
  };

  const getSeverityBadgeColor = (sev?: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Overview stats panel - adapt based on sidebar vs wide */}
      <div className={
        isSidebar 
          ? "grid grid-cols-1 gap-2.5" 
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      }>
        {intel.threatActor && (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 min-w-0 shadow-sm">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <Flame size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono leading-none mb-1">Threat Actor</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={intel.threatActor}>{intel.threatActor}</p>
            </div>
          </div>
        )}

        {intel.malwareFamily && (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 min-w-0 shadow-sm">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
              <Cpu size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono leading-none mb-1">Malware Family</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={intel.malwareFamily}>{intel.malwareFamily}</p>
            </div>
          </div>
        )}

        {intel.severity && (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 min-w-0 shadow-sm">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
              <ShieldAlert size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono leading-none mb-1.5">Severity</p>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono font-bold tracking-wider ${getSeverityBadgeColor(intel.severity)}`}>
                {intel.severity}
              </span>
            </div>
          </div>
        )}

        {intel.confidenceScore !== undefined && (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 min-w-0 shadow-sm">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Activity size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono leading-none mb-1">Confidence Score</p>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-white">{intel.confidenceScore}%</p>
            </div>
          </div>
        )}
      </div>

      {/* CVE References */}
      {intel.cves && intel.cves.length > 0 && (
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5 font-mono">
            <Database size={13} className="text-rose-500" />
            <span>Vulnerability References</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {intel.cves.map((cve, idx) => (
              <a
                key={idx}
                href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-rose-500/10 hover:border-rose-500/30 text-[11px] text-slate-600 dark:text-slate-300 transition-all font-mono group"
              >
                <span>{cve}</span>
                <ExternalLink size={10} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MITRE ATT&CK Matrix segment */}
      {intel.mitreAttack && intel.mitreAttack.length > 0 && (
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5 flex items-center gap-1.5 font-mono">
            <Shield size={13} className="text-rose-500" />
            <span>MITRE ATT&CK® Techniques</span>
          </h4>
          <div className={
            isSidebar
              ? "grid grid-cols-1 gap-2.5"
              : "grid grid-cols-1 md:grid-cols-2 gap-3"
          }>
            {intel.mitreAttack.map((technique, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="text-[9px] font-extrabold uppercase text-rose-500 font-mono tracking-wide px-1.5 py-0.5 rounded bg-rose-500/5 border border-rose-500/10">
                    {technique.tactic}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-500">
                    {technique.id}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans mt-1">
                  {technique.technique}
                </p>
                <a 
                  href={`https://attack.mitre.org/techniques/${technique.id}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 text-[9px] text-slate-400 hover:text-rose-500 transition-colors font-mono mt-2"
                >
                  <span>View Mitigation on MITRE</span>
                  <ExternalLink size={9} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicators of Compromise (IoC) table/card-based layout */}
      {intel.iocs && intel.iocs.length > 0 && (
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5 font-mono">
            <ShieldAlert size={13} className="text-rose-500" />
            <span>Indicators of Compromise (IoCs)</span>
          </h4>
          <div className="space-y-2">
            {intel.iocs.map((ioc, idx) => {
              const uniqueId = `ioc-${idx}`;
              const isCopied = copiedIoC === uniqueId;
              return (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/40 dark:hover:bg-slate-950/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="uppercase text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 leading-none">
                        {ioc.type}
                      </span>
                      {ioc.description && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                          {ioc.description}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all font-semibold leading-relaxed">
                      {ioc.value}
                    </p>
                  </div>
                  <div className="flex sm:justify-end shrink-0">
                    <button
                      onClick={() => handleCopyIoC(ioc.value, uniqueId)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold bg-slate-200/50 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 dark:text-slate-400 transition-all border border-slate-300 dark:border-slate-700/60"
                      title="Copy IoC"
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} className="text-emerald-500 animate-pulse" />
                          <span className="text-emerald-500">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} className="text-slate-400" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
