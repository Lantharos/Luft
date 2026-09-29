import type { Scheme } from '../palette.js';

export const GHOSTTY_THEMES = { light: 'Kestrel Light', dark: 'Kestrel Dark' };

export const ghosttyInclude = `theme = light:${GHOSTTY_THEMES.light},dark:${GHOSTTY_THEMES.dark}\n`;

export function ghosttyTheme({ terminal }: Scheme): string {
  const palette = Array.from({ length: 16 }, (_, index) => `palette = ${index}=${terminal[`color${index}`]}\n`);
  return [
    `background = ${terminal.background}\n`,
    `foreground = ${terminal.foreground}\n`,
    `cursor-color = ${terminal.cursor}\n`,
    `cursor-text = ${terminal.cursorText}\n`,
    `selection-background = ${terminal.selectionBackground}\n`,
    `selection-foreground = ${terminal.selectionForeground}\n`,
    ...palette,
  ].join('');
}
