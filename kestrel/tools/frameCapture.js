import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

export async function captureRenderedFrames(path, action) {
  let snapshot = null;
  let texture = null;
  const signal = global.stage.connect('after-paint', (_stage, view) => {
    const framebuffer = view.get_framebuffer();
    const width = framebuffer.get_width();
    const height = framebuffer.get_height();
    if (!snapshot) {
      texture = Cogl.Texture2D.new_with_size(framebuffer.get_context(), width, height);
      snapshot = Cogl.Offscreen.new_with_texture(texture);
    }
    framebuffer.blit(snapshot, 0, 0, 0, 0, width, height);
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  if (!texture) throw new Error('No frame was rendered during capture');
  const stream = Gio.File.new_for_path(path).replace(null, false, Gio.FileCreateFlags.NONE, null);
  try {
    await new Promise((resolve, reject) => {
      Shell.Screenshot.composite_to_stream(texture, 0, 0, texture.get_width(), texture.get_height(),
        1, null, 0, 0, 1, stream, (_source, result) => {
          try {
            Shell.Screenshot.composite_to_stream_finish(result);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  } finally {
    stream.close(null);
  }
}
