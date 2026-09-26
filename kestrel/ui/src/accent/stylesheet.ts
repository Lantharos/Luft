import { withLightness, type Rgb } from './color.js';

const rgba = ([red, green, blue]: Rgb, alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;

export function accentStylesheet(accent: Rgb): string {
  const strong = withLightness(accent, 0.42);
  const light = withLightness(accent, 0.7);
  return `.kestrel-control.kestrel-control:checked { background-color: ${rgba(accent, 0.42)}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.52)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.6)}; }
.kestrel-calendar-day.kestrel-calendar-day:selected { background-color: ${rgba(strong, 1)}; color: #ffffff; }
.kestrel-slider.kestrel-slider { -barlevel-active-background-color: ${rgba(light, 1)}; }
.osd-window.osd-window.kestrel-glass .level { -barlevel-active-background-color: ${rgba(light, 1)}; }
.kestrel-app-focused.kestrel-app-focused .kestrel-running-dot { background-color: ${rgba(light, 1)}; }
.modal-dialog.modal-dialog .modal-dialog-button:default { background-color: ${rgba(strong, 0.9)}; }
.modal-dialog.modal-dialog .modal-dialog-button:default:hover { background-color: ${rgba(strong, 1)}; }
.modal-dialog.modal-dialog .check-box:checked StIcon { background-color: ${rgba(strong, 1)}; }
.kestrel-snap-zone.kestrel-snap-zone:hover, .kestrel-snap-zone.kestrel-snap-zone:focus { background-color: ${rgba(accent, 0.75)}; }
`;
}
