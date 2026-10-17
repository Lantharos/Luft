# @luft/web

What Luft's websites share: colours, fonts, motion, the logo and the links between them.

```css
@import 'tailwindcss';
@import '@luft/web/styles.css';
```

| Export | Holds |
| --- | --- |
| `@luft/web/styles.css` | Colour tokens, Open Runde and Maple Mono, and Luft's motion tokens, for Tailwind 4 |
| `@luft/web/logo.svg` | The Luft mark, drawn in `currentColor` |
| `@luft/web` | `urls` and `nav` for the header, and the motion tokens for scripts |

## Colours

Taken from the palette Luft builds from its Fog wallpaper. They follow the system's light or dark style; `data-scheme="light"` or `"dark"` on `<html>` forces one.

| Tailwind | Variable | For |
| --- | --- | --- |
| `bg-canvas` | `--canvas` | The page |
| `bg-raised`, `bg-well` | `--raised`, `--well` | Raised areas and inset fills |
| `text-ink`, `text-ink-soft`, `text-ink-muted` | `--ink`, … | Text, from strongest to quietest |
| `bg-accent`, `text-accent-ink` | `--accent`, `--accent-ink` | Main buttons and links |
| `border-hairline` | `--hairline` | Dividers |
| `bg-glass` | `--glass` | Translucent bars, with `backdrop-blur` |

`--dark-*` and `--light-*` hold each style's value, for places that always use one.

## Fonts

`font-sans` is Open Runde, with a size-matched fallback so text doesn't move when it loads, and `font-mono` is Maple Mono. The fonts come from `packages/ui/fonts`. Preload the regular weight:

```astro
---
import openRunde from '../../../packages/ui/fonts/OpenRunde-Regular.woff2?url';
---
<link rel="preload" href={openRunde} as="font" type="font/woff2" crossorigin />
```

## Motion

The same tokens as the desktop and its apps: durations `--motion-tap|quick|standard|large`, curves `--ease-decelerate` and `--ease-point`, and springs as `--spring-snappy|smooth|thrown` with `--spring-…-duration`. Use springs for movement, short fades for opacity, and keep everything still under `prefers-reduced-motion`.
