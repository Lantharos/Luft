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
| `snappy` | 250 ms | 0 | Flyouts, popovers, banners, small things moving, workspace switches, the board turning on and off |
| `smooth` | 350 ms | 0 | Moving and resizing windows, the board camera, the lock curtain |
| `thrown` | 400 ms | 0.12 | Settling after a fling that carried real speed |

A spring ends once it is within half a device pixel of its target and moving less than a pixel per frame, so its invisible tail doesn't keep the screen repainting.

### Gestures

| Token | Value | For |
| --- | --- | --- |
| `rubberband` | 0.55 | How hard content resists being pulled past its end: the offset is (1 − 1 / (*x* · 0.55 / *D* + 1)) · *D* for a pull of *x* on a view of size *D* |
| `deceleration` | 0.997 | Where a fling would come to rest, per millisecond, to decide which page or workspace it lands on |
| `directionLock` | 10 px | How far a swipe moves before it commits to a direction |

After changing `tokens.json`, run `bun run generate` in `packages/motion` to update the apps' CSS and the shell theme's `sass/_motion.scss`; `bun run check` there tells whether they are up to date.

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
- A spring keeps a property inside its range. Opacity released with speed toward 0 rests at 0 while the spring swings back, instead of wrapping around.
- A release speed counts only the motion since the fingers last changed direction, so turning a swipe around settles with the speed it ends with.
- `curve` takes one of the curves, in place of `mode`.
- `St.Adjustment.ease()` and `ease_property()` take the same options.

The theme's stylesheets have the durations as `$motion-tap`, `$motion-quick`, `$motion-standard` and `$motion-large`. Hover and press feedback uses `$motion-tap`; state changes such as switches and selections use `$motion-quick`.

`Shell.SpringTransition` is the transition underneath, for code that builds its own transitions. `kestrel/ui/src/shared/motion.ts` exports the tokens with `reducedMotion()`, `rubberband()` and `projection()`, which turns a release speed into the distance a fling would travel.

### Windows

- A window opens once its first frame has been drawn: it fades in over `quick` with `decelerate` while it grows from 94% and rises 8 px on `snappy`. Dialogs start at 96% without the rise.
- Closing fades it out over `quick` and shrinks it to 95% on `snappy`, staying above the window that takes focus.
- Maximizing, restoring, snapping, Snap Layouts and corner snaps move the window on `smooth` from the moment they start. A picture of the window that keeps its corners and title bar ends unstretched leads until the app has drawn its new size, then crossfades to the live window over `quick`.
- Work that follows a window opening or closing, such as refreshing the taskbar, waits for the motion to end: pass it to `afterMotion()` from `kestrel/ui/src/shared/afterMotion.ts`.

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

### Presets

`@luft/ui` has Svelte transitions for the things apps show and hide, so they enter and leave the same way everywhere. Each enters on `standard` with `decelerate` and leaves within `quick`, and under reduced motion only fades:

| Preset | Enters | Leaves |
| --- | --- | --- |
| `page` | Rises 16 px | Fades |
| `dialog` | Settles from 105% | Grows to 105% while it fades in 83 ms |
| `fade` | Fades | Fades |
| `toast` | Rises 16 px on `snappy` | Drops 8 px |
| `item` | Grows from 98% | Fades |
| `menu` | Through CSS, once placed | Fades in 83 ms |

```svelte
{#key view}
	<div in:page out:page>…</div>
{/key}

{#each devices as device (device.id)}
	<div class="row-slot" animate:reorder in:item out:item>…</div>
{/each}
```

`reorder` slides list items to their new places as others arrive and leave. Inside a `Section`, wrap each row in a `row-slot` so the dividers stay between rows.

A few helpers cover the rest:

- `selectionPill()` attaches to a sidebar's list and slides one highlight to the item marked `aria-current="page"`, so selected items need no background of their own.
- The `progress-fill` class draws a progress bar's fill from `--progress`, between 0 and 1, and moves it with a translation on `smooth` instead of changing its width.
- `springTiming(Spring.snappy)` gives Web Animations the timing of a spring from rest, for one-off animations such as a panel that changes size.

Toasts go through `Toast` and a `Toasts` store, which shows one toast at a time, pauses while the pointer is on it, and can be swiped away:

```svelte
<script lang="ts">
	import { Toast, Toasts } from '@luft/ui';

	const toasts = new Toasts();
	toasts.show('Moved to the bin', { action: { label: 'Undo', run: undo } });
</script>

<Toast toast={toasts.current} ondismiss={toasts.dismiss} onhold={toasts.hold} onrelease={toasts.release} />
```

## Gestures

Swiping between workspaces with three fingers follows the fingers: a swipe across about two thirds of the touchpad moves one workspace, using the touchpad's real size when it reports one. Past the first and last workspace the desktop resists and springs back, with the wallpaper showing beyond the edge. On release, the speed of the swipe decides where it lands, so a quick flick moves on even if it was short, and a fast one can cross several workspaces. The settle starts at the speed the fingers had. Scrolling with two fingers while holding Super works the same way.

Four fingers move between the desktop, the board and the task view, and follow the fingers the same way. Each can be turned around before letting go, resists past its end, and settles at the speed the fingers had:

| Where | Four fingers up | Four fingers down |
| --- | --- | --- |
| Desktop | Turns it into a board | Opens the task view |
| Board | | Turns it back into a desktop |
| Task view | Closes it | |

Opening the task view, windows glide from where they are on the desktop into their places and the glass fades in behind them, and closing it brings them back, so each window is only ever on screen once.

In tablet mode, swiping up from the bottom edge pulls the taskbar out of its strip under the finger, and it settles open or closed on `snappy` at the speed of the release. When the screen turns, the whole screen turns as one layer over the wallpaper on `smooth`, reshaping from the old orientation to the new. It starts as a picture of the old orientation and crossfades within the turning layer to the rearranged desktop over `quick`, so it lands on exactly what stays on screen.

Keyboard switches, Super and the wheel, and swipes all drive the same spring, so pressing Super+3 while a switch to the second workspace is still under way carries on across, and reversing turns around where the desktop is. Minimising a window and restoring it, or opening and closing Start, Quick settings, the notification center or the task view, also turn around from wherever they are.

## Reduced motion

Settings has two separate choices:

- **Appearance → Animations** turns animation off entirely. Everything changes at once.
- **Accessibility → Reduce motion** keeps animation but takes out the movement. Slides and zooms become fades, springs lose their bounce, and gestures still follow the fingers and settle.

Kestrel reads them from `org.gnome.desktop.interface enable-animations` and `org.gnome.desktop.a11y.interface reduced-motion`, and its settings portal reports either as reduced motion to other apps. In Kestrel, workspace switches become a crossfade and surfaces fade in place. The apps see them as `data-motion="off"` or `data-motion="reduced"` on the root element, and `motionPreference()` returns `full`, `reduced` or `off`. `SpringValue` changes at once under reduced motion unless it settles a gesture.
