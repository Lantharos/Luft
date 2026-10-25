import type Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import type GObject from 'gi://GObject';
import type Mtk from 'gi://Mtk';

declare module '@girs/meta-51/meta-51' {
  namespace Meta {
    enum WindowContentType {
      NONE = 0,
      PHOTO = 1,
      VIDEO = 2,
      GAME = 3,
    }

    interface Window {
      unconstrained: boolean;
      magnification: number;
      get_tiled_edges(): Direction;
      set_tiled_edges(edges: Direction | 0): void;
      get_target_frame_rect(): Mtk.Rectangle;
      shortcuts_inhibited(source: Clutter.InputDevice): boolean;
      force_restore_shortcuts(source: Clutter.InputDevice): void;
      get_content_type(): WindowContentType;
      set_variable_refresh(variableRefresh: boolean): void;
      get_titlebar_height(): number;
      has_rounded_corners(): boolean;
    }

    interface WindowConfig {
      unset_maximize_flags(flags: MaximizeFlags): void;
    }

    interface Context {
      identify_sender(connection: Gio.DBusConnection, sender: string, cancellable: Gio.Cancellable | null): Promise<string>;
      set_permitted_apps(permission: string, appIds: string[]): void;
      is_app_permitted(permission: string, appId: string): boolean;
    }

    namespace Display {
      interface SignalSignatures {
        bell: (window: Window | null) => boolean;
      }
    }

    interface Display {
      set_x11_origin(x: number, y: number): void;
    }

    interface Backend {
      get_presentation_wait_us(): number;
    }

    interface WaylandCompositor {
      keep_touchpad_gestures(keep: boolean): void;
    }

    namespace MonitorManager {
      interface SignalSignatures {
        rotating: (monitor: number, from: number, to: number) => void;
      }
    }
  }
}

declare module '@girs/clutter-51/clutter-51' {
  namespace Clutter {
    namespace Event {
      function prepend_filter(stage: Stage | null, func: EventFilterFunc): number;
    }

    namespace GraphicsRecoveryContext {
      interface SignalSignatures extends GObject.Object.SignalSignatures {
        'graphics-restored': () => void;
      }
    }

    class GraphicsRecoveryContext extends GObject.Object {
      connect<K extends keyof GraphicsRecoveryContext.SignalSignatures>(
        signal: K, callback: GObject.SignalCallback<this, GraphicsRecoveryContext.SignalSignatures[K]>): number;
    }

    interface Backend {
      get_graphics_recovery_context(): GraphicsRecoveryContext;
      is_recovering(): boolean;
    }

    namespace Actor {
      interface SignalSignatures {
        'real-resource-scale-changed': () => void;
      }
    }

    interface Actor<A extends LayoutManager = LayoutManager, B extends Content = Content> {
      get_real_resource_scale(): number;
    }

    interface Seat {
      consume_held_modifiers(): void;
    }
  }
}
