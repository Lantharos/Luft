import type Mtk from 'gi://Mtk';

import type { Box } from '../../shared/layout/placement.js';
import type { RecordedWindow } from './record.js';

const within = (frame: Box, area: Mtk.Rectangle) =>
  frame.x >= area.x && frame.y >= area.y && frame.x + frame.width <= area.x + area.width && frame.y + frame.height <= area.y + area.height;

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

export function fitted(saved: RecordedWindow): RecordedWindow {
  const display = global.display;
  const kept = saved.monitor >= 0 && saved.monitor < display.get_n_monitors();
  const monitor = kept ? saved.monitor : display.get_primary_monitor();
  if (kept && within(saved.frame, display.get_monitor_geometry(monitor))) return saved;
  const area = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(monitor);
  const width = Math.min(saved.frame.width, area.width);
  const height = Math.min(saved.frame.height, area.height);
  const frame = kept
    ? { x: clamp(saved.frame.x, area.x, area.x + area.width - width), y: clamp(saved.frame.y, area.y, area.y + area.height - height), width, height }
    : { x: area.x + Math.round((area.width - width) / 2), y: area.y + Math.round((area.height - height) / 2), width, height };
  return { ...saved, monitor, frame, edges: 0 };
}
