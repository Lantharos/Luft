import type Clutter from 'gi://Clutter';
import type St from 'gi://St';

export interface EaseSpring {
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

declare module 'gi://GObject?version=2.0' {
  export namespace GObject {
    interface Object {
      connectObject(...args: unknown[]): void;
      disconnectObject(owner: object): void;
    }

    namespace ParamSpec {
      function override(name: string, owner: { $gtype: GType }): ParamSpec;
    }
  }
}

declare module 'gi://GLib?version=2.0' {
  export namespace GLib {
    function timeout_add_once(priority: number, interval: number, callback: () => void): number;
    function timeout_add_seconds_once(priority: number, interval: number, callback: () => void): number;
    function idle_add_once(priority: number, callback: () => void): number;
  }
}

declare module 'gi://Clutter?version=51' {
  export namespace Clutter {
    interface Actor {
      ease(properties: EaseProperties): void;
      easeAsync(properties: EaseProperties): Promise<void>;
      ease_property(property: string, target: unknown, options: EaseOptions): void;
      [Symbol.iterator](): Generator<Actor, void, undefined>;
    }

    interface GridLayout {
      hookup_style(container: St.Widget): void;
    }
  }
}

declare module 'gi://St?version=51' {
  export namespace St {
    interface Adjustment {
      ease(target: number, options: EaseOptions): void;
    }
  }
}
