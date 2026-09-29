import type { Palette } from './palette.js';

export interface Appearance {
  accentColor: string;
  accentName: string;
  dark: boolean;
  pureBlack: boolean;
  palette: Palette;
}

const kebab = (name: string) => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const properties = (colors: Record<string, string>, indent: string) =>
  Object.entries(colors).map(([role, value]) => `${indent}--kestrel-${kebab(role)}: ${value};\n`).join('');

export function appearanceJson({ accentColor, accentName, dark, pureBlack, palette }: Appearance): string {
  const current = dark ? palette.dark : palette.light;
  return `${JSON.stringify({ accentColor, accentName, dark, pureBlack, ...current, schemes: palette }, null, 2)}\n`;
}

export function appearanceCss({ accentColor, palette }: Appearance): string {
  return `:root {\n  --kestrel-accent: ${accentColor};\n${properties(palette.light.colors, '  ')}}\n` +
    `@media (prefers-color-scheme: dark) {\n  :root {\n${properties(palette.dark.colors, '    ')}  }\n}\n`;
}
