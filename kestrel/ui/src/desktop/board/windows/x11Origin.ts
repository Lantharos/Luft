import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import type { Box } from '../../../shared/placement.js';
import { screenBox, type View } from '../view/geometry.js';
import { frameBox } from './windows.js';

type OriginDisplay = Meta.Display & { set_x11_origin(x: number, y: number): void };

interface X11OriginHost {
  readonly view: View;
  readonly viewport: Box;
  screen(): Box;
}

function display(): OriginDisplay {
  return (global as unknown as Shell.Global).display as OriginDisplay;
}

function keepWithin(position: number, size: number, start: number, length: number): number {
  return Math.round(Math.max(start, Math.min(position, start + length - size)));
}

export class X11Origin {
  private windows: Meta.Window[] = [];
  private anchor: Meta.Window | null = null;

  constructor(private readonly host: X11OriginHost) {}

  track(windows: readonly Meta.Window[]): void {
    this.windows = windows.filter(window => window.get_client_type() === Meta.WindowClientType.X11);
    if (this.anchor && !this.windows.includes(this.anchor)) this.anchor = null;
  }

  hover(x: number, y: number): void {
    if (!this.windows.length) return;
    const window = this.windowAt(x, y);
    if (!window || window === this.anchor) return;
    this.anchor = window;
    this.apply();
  }

  settle(x: number, y: number): void {
    const focused = display().focus_window;
    this.anchor = this.windowAt(x, y) ?? (focused && this.windows.includes(focused) ? focused : this.anchor);
    this.apply();
  }

  reset(): void {
    this.windows = [];
    this.anchor = null;
    display().set_x11_origin(0, 0);
  }

  private windowAt(x: number, y: number): Meta.Window | null {
    const { view, viewport } = this.host;
    const canvasX = view.x + (x - viewport.x) / view.scale;
    const canvasY = view.y + (y - viewport.y) / view.scale;
    return this.windows.find(window => {
      const frame = window.get_frame_rect();
      return !window.minimized && canvasX >= frame.x && canvasX < frame.x + frame.width && canvasY >= frame.y && canvasY < frame.y + frame.height;
    }) ?? null;
  }

  private apply(): void {
    if (!this.anchor) return;
    const frame = frameBox(this.anchor);
    const shown = screenBox(this.host.view, this.host.viewport, frame);
    const screen = this.host.screen();
    display().set_x11_origin(
      frame.x - keepWithin(shown.x, frame.width, screen.x, screen.width),
      frame.y - keepWithin(shown.y, frame.height, screen.y, screen.height));
  }
}
