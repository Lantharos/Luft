import type { TaskbarLookPaint, TaskbarLooks } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { toHex, type Seed } from '../../../appearance/color.js';
import type { Paint } from '../../../appearance/icons/paint.js';
import type { Palette } from '../../../appearance/palette.js';
import { markFills } from '../launcher/shade.js';
import { schemeThemes, type Scheme } from './schemeThemes.js';
import { lookInks, tintsOf, type LookInk } from './taskbarStylesheet.js';
import { taskbarScheme } from './taskbarScheme.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';

function lookPaint({ look, surface, backdrops, ink, halo }: LookInk, palette: Palette, paint: Paint | null): TaskbarLookPaint {
  const theme = schemeThemes()[ink];
  const transparent = look === 'transparent';
  const soft = theme.halos('soft-halo');
  return {
    surface: `rgba(${surface.tint.join(', ')}, ${surface.opacity})`,
    glass: surface.glass,
    ink: toHex(theme.ink),
    mark: markFills(toHex(theme.ink), paint, backdrops),
    ...theme.inkFills(),
    focusedDot: palette[ink].colors.primary,
    iconHalo: transparent ? soft.icon : null,
    status: transparent && halo === 'no-halo' ? soft : theme.halos(halo),
  };
}

export function taskbarLooks(seed: Seed, palette: Palette, style: Scheme, pureBlack: boolean, paint: Paint | null): TaskbarLooks {
  const opaque = pureBlack && style === 'dark';
  const scheme = taskbarScheme(style, opaque, wallpaperFloor);
  const looks: Partial<TaskbarLooks> = {};
  for (const choice of lookInks(scheme, tintsOf(seed, palette[scheme].colors)))
    if (opaque || !choice.opaque) looks[choice.look] = lookPaint(choice, palette, paint);
  return looks as TaskbarLooks;
}
