import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

export const MouseSpriteContent = GObject.registerClass({
  Implements: [Clutter.Content],
}, class MouseSpriteContent extends GObject.Object {
  declare invalidate: () => void;
  declare invalidate_size: () => void;

  private scale = 1;
  private monitorScaleValue = 1;
  private spriteTexture: Cogl.Texture | null = null;

  vfunc_get_preferred_size(): [boolean, number, number] {
    if (!this.spriteTexture) return [false, 0, 0];

    return [true, this.spriteTexture.get_width() / this.scale, this.spriteTexture.get_height() / this.scale];
  }

  vfunc_paint_content(actor: Clutter.Actor, node: Clutter.PaintNode): void {
    if (!this.spriteTexture) return;

    const [minFilter, magFilter] = actor.get_content_scaling_filters();
    const textureNode = Clutter.TextureNode.new(this.spriteTexture, null, minFilter!, magFilter!);
    textureNode.set_name('MouseSpriteContent');
    node.add_child(textureNode);

    textureNode.add_rectangle(actor.get_content_box());
  }

  private textureScale(): number {
    if (!this.spriteTexture) return 1;

    const avgSize = (this.spriteTexture.get_width() + this.spriteTexture.get_height()) / 2;
    return Math.max(1, Math.floor(avgSize / Meta.prefs_get_cursor_size() + .1));
  }

  private recomputeScale(): boolean {
    const scale = this.textureScale() / this.monitorScaleValue;
    if (this.scale === scale) return false;

    this.scale = scale;
    return true;
  }

  set texture(texture: Cogl.Texture | null) {
    if (this.spriteTexture === texture) return;

    const oldTexture = this.spriteTexture;
    this.spriteTexture = texture;
    this.invalidate();

    if (!oldTexture || !texture ||
      oldTexture.get_width() !== texture.get_width() ||
      oldTexture.get_height() !== texture.get_height()) {
      this.recomputeScale();
      this.invalidate_size();
    }
  }

  set monitorScale(monitorScale: number) {
    this.monitorScaleValue = monitorScale;
    if (this.recomputeScale()) this.invalidate_size();
  }
});
export type MouseSpriteContent = InstanceType<typeof MouseSpriteContent>;
