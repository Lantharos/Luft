import type { Palette } from './palette.js';

const rgba = (hex: string, alpha: number) =>
  `rgba(${[1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')}, ${alpha})`;

export function accentStylesheet(accent: string, { light, dark }: Palette): string {
  const strong = light.colors.primary;
  const bright = dark.colors.primary;
  return `.kestrel-control.kestrel-control:checked { background-color: ${rgba(accent, 0.42)}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.52)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.6)}; }
.kestrel-calendar-day.kestrel-calendar-day:selected { background-color: ${strong}; color: ${light.colors.onPrimary}; }
.kestrel-slider.kestrel-slider { -barlevel-active-background-color: ${bright}; }
.osd-window.osd-window.kestrel-glass .level { -barlevel-active-background-color: ${bright}; }
.kestrel-app-focused.kestrel-app-focused .kestrel-running-dot { background-color: ${bright}; }
.kestrel-task-progress-fill.kestrel-task-progress-fill { background-color: ${bright}; }
.modal-dialog.modal-dialog .modal-dialog-button:default { background-color: ${rgba(strong, 0.9)}; }
.modal-dialog.modal-dialog .modal-dialog-button:default:hover { background-color: ${strong}; }
.modal-dialog.modal-dialog .check-box:checked StIcon { background-color: ${strong}; }
.kestrel-snap-zone.kestrel-snap-zone:hover, .kestrel-snap-zone.kestrel-snap-zone:focus { background-color: ${rgba(accent, 0.75)}; }
`;
}
