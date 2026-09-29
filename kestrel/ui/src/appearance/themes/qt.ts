import type { Colors } from '../palette.js';

export const QT_SCHEME_NAME = 'Kestrel';

function qtRoles(colors: Colors, disabled: boolean): string[] {
  const text = disabled ? colors.outline : colors.onSurface;
  return [
    text,
    colors.surfaceContainerHigh,
    colors.surfaceContainerHighest,
    colors.surfaceContainerHigh,
    colors.surfaceContainerLowest,
    colors.outlineVariant,
    text,
    colors.inverseOnSurface,
    text,
    colors.surfaceContainerLowest,
    colors.surface,
    '#000000',
    colors.primary,
    colors.onPrimary,
    colors.primary,
    colors.tertiary,
    colors.surfaceContainerLow,
    colors.surface,
    colors.inverseSurface,
    colors.inverseOnSurface,
    colors.onSurfaceVariant,
    colors.primary,
  ];
}

export function qtPalette(colors: Colors): string {
  const active = qtRoles(colors, false).join(', ');
  return `[ColorScheme]\nactive_colors=${active}\ninactive_colors=${active}\ndisabled_colors=${qtRoles(colors, true).join(', ')}\n`;
}

const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).join(',');

interface KdeGroup {
  background: string;
  alternate: string;
  foreground: string;
  inactive: string;
  accent: string;
}

function kdeGroup(name: string, group: KdeGroup, colors: Colors): string {
  const entries = {
    BackgroundNormal: group.background,
    BackgroundAlternate: group.alternate,
    ForegroundNormal: group.foreground,
    ForegroundInactive: group.inactive,
    ForegroundActive: group.accent,
    ForegroundLink: group.accent,
    ForegroundVisited: colors.tertiary,
    ForegroundNegative: colors.error,
    DecorationFocus: colors.primary,
    DecorationHover: colors.primary,
  };
  return `[Colors:${name}]\n${Object.entries(entries).map(([key, value]) => `${key}=${rgb(value)}\n`).join('')}\n`;
}

export function kdeColorScheme(colors: Colors): string {
  const plain = (background: string, alternate: string): KdeGroup =>
    ({ background, alternate, foreground: colors.onSurface, inactive: colors.onSurfaceVariant, accent: colors.primary });
  return [
    kdeGroup('Window', plain(colors.surface, colors.surfaceContainerLow), colors),
    kdeGroup('View', plain(colors.surfaceContainerLowest, colors.surfaceContainerLow), colors),
    kdeGroup('Button', plain(colors.surfaceContainerHigh, colors.surfaceContainerHighest), colors),
    kdeGroup('Header', plain(colors.surfaceContainer, colors.surface), colors),
    kdeGroup('Selection', { background: colors.primary, alternate: colors.primaryContainer, foreground: colors.onPrimary, inactive: colors.onPrimary, accent: colors.onPrimary }, colors),
    kdeGroup('Tooltip', { background: colors.inverseSurface, alternate: colors.inverseSurface, foreground: colors.inverseOnSurface, inactive: colors.inverseOnSurface, accent: colors.inversePrimary }, colors),
    `[General]\nColorScheme=${QT_SCHEME_NAME}\nName=${QT_SCHEME_NAME}\n\n`,
    `[WM]\nactiveBackground=${rgb(colors.surfaceContainer)}\nactiveForeground=${rgb(colors.onSurface)}\n`,
    `inactiveBackground=${rgb(colors.surface)}\ninactiveForeground=${rgb(colors.onSurfaceVariant)}\n`,
  ].join('');
}
