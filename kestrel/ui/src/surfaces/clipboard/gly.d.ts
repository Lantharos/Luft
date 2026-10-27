declare module 'gi://Gly' {
  import type Gio from 'gi://Gio';
  import type GLib from 'gi://GLib';

  namespace Gly {
    enum MemoryFormat {
      B8G8R8A8_PREMULTIPLIED = 0,
      A8R8G8B8_PREMULTIPLIED = 1,
      R8G8B8A8_PREMULTIPLIED = 2,
      B8G8R8A8 = 3,
      A8R8G8B8 = 4,
      R8G8B8A8 = 5,
      A8B8G8R8 = 6,
      R8G8B8 = 7,
      B8G8R8 = 8,
      R16G16B16A16_PREMULTIPLIED = 10,
      R16G16B16A16 = 11,
      R16G16B16A16_FLOAT = 13,
      R32G32B32A32_FLOAT_PREMULTIPLIED = 15,
      R32G32B32A32_FLOAT = 16,
    }

    enum MemoryFormatSelection {
      B8G8R8A8_PREMULTIPLIED = 1,
      A8R8G8B8_PREMULTIPLIED = 2,
      R8G8B8A8_PREMULTIPLIED = 4,
      B8G8R8A8 = 8,
      A8R8G8B8 = 16,
      R8G8B8A8 = 32,
      A8B8G8R8 = 64,
      R8G8B8 = 128,
      B8G8R8 = 256,
      R16G16B16A16_PREMULTIPLIED = 1024,
      R16G16B16A16 = 2048,
      R16G16B16A16_FLOAT = 8192,
      R32G32B32A32_FLOAT_PREMULTIPLIED = 32768,
      R32G32B32A32_FLOAT = 65536,
    }

    function memory_format_has_alpha(format: MemoryFormat): boolean;

    class Cicp {
      color_primaries: number;
      transfer_characteristics: number;
      matrix_coefficients: number;
      video_full_range_flag: number;
    }

    class Loader {
      static new_for_bytes(bytes: GLib.Bytes): Loader;
      static new_for_stream(stream: Gio.InputStream): Loader;
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
      get_memory_format(): MemoryFormat;
      get_color_cicp(): Cicp | null;
    }
  }

  export default Gly;
}
