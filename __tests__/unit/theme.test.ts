import { describe, it, expect } from 'vitest';
import { getThemeColorClasses, type ThemeClasses } from '../../src/theme';

/** Every colour the switch handles explicitly. */
const COLORS = ['emerald', 'cyan', 'amber', 'violet', 'slate', 'indigo', 'crimson'] as const;

/** Accent hex is the cheapest unique fingerprint per colour branch. */
const ACCENT: Record<(typeof COLORS)[number], string> = {
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  slate: '#94a3b8',
  indigo: '#6366f1',
  crimson: '#f43f5e',
};

const KEYS: (keyof ThemeClasses)[] = [
  'primary', 'primaryBg', 'primaryBgHover', 'primaryBgMuted',
  'secondary', 'secondaryBg', 'secondaryBgMuted',
  'fontMain', 'fontSec', 'fontMuted',
  'bgPage', 'bgCard', 'bgInput',
  'border', 'borderMuted', 'borderFocus',
  'selection', 'scrollBar',
  'complementaryText', 'complementaryBg', 'complementaryBorder',
  'inlineCodeText', 'inlineCodeBg', 'inlineCodeBorder',
  'blockquoteText', 'blockquoteBg', 'blockquoteBorder',
  'accentHex', 'text', 'textHover',
];

describe('getThemeColorClasses', () => {
  describe.each(COLORS)('%s', (color) => {
    it.each([true, false])('returns a fully populated theme (isDark=%s)', (isDark) => {
      const theme = getThemeColorClasses(color, isDark);
      for (const key of KEYS) {
        expect(theme[key], `${color}/${isDark} is missing ${key}`).toBeTruthy();
        expect(typeof theme[key]).toBe('string');
      }
    });

    it('carries the accent hex for its own branch', () => {
      expect(getThemeColorClasses(color, true).accentHex).toBe(ACCENT[color]);
      expect(getThemeColorClasses(color, false).accentHex).toBe(ACCENT[color]);
    });

    it('varies mode-dependent tokens between dark and light', () => {
      const dark = getThemeColorClasses(color, true);
      const light = getThemeColorClasses(color, false);
      expect(dark.fontMain).not.toBe(light.fontMain);
      expect(dark.bgPage).not.toBe(light.bgPage);
      expect(dark.bgCard).not.toBe(light.bgCard);
    });
  });

  describe('normalisation and fallback', () => {
    const crimsonDark = getThemeColorClasses('crimson', true);

    it('defaults to crimson when no colour is given', () => {
      expect(getThemeColorClasses(undefined, true)).toEqual(crimsonDark);
    });

    it('defaults to crimson for an unrecognised colour', () => {
      expect(getThemeColorClasses('chartreuse', true)).toEqual(crimsonDark);
    });

    it('is case-insensitive', () => {
      expect(getThemeColorClasses('EMERALD', true)).toEqual(getThemeColorClasses('emerald', true));
      expect(getThemeColorClasses('CyAn', false)).toEqual(getThemeColorClasses('cyan', false));
    });

    it('treats an omitted isDark as light mode', () => {
      expect(getThemeColorClasses('cyan')).toEqual(getThemeColorClasses('cyan', false));
    });

    it('treats an empty colour string as crimson', () => {
      expect(getThemeColorClasses('', true)).toEqual(crimsonDark);
    });
  });
});
