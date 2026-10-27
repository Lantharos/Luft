import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gly from 'gi://Gly';

import type { FrameData } from './samples.js';

Gio._promisify(Gly.Loader.prototype, 'load_async');
Gio._promisify(Gly.Image.prototype, 'next_frame_async');

const ACCEPTED_FORMATS =
  Gly.MemoryFormatSelection.B8G8R8A8_PREMULTIPLIED |
  Gly.MemoryFormatSelection.A8R8G8B8_PREMULTIPLIED |
  Gly.MemoryFormatSelection.R8G8B8A8_PREMULTIPLIED |
  Gly.MemoryFormatSelection.B8G8R8A8 |
  Gly.MemoryFormatSelection.A8R8G8B8 |
  Gly.MemoryFormatSelection.R8G8B8A8 |
  Gly.MemoryFormatSelection.A8B8G8R8 |
  Gly.MemoryFormatSelection.R8G8B8 |
  Gly.MemoryFormatSelection.B8G8R8 |
  Gly.MemoryFormatSelection.R16G16B16A16_PREMULTIPLIED |
  Gly.MemoryFormatSelection.R16G16B16A16 |
  Gly.MemoryFormatSelection.R16G16B16A16_FLOAT |
  Gly.MemoryFormatSelection.R32G32B32A32_FLOAT_PREMULTIPLIED |
  Gly.MemoryFormatSelection.R32G32B32A32_FLOAT;

const COGL_FORMATS = new Map<Gly.MemoryFormat, Cogl.PixelFormat>([
  [Gly.MemoryFormat.B8G8R8A8_PREMULTIPLIED, Cogl.PixelFormat.BGRA_8888_PRE],
  [Gly.MemoryFormat.A8R8G8B8_PREMULTIPLIED, Cogl.PixelFormat.ARGB_8888_PRE],
  [Gly.MemoryFormat.R8G8B8A8_PREMULTIPLIED, Cogl.PixelFormat.RGBA_8888_PRE],
  [Gly.MemoryFormat.B8G8R8A8, Cogl.PixelFormat.BGRA_8888],
  [Gly.MemoryFormat.A8R8G8B8, Cogl.PixelFormat.ARGB_8888],
  [Gly.MemoryFormat.R8G8B8A8, Cogl.PixelFormat.RGBA_8888],
  [Gly.MemoryFormat.A8B8G8R8, Cogl.PixelFormat.ABGR_8888],
  [Gly.MemoryFormat.R8G8B8, Cogl.PixelFormat.RGB_888],
  [Gly.MemoryFormat.B8G8R8, Cogl.PixelFormat.BGR_888],
  [Gly.MemoryFormat.R16G16B16A16_PREMULTIPLIED, Cogl.PixelFormat.RGBA_16161616_PRE],
  [Gly.MemoryFormat.R16G16B16A16, Cogl.PixelFormat.RGBA_16161616],
  [Gly.MemoryFormat.R16G16B16A16_FLOAT, Cogl.PixelFormat.RGBA_FP_16161616],
  [Gly.MemoryFormat.R32G32B32A32_FLOAT_PREMULTIPLIED, Cogl.PixelFormat.RGBA_FP_32323232_PRE],
  [Gly.MemoryFormat.R32G32B32A32_FLOAT, Cogl.PixelFormat.RGBA_FP_32323232],
]);

export interface DecodedFrame extends FrameData {
  bytes: GLib.Bytes;
}

interface Size {
  width: number;
  height: number;
}

function coglContext(): Cogl.Context {
  return global.stage.context.get_backend().get_cogl_context();
}

export async function loadFrame(file: Gio.File, cancellable: Gio.Cancellable | null): Promise<[DecodedFrame, Clutter.ColorState | null]> {
  const stream = await file.read_async(GLib.PRIORITY_DEFAULT, cancellable);
  const loader = Gly.Loader.new_for_stream(stream);
  loader.set_accepted_memory_formats(ACCEPTED_FORMATS);

  const image = await loader.load_async(cancellable);
  const frame = await image.next_frame_async(cancellable);

  const width = frame.get_width();
  const height = frame.get_height();
  const stride = frame.get_stride();
  const bytes = frame.get_buf_bytes();
  const format = frame.get_memory_format();
  const cicp = frame.get_color_cicp();

  let colorState: Clutter.ColorState | null = null;
  if (cicp) {
    const clutterCicp = new Clutter.Cicp();
    clutterCicp.primaries = cicp.color_primaries;
    clutterCicp.transfer = cicp.transfer_characteristics;
    clutterCicp.matrix_coefficients = cicp.matrix_coefficients;
    clutterCicp.video_full_range_flag = cicp.video_full_range_flag;

    try {
      colorState = Clutter.ColorStateParams.new_from_cicp(global.stage.context, clutterCicp);
    } catch (e) {
      logError(e as Error, 'Failed to create color state from CICP');
    }
  }

  return [{ width, height, stride, bytes, format }, colorState];
}

export function createTexture({ width, height, stride, format }: FrameData, data: Uint8Array<ArrayBuffer>): Cogl.Texture {
  const coglFormat = COGL_FORMATS.get(format);
  if (coglFormat === undefined) throw new Error(`Unsupported glycin memory format: ${format}`);

  const ctx = coglContext();
  const components = Gly.memory_format_has_alpha(format)
    ? Cogl.TextureComponents.RGBA
    : Cogl.TextureComponents.RGB;

  let texture: Cogl.Texture = Cogl.Texture2D.new_with_size(ctx, width, height);
  texture.set_components(components);

  try {
    texture.allocate();
  } catch {
    texture = Cogl.Texture2DSliced.new_with_size(ctx, width, height, Cogl.TEXTURE_MAX_WASTE);
    texture.set_components(components);
  }

  if (!texture.set_data(coglFormat, stride, data, 0)) throw new Error('Failed to set texture data');

  return texture;
}

export function fitTexture(texture: Cogl.Texture, size: Size | null): Cogl.Texture {
  if (!size) return texture;

  const ctx = coglContext();
  const fitted = Cogl.Texture2D.new_with_size(ctx, size.width, size.height);
  fitted.set_components(texture.get_components());
  const framebuffer = Cogl.Offscreen.new_with_texture(fitted);
  framebuffer.allocate();
  framebuffer.orthographic(0, 0, size.width, size.height, -1, 1);
  framebuffer.clear4f(Cogl.BufferBit.COLOR, 0, 0, 0, 0);
  const pipeline = Cogl.Pipeline.new(ctx);
  pipeline.set_layer_texture(0, texture);
  pipeline.set_layer_filters(0, Cogl.PipelineFilter.LINEAR_MIPMAP_LINEAR, Cogl.PipelineFilter.LINEAR);
  pipeline.set_blend('RGBA = ADD (SRC_COLOR, 0)');
  framebuffer.draw_rectangle(pipeline, 0, 0, size.width, size.height);
  framebuffer.finish();
  return fitted;
}
