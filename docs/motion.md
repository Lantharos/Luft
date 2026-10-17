# Motion

Kestrel and the Luft apps share one set of motion tokens, so the shell and the apps move at the same pace. They live in [`packages/motion/tokens.json`](../packages/motion/tokens.json); Kestrel reads them when it is built, and `packages/ui` turns them into CSS.

The rules of thumb:

- Anything that moves and can be interrupted or follows a gesture uses a spring, so it can change direction mid-way without a jump.
- Opacity and colour use short timed fades.
- Exits are shorter than entrances and start moving at once. There is no ease-in curve.

## Tokens

### Durations

| Token | ms | For |
| --- | --- | --- |
| `tap` | 83 | Hover and press fills, the fade-out of menus and tooltips |
| `quick` | 167 | Exits, switches, tooltips in, closing dialogs |
| `standard` | 250 | Menus, popovers, dialogs and banners in, pages entering |
| `large` | 333 | Full-screen changes that aren't springs |

### Curves

| Token | Value | For |
| --- | --- | --- |
| `decelerate` | `cubic-bezier(0, 0, 0, 1)` | Entrances and timed exits |
| `point` | `cubic-bezier(0.55, 0.55, 0, 1)` | Moving something from one place to another without a spring |

Short opacity fades on small things are linear.

### Springs

A spring is given by its duration, how long it takes to come visually close to its target from rest, and its bounce: 0 never overshoots, higher values do. With duration *d* in seconds, bounce *b* and a mass of 1, the stiffness is (2π / *d*)² and the damping (1 − *b*) · 4π / *d*.

| Token | Duration | Bounce | For |
| --- | --- | --- | --- |
| `snappy` | 250 ms | 0 | Flyouts, popovers, banners, small things moving |
| `smooth` | 350 ms | 0 | Windows, workspaces, the board camera, the lock curtain |
| `thrown` | 400 ms | 0.12 | Settling after a fling that carried real speed |

A spring ends once it is within half a device pixel of its target and moving less than a pixel per frame, so its invisible tail doesn't keep the screen repainting.

### Gestures

| Token | Value | For |
| --- | --- | --- |
| `rubberband` | 0.55 | How hard content resists being pulled past its end: the offset is (1 − 1 / (*x* · 0.55 / *D* + 1)) · *D* for a pull of *x* on a view of size *D* |
| `deceleration` | 0.997 | Where a fling would come to rest, per millisecond, to decide which page or workspace it lands on |
| `directionLock` | 10 px | How far a swipe moves before it commits to a direction |

After changing `tokens.json`, run `bun run generate` in `packages/motion` to update the apps' CSS; `bun run check` there tells whether it is up to date.

## In Kestrel

`ease()` takes the tokens directly:

```js
import {Curve, Duration, Spring} from './kestrelUi.js';

actor.ease({translation_y: 0, spring: Spring.snappy});
actor.ease({opacity: 255, duration: Duration.standard, curve: Curve.decelerate});
actor.ease({translation_x: target, spring: Spring.smooth, velocity: releaseSpeed});
```

- `spring` runs a native spring that computes its position at every frame's own time, with no JavaScript per frame.
- When a new `ease()` replaces a running spring on the same property, the new one starts from the current position with the current speed. Opening something and closing it half-way through turns it around smoothly.
- `velocity` sets the starting speed in the property's units per second, for example the speed of a finger at release. It can also map property names to speeds.
- `curve` takes one of the curves, in place of `mode`.
- `St.Adjustment.ease()` and `ease_property()` take the same options.

`Shell.SpringTransition` is the transition underneath, for code that builds its own transitions. `kestrel/ui/src/shared/motion.ts` exports the tokens with `reducedMotion()`, `rubberband()` and `projection()`, which turns a release speed into the distance a fling would travel.

## In the apps

`@luft/ui`'s styles define every token as a CSS custom property:

| Property | Value |
| --- | --- |
| `--motion-tap`, `--motion-quick`, `--motion-standard`, `--motion-large` | The durations |
| `--ease-decelerate`, `--ease-point` | The curves, also as Tailwind's `ease-decelerate` and `ease-point` |
| `--spring-snappy`, `--spring-smooth`, `--spring-thrown` | Each spring from rest as a `linear()` easing |
| `--spring-snappy-duration` and so on | The time each of those takes to settle |

Tailwind's `transition` utilities default to `--motion-tap` and `--ease-decelerate`.

```css
.sheet {
	transition: translate var(--spring-snappy-duration) var(--spring-snappy);
}
```

A CSS spring always starts from rest. For something that can be interrupted or thrown, `SpringValue` runs the spring through the Web Animations API and picks up the current position and speed whenever it is retargeted:

```ts
import { SpringValue, Spring } from '@luft/ui';

const offset = new SpringValue(element, (x) => ({ translate: `${x}px 0` }));
offset.set(fingerX);
offset.to(0, { velocity: releaseSpeed, spring: Spring.thrown });
```
