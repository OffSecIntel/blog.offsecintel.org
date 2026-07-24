/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavMenuItem } from '../services/taxonomy/types';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface NavDropdownProps {
  key?: React.Key;
  item: NavMenuItem;
  isActive: boolean;
  onSelect: (target: string, action: 'filter' | 'link') => void;
  isMobile?: boolean;
}

export function NavDropdown({ item, isActive, onSelect, isMobile = false }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.visible) return null;

  const visibleChildren = (item.children || []).filter(child => child.visible);
  const hasChildren = visibleChildren.length > 0;

  const handleClickMain = () => {
    if (hasChildren && isMobile) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.target, item.action);
    }
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <button
          onClick={handleClickMain}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
            isActive
              ? 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>{item.label}</span>
          {hasChildren && (
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'}`}
            />
          )}
        </button>

        {hasChildren && isOpen && (
          <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
            {visibleChildren.map((child, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(child.target, child.action)}
                className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5"
              >
                <span>{child.label}</span>
                {child.action === 'link' && <ExternalLink size={10} className="opacity-60" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop View with Frosted Glass Hover Dropdown
  return (
    <div
      className="relative group py-2"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => onSelect(item.target, item.action)}
        className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
          isActive
            ? 'text-rose-500 font-bold border-b-2 border-rose-500 pb-0.5'
            : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
        }`}
      >
        <span>{item.label}</span>
        {hasChildren && (
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : 'opacity-60'}`}
          />
        )}
      </button>

      {hasChildren && (
        <div
          className={`absolute top-full left-0 w-48 pt-1 transition-all duration-200 z-50 ${
            isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
          }`}
        >
          <div className="bg-white/95 dark:bg-[#0d1321]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 space-y-0.5">
            {visibleChildren.map((child, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(child.target, child.action);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-all text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-between"
              >
                <span>{child.label}</span>
                {child.action === 'link' && <ExternalLink size={11} className="opacity-50" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
