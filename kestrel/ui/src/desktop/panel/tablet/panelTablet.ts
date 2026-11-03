import { band } from '../../../shared/layout/edge.js';
import { animateActor, reducedMotion, Spring } from '../../../shared/motion/motion.js';
import type { Launcher } from '../launcher/launcher.js';
import type { KestrelPanel } from '../panel.js';
import type { TaskbarSurface } from '../preferences/taskbarLook.js';
import type { Taskbar } from '../taskbar/taskbar.js';
import { afterWindowsReach } from './windowsReach.js';

interface Shape {
  width: number;
  radius: number;
}

/** Turns a panel into the touch taskbar and back, morphing the bar in place when it stays on the same edge. */
export class PanelTablet {
  private stopWaiting = () => {};

  constructor(private readonly panel: KestrelPanel, private readonly surface: TaskbarSurface, private readonly launcher: Launcher,
    private readonly taskbar: Taskbar) {}

  stop(): void {
    this.stopWaiting();
  }

  sync(immediate = false): void {
    const { panel } = this;
    const screen = panel.screen;
    if (screen.touch === panel.tablet.shown) return;
    this.stopWaiting();
    this.surface.syncPeek();
    if (immediate || !panel.monitor) this.switch();
    else if (reducedMotion() || !panel.shownJoined || screen.edge !== panel.shownEdge) panel.fade(() => this.switch());
    else this.morph();
  }

  private fit(): void {
    const metrics = this.panel.screen.metrics;
    this.launcher.button.visible = this.panel.screen.startButton;
    this.panel.arrange();
    this.launcher.resize(metrics.button);
    this.taskbar.resize(metrics);
    this.panel.elements.resize();
  }

  private switch(): void {
    const { panel } = this;
    if (panel.screen.touch) panel.tablet.enter(() => this.fit(), true);
    else {
      this.fit();
      panel.tablet.leave(true);
      if (panel.autoHide.shown) panel.actor.translation_y = 0;
    }
    panel.place();
  }

  private morph(): void {
    const { panel } = this;
    const from = { width: panel.actor.width, radius: this.surface.radius };
    if (panel.screen.touch) {
      panel.tablet.enter(() => this.fit(), false);
      panel.reserve();
      const strut = band(panel.monitor!, panel.shownEdge, panel.screen.reserved);
      this.stopWaiting = afterWindowsReach(panel.monitor!, strut.y, () => {
        if (panel.autoHide.shown) animateActor(panel.actor, { translation_y: panel.tablet.rest, spring: Spring.smooth });
        this.morphTo(from);
      });
      return;
    }
    this.fit();
    panel.tablet.leave(false);
    if (panel.autoHide.shown) {
      animateActor(panel.actor, {
        translation_y: 0, spring: Spring.smooth,
        onStopped: () => { if (!panel.tablet.shown) panel.reserve(); },
      });
    } else panel.reserve();
    this.morphTo(from);
  }

  private morphTo(from: Shape): void {
    const { panel } = this;
    const to = { ...panel.frame, radius: panel.screen.metrics.radius };
    animateActor(panel.actor, { x: to.x, y: to.y, width: to.width, height: to.height, spring: Spring.smooth });
    this.morphRadius(from, to);
    panel.autoHide.place();
  }

  private morphRadius(from: Shape, to: Shape): void {
    const width = this.panel.actor.get_transition('width');
    if (from.radius === to.radius || !width) return;
    this.surface.shape(from.radius);
    width.connect('new-frame', () => {
      const progress = (this.panel.actor.width - from.width) / (to.width - from.width);
      this.surface.shape(from.radius + (to.radius - from.radius) * progress);
    });
    width.connect('stopped', () => this.surface.shape(null));
  }
}
