import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gly from 'gi://Gly';
import type Shell from 'gi://Shell';
import St from 'gi://St';

Gio._promisify(Gly.Loader.prototype, 'load_async');
Gio._promisify(Gly.Image.prototype, 'next_frame_async');

const PIXEL_LIMIT = 40_000_000;

const ROUNDED_CORNERS = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, 'uniform vec2 thumbnail_size; uniform float corner_radius;', `
  vec2 position = cogl_tex_coord_in[0].xy * thumbnail_size;
  vec2 corner = max(abs(position - thumbnail_size * 0.5) - (thumbnail_size * 0.5 - corner_radius), 0.0);
  cogl_color_out *= clamp(corner_radius + 0.5 - length(corner), 0.0, 1.0);
`);

export interface ThumbnailBounds {
  width: number;
  height: number;
  radius: number;
}

export interface Thumbnail {
  content: Clutter.Content;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
}

const shell = () => global as unknown as Shell.Global;

function displayScale(): number {
  const { display } = shell();
  return Math.max(...Array.from({ length: display.get_n_monitors() }, (_, monitor) => display.get_monitor_scale(monitor)));
}

function fit(width: number, height: number, bounds: ThumbnailBounds): [number, number] {
  const scale = Math.min(1, bounds.width / width, bounds.height / height);
  return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
}

async function decode(bytes: GLib.Bytes): Promise<Gly.Frame | null> {
  const loader = Gly.Loader.new_for_bytes(bytes);
  loader.set_accepted_memory_formats(Gly.MemoryFormatSelection.R8G8B8A8_PREMULTIPLIED);
  const image = await loader.load_async(null);
  if (image.get_width() * image.get_height() > PIXEL_LIMIT) return null;
  return image.next_frame_async(null);
}

function render(frame: Gly.Frame, bounds: ThumbnailBounds): Thumbnail {
  const context = shell().stage.context.get_backend().get_cogl_context();
  const source = new St.ImageContent();
  const [imageWidth, imageHeight] = [frame.get_width(), frame.get_height()];
  source.set_bytes(context, frame.get_buf_bytes(), Cogl.PixelFormat.RGBA_8888_PRE, imageWidth, imageHeight, frame.get_stride());

  const [width, height] = fit(imageWidth, imageHeight, bounds);
  const scale = displayScale();
  const [pixelWidth, pixelHeight] = [Math.ceil(width * scale), Math.ceil(height * scale)];
  const texture = Cogl.Texture2D.new_with_size(context, pixelWidth, pixelHeight);
  const framebuffer = Cogl.Offscreen.new_with_texture(texture);
  framebuffer.allocate();
  framebuffer.orthographic(0, 0, pixelWidth, pixelHeight, -1, 1);
  framebuffer.clear4f(Cogl.BufferBit.COLOR, 0, 0, 0, 0);

  const pipeline = Cogl.Pipeline.new(context);
  pipeline.set_layer_texture(0, source.get_texture()!);
  pipeline.set_layer_filters(0, Cogl.PipelineFilter.LINEAR_MIPMAP_LINEAR, Cogl.PipelineFilter.LINEAR);
  pipeline.set_blend('RGBA = ADD (SRC_COLOR, 0)');
  pipeline.add_snippet(ROUNDED_CORNERS);
  pipeline.set_uniform_float(pipeline.get_uniform_location('thumbnail_size'), 2, 1, [pixelWidth, pixelHeight]);
  pipeline.set_uniform_1f(pipeline.get_uniform_location('corner_radius'), Math.min(bounds.radius * scale, pixelWidth / 2, pixelHeight / 2));
  framebuffer.draw_rectangle(pipeline, 0, 0, pixelWidth, pixelHeight);
  framebuffer.flush();

  return { content: Clutter.TextureContent.new_from_texture(texture, null), width, height, imageWidth, imageHeight };
}

export async function createThumbnail(bytes: GLib.Bytes, bounds: ThumbnailBounds): Promise<Thumbnail | null> {
  try {
    const frame = await decode(bytes);
    return frame && render(frame, bounds);
  } catch (error) {
    if (error instanceof GLib.Error) return null;
    throw error;
  }
}
