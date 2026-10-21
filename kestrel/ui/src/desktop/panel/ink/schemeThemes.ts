import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { Shadow, TaskbarHalos } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { panelSurface, type PanelSurface } from '../backdrop.js';
import type { Rgb } from '../../../appearance/color.js';

export type Scheme = 'light' | 'dark';
export type Halo = 'status-halo' | 'strong-halo' | 'no-halo';
export type InkPart = 'ink' | 'soft-halo' | Halo;

const PLACEHOLDER = /\.kestrel-panel-(ink|soft-halo|status-halo|strong-halo|no-halo)(?![\w-])/;

const css = (shadow: St.Shadow | null): Shadow | null => shadow && {
  x: shadow.xoffset, y: shadow.yoffset, blur: shadow.blur, spread: shadow.spread, color: shadow.color.to_string(),
};

const templateFile = (scheme: Scheme) => Gio.File.new_for_uri(`resource:///com/lantharos/kestrel/theme/panel-ink-${scheme}.css`);

function readTemplates(scheme: Scheme): Map<InkPart, string> {
  const css = new TextDecoder().decode(templateFile(scheme).load_contents(null)[1]);
  const parts = new Map<InkPart, string>();
  for (const rule of css.split('}')) {
    const part = rule.match(PLACEHOLDER)?.[1] as InkPart | undefined;
    if (part) parts.set(part, `${parts.get(part) ?? ''}${rule.trim()} }\n`);
  }
  return parts;
}

export class SchemeTheme {
  private readonly theme: St.Theme;
  private readonly templates: Map<InkPart, string>;
  private readonly stage: St.ThemeNode;
  readonly ink: Rgb;

  constructor(readonly scheme: Scheme) {
    this.theme = new St.Theme({ default_stylesheet: templateFile(scheme) });
    this.templates = readTemplates(scheme);
    this.stage = St.ThemeNode.new(this.context, null, this.theme, GObject.TYPE_NONE, null, null, null, '');
    const { red, green, blue } = this.node('kestrel-panel-ink').get_foreground_color();
    this.ink = [red, green, blue];
  }

  private get context(): St.ThemeContext {
    return St.ThemeContext.get_for_stage(global.stage);
  }

  private node(classes: string | null, parent = this.stage, type = St.Widget.$gtype): St.ThemeNode {
    return St.ThemeNode.new(this.context, parent, this.theme, type, null, classes, null, '');
  }

  inkFills(): { focused: string; dot: string } {
    const panel = this.node('kestrel-panel-ink');
    const background = (classes: string) => this.node(classes, panel).get_background_color().to_string();
    return { focused: background('kestrel-app-focused'), dot: background('kestrel-running-dot') };
  }

  halos(part: InkPart): TaskbarHalos {
    const panel = this.node(`kestrel-panel-${part}`);
    const status = this.node('kestrel-panel-status', panel);
    return {
      icon: css(this.node(null, status, St.Icon.$gtype).get_shadow('icon-shadow')),
      text: css(this.node(null, status, St.Label.$gtype).get_shadow('text-shadow')),
      dot: css(this.node('kestrel-running-dot', panel).get_shadow('box-shadow')),
    };
  }

  surface(classes: string, blurred: boolean): PanelSurface {
    return panelSurface(this.node(`kestrel-panel-surface ${classes}`), blurred);
  }

  rules(part: InkPart, selector: string): string {
    return this.templates.get(part)!.replaceAll(`.kestrel-panel-${part}`, selector);
  }
}

let themes: Record<Scheme, SchemeTheme> | null = null;

export function schemeThemes(): Record<Scheme, SchemeTheme> {
  themes ??= { light: new SchemeTheme('light'), dark: new SchemeTheme('dark') };
  return themes;
}
