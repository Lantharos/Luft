import type Clutter from 'gi://Clutter';
import type St from 'gi://St';

interface EaseSpring {
  duration: number;
  bounce: number;
}

export interface EaseOptions {
  duration?: number;
  delay?: number;
  mode?: Clutter.AnimationMode;
  repeatCount?: number;
  autoReverse?: boolean;
  animationRequired?: boolean;
  curve?: readonly number[];
  spring?: EaseSpring;
  velocity?: number | Record<string, number>;
  epsilon?: number;
  onComplete?: () => void;
  onStopped?: (isFinished: boolean) => void;
}

export type EaseProperties = EaseOptions & { [property: string]: unknown };

declare module '@girs/gobject-2.0/gobject-2.0' {
  namespace GObject {
    interface Object {
      connectObject(...args: unknown[]): void;
      disconnectObject(owner: object): void;
    }

    namespace ParamSpec {
      function override(name: string, owner: { $gtype: GType }): ParamSpec;
    }
  }
}

declare module '@girs/glib-2.0/glib-2.0' {
  namespace GLib {
    function timeout_add_once(priority: number, interval: number, callback: () => void): number;
    function timeout_add_seconds_once(priority: number, interval: number, callback: () => void): number;
    function idle_add_once(priority: number, callback: () => void): number;
  }
}

declare module '@girs/clutter-51/clutter-51' {
  namespace Clutter {
    interface Actor {
      ease(properties: EaseProperties): void;
      easeAsync(properties: EaseProperties): Promise<void>;
      ease_property(property: string, target: unknown, options: EaseOptions): void;
      ease_property_async(property: string, target: unknown, options: EaseOptions): Promise<void>;
      [Symbol.iterator](): Generator<Actor, void, undefined>;
    }

    interface GridLayout {
      hookup_style(container: St.Widget): void;
    }

    interface BoxLayout {
      hookup_style(container: St.Widget): void;
    }
  }
}

declare module '@girs/st-51/st-51' {
  namespace St {
    interface Adjustment {
      ease(target: number, options: EaseOptions): void;
      easeAsync(target: number, options: EaseOptions): Promise<void>;
    }
  }
}
