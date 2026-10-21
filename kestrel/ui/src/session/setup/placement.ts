import Meta from 'gi://Meta';

function center(window: Meta.Window): void {
  const area = window.get_work_area_current_monitor();
  const frame = window.get_frame_rect();
  window.move_frame(true, area.x + Math.round((area.width - frame.width) / 2), area.y + Math.round((area.height - frame.height) / 2));
  window.activate(global.get_current_time());
}

export function centerOnArrival(): () => void {
  const display = global.display;
  const created = display.connect('window-created', (_display, window: Meta.Window) => {
    if (window.get_window_type() !== Meta.WindowType.NORMAL) return;
    const shown = window.connect('shown', () => {
      window.disconnect(shown);
      center(window);
    });
  });
  return () => display.disconnect(created);
}
