import type { Colors, Palette } from '../palette.js';

const LEGACY_NAMES: [string, string][] = [
  ['theme_bg_color', 'window-bg-color'],
  ['theme_fg_color', 'window-fg-color'],
  ['theme_base_color', 'view-bg-color'],
  ['theme_text_color', 'view-fg-color'],
  ['theme_selected_bg_color', 'accent-bg-color'],
  ['theme_selected_fg_color', 'accent-fg-color'],
  ['theme_unfocused_bg_color', 'window-bg-color'],
  ['theme_unfocused_fg_color', 'window-fg-color'],
  ['theme_unfocused_base_color', 'view-bg-color'],
  ['theme_unfocused_text_color', 'view-fg-color'],
  ['theme_unfocused_selected_bg_color', 'accent-bg-color'],
  ['theme_unfocused_selected_fg_color', 'accent-fg-color'],
  ['borders', 'border-color'],
];

function namedColors(colors: Colors, dark: boolean): Record<string, string> {
  const raised = dark ? colors.surfaceContainerHigh : colors.surfaceContainerLowest;
  return {
    'accent-bg-color': colors.primary,
    'accent-fg-color': colors.onPrimary,
    'accent-color': colors.primary,
    'destructive-bg-color': colors.error,
    'destructive-fg-color': colors.onError,
    'destructive-color': colors.error,
    'error-bg-color': colors.error,
    'error-fg-color': colors.onError,
    'error-color': colors.error,
    'window-bg-color': colors.surface,
    'window-fg-color': colors.onSurface,
    'view-bg-color': colors.surfaceContainerLowest,
    'view-fg-color': colors.onSurface,
    'headerbar-bg-color': colors.surfaceContainer,
    'headerbar-fg-color': colors.onSurface,
    'headerbar-backdrop-color': colors.surface,
    'sidebar-bg-color': colors.surfaceContainerLow,
    'sidebar-fg-color': colors.onSurface,
    'sidebar-backdrop-color': colors.surface,
    'card-bg-color': raised,
    'card-fg-color': colors.onSurface,
    'dialog-bg-color': raised,
    'dialog-fg-color': colors.onSurface,
    'popover-bg-color': raised,
    'popover-fg-color': colors.onSurface,
    'thumbnail-bg-color': raised,
    'thumbnail-fg-color': colors.onSurface,
    'border-color': colors.outlineVariant,
  };
}

const variables = (colors: Colors, dark: boolean, indent: string) =>
  Object.entries(namedColors(colors, dark)).map(([name, value]) => `${indent}--${name}: ${value};\n`).join('');

export const gtk4Css = ({ light, dark }: Palette) =>
  `:root {\n${variables(light.colors, false, '  ')}}\n@media (prefers-color-scheme: dark) {\n  :root {\n${variables(dark.colors, true, '    ')}  }\n}\n`;

export function gtk3Css(colors: Colors, dark: boolean): string {
  const named = namedColors(colors, dark);
  const modern = Object.entries(named).map(([name, value]) => `@define-color ${name.replaceAll('-', '_')} ${value};\n`);
  const legacy = LEGACY_NAMES.map(([name, source]) => `@define-color ${name} ${named[source]};\n`);
  return [...modern, ...legacy].join('');
}

const FLOATING_STATES = [
  'popup', 'maximized', 'fullscreen', 'tiled', 'tiled-top', 'tiled-right', 'tiled-bottom', 'tiled-left',
].map(state => `:not(.${state})`).join('');

export const gtk3WindowCss = `headerbar, headerbar:backdrop, .titlebar:not(headerbar), .titlebar:backdrop:not(headerbar) { box-shadow: none; }
window.csd${FLOATING_STATES} decoration { box-shadow: 0 3px 9px 1px rgba(0, 0, 0, 0.5); }
window.csd${FLOATING_STATES} decoration:backdrop { box-shadow: 0 3px 9px 1px transparent, 0 2px 6px 2px rgba(0, 0, 0, 0.2); }
messagedialog.csd decoration { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
`;

export const gtk4WindowCss = `window.csd${FLOATING_STATES} { outline: none; box-shadow: 0 0 14px 5px rgba(0, 0, 0, 0.15), 0 0 5px 2px rgba(0, 0, 0, 0.1); }
window.csd${FLOATING_STATES}:backdrop { box-shadow: 0 0 14px 5px transparent, 0 0 10px 5px rgba(0, 0, 0, 0.08); }
`;
