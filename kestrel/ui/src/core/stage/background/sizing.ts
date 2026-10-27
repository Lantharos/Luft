import GDesktopEnums from 'gi://GDesktopEnums';
import type Gio from 'gi://Gio';

import * as BackgroundStore from '../backgroundStore.js';

export interface MonitorGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  geometry_scale: number;
}

interface Size {
  width: number;
  height: number;
}

function displaySizes(monitors: MonitorGeometry[]): Size[] {
  return monitors.map(({ width, height, geometry_scale: scale }) =>
    ({ width: Math.ceil(width * scale), height: Math.ceil(height * scale) }));
}

export function displaySignature(monitors: MonitorGeometry[]): string {
  return displaySizes(monitors).map(({ width, height }) => `${width}x${height}`).join(',');
}

export async function storeKey(file: Gio.File, style: GDesktopEnums.BackgroundStyle, monitors: MonitorGeometry[], cancellable: Gio.Cancellable | null): Promise<string> {
  return `${await BackgroundStore.identify(file, cancellable)} ${style} ${displaySignature(monitors)}`;
}

export function textureKey(file: Gio.File, style: GDesktopEnums.BackgroundStyle, monitors: MonitorGeometry[]): string {
  return `${file.get_uri()} ${style} ${displaySignature(monitors)}`;
}

export function fittedSize(width: number, height: number, style: GDesktopEnums.BackgroundStyle, monitors: MonitorGeometry[]): Size | null {
  const { BackgroundStyle } = GDesktopEnums;
  const sizes = displaySizes(monitors);
  let scale;
  switch (style) {
  case BackgroundStyle.ZOOM:
  case BackgroundStyle.STRETCHED:
    scale = Math.max(...sizes.map(size => Math.max(size.width / width, size.height / height)));
    break;
  case BackgroundStyle.SCALED:
    scale = Math.max(...sizes.map(size => Math.min(size.width / width, size.height / height)));
    break;
  case BackgroundStyle.SPANNED: {
    const factor = Math.max(...monitors.map(monitor => monitor.geometry_scale));
    const spanWidth = Math.max(...monitors.map(monitor => monitor.x + monitor.width)) - Math.min(...monitors.map(monitor => monitor.x));
    const spanHeight = Math.max(...monitors.map(monitor => monitor.y + monitor.height)) - Math.min(...monitors.map(monitor => monitor.y));
    scale = Math.max(spanWidth * factor / width, spanHeight * factor / height);
    break;
  }
  default:
    return null;
  }

  if (scale >= 1) return null;
  return { width: Math.ceil(width * scale), height: Math.ceil(height * scale) };
}
