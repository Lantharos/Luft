import Clutter from 'gi://Clutter';

import { MouseSpriteContent } from '../../../../system/accessibility/mouseSprite.js';
import type { ExtensionHost } from '../../../host.js';

type ShownAt = (x: number, y: number) => [number, number];

/**
 * Windows stay straight under a filter that bends the desktop, so over them the real pointer is right. Over the desktop
 * it takes this stand-in, drawn where the bent picture shows what the pointer is on.
 */
export class DesktopPointer {
  private readonly tracker = global.backend.get_cursor_tracker();
  private readonly content = new MouseSpriteContent();
  private readonly sprite = new Clutter.Actor({ name: 'kestrel-desktop-pointer', request_mode: Clutter.RequestMode.CONTENT_SIZE, content: this.content, visible: false });
  private readonly signals: number[];

  constructor(private readonly host: ExtensionHost, private readonly shownAt: ShownAt, private readonly onDesktop: (actor: Clutter.Actor) => boolean) {
    host.addPopup(this.sprite);
    this.signals = [
      this.tracker.connect('position-invalidated', () => this.follow()),
      this.tracker.connect('cursor-changed', () => this.dress()),
    ];
    this.dress();
    this.follow();
  }

  private dress(): void {
    const sprite = this.tracker.get_sprite();
    if (sprite) this.content.texture = sprite;
    const [hotX, hotY] = this.tracker.get_hot();
    this.sprite.set({ translation_x: -hotX, translation_y: -hotY });
  }

  private show(shown: boolean): void {
    if (shown === this.sprite.visible) return;
    this.sprite.visible = shown;
    if (shown) this.tracker.inhibit_cursor_visibility();
    else this.tracker.uninhibit_cursor_visibility();
  }

  private follow(): void {
    const [point] = this.tracker.get_pointer();
    const { x, y } = point!;
    const monitor = this.host.monitorAt(x, y);
    const under = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    this.show(!!monitor && this.onDesktop(under));
    if (!monitor || !this.sprite.visible) return;
    const [shownX, shownY] = this.shownAt((x - monitor.x) / monitor.width, (y - monitor.y) / monitor.height);
    this.content.monitorScale = global.display.get_monitor_scale(monitor.index);
    this.sprite.set_position(monitor.x + shownX * monitor.width, monitor.y + shownY * monitor.height);
  }

  destroy(): void {
    for (const signal of this.signals) this.tracker.disconnect(signal);
    this.show(false);
    this.host.removePopup(this.sprite);
    this.sprite.destroy();
  }
}
