import type Mtk from 'gi://Mtk';

export class Monitor {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  constructor(readonly index: number, geometry: Mtk.Rectangle, readonly geometry_scale: number) {
    this.x = geometry.x;
    this.y = geometry.y;
    this.width = geometry.width;
    this.height = geometry.height;
  }

  get inFullscreen(): boolean {
    return global.display.get_monitor_in_fullscreen(this.index);
  }
}
