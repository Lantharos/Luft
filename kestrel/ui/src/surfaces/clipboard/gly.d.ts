declare module 'gi://Gly' {
  import type Gio from 'gi://Gio';
  import type GLib from 'gi://GLib';

  namespace Gly {
    enum MemoryFormatSelection { R8G8B8A8_PREMULTIPLIED = 4 }

    class Loader {
      static new_for_bytes(bytes: GLib.Bytes): Loader;
      set_accepted_memory_formats(formats: MemoryFormatSelection): void;
      load_async(cancellable: Gio.Cancellable | null): Promise<Image>;
    }

    class Image {
      get_width(): number;
      get_height(): number;
      next_frame_async(cancellable: Gio.Cancellable | null): Promise<Frame>;
    }

    class Frame {
      get_width(): number;
      get_height(): number;
      get_stride(): number;
      get_buf_bytes(): GLib.Bytes;
    }
  }

  export default Gly;
}
