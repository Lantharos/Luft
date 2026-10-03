import Clutter from 'gi://Clutter';
import St from 'gi://St';
import { getInputSourceManager, type InputSource } from 'resource:///com/lantharos/kestrel/ui/status/keyboard.js';

import type { ContextMenus, MenuEntry } from '../menus/contextMenus.js';
import { ScrollSteps } from '../shared/scrollSteps.js';
import { modeSymbol, propertyEntries, visibleProperties } from './properties.js';

interface Choice {
  source: InputSource | null;
  label: string;
  name: string;
}

export class InputSourceIndicator {
  readonly actor: St.Button;
  private readonly label = new St.Label({ style_class: 'kestrel-input-source-label', y_align: Clutter.ActorAlign.CENTER });
  private readonly manager = getInputSourceManager();
  private readonly steps = new ScrollSteps();

  constructor(private readonly menus: ContextMenus, private readonly extraEntries: (layout: string | null) => MenuEntry[]) {
    this.actor = new St.Button({
      name: 'kestrel-input-source', style_class: 'kestrel-status-button', child: this.label,
      can_focus: true, visible: false, button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
    });
    this.actor.connect('clicked', () => this.open());
    this.actor.connect('scroll-event', (_actor, event) => {
      this.scroll(this.steps.step(event));
      return Clutter.EVENT_STOP;
    });
    this.manager.connectObject(
      'sources-changed', () => this.sync(),
      'current-source-changed', () => this.sync(),
      'keymap-changed', () => this.sync(), this);
    this.sync();
  }

  contains(actor: Clutter.Actor | null): boolean {
    return !!actor && this.actor.contains(actor);
  }

  shutdown(): void {
    this.manager.disconnectObject(this);
  }

  private get sources(): InputSource[] {
    const sources = this.manager.inputSources;
    return Object.keys(sources).map(Number).sort((a, b) => a - b).map(index => sources[index]);
  }

  private choices(): { choices: Choice[]; current: Choice | undefined } {
    const { keyboardManager, currentSource } = this.manager;
    const external: Choice[] = keyboardManager.isExternal()
      ? [{ source: null, label: keyboardManager.shortName.toUpperCase(), name: keyboardManager.displayName }]
      : [];
    const choices = keyboardManager.isLocked() ? external : [
      ...external,
      ...this.sources.map(source => ({ source, label: source.shortName, name: source.displayName })),
    ];
    return { choices, current: external[0] ?? choices.find(choice => choice.source === currentSource) };
  }

  private sync(): void {
    const { choices, current } = this.choices();
    const properties = current?.source?.properties ?? null;
    this.actor.visible = !!current && (choices.length > 1 || visibleProperties(properties).length > 0);
    if (!current) return;
    this.label.text = modeSymbol(properties) ?? current.label;
    this.actor.accessible_name = `Input source: ${current.name}`;
  }

  private open(): void {
    const { choices, current } = this.choices();
    const entries: MenuEntry[] = choices.map(choice => ({
      label: choice.name, detail: choice.label, checked: choice === current, enabled: !!choice.source,
      run: () => choice.source?.activate(true),
    }));
    const properties = propertyEntries(current?.source?.properties ?? null);
    if (properties.length) entries.push('separator', ...properties);
    const extras = this.extraEntries(this.layout());
    if (extras.length) entries.push('separator', ...extras);
    const [x, y] = this.actor.get_transformed_position();
    this.menus.open(this.actor, entries, Math.round(x + this.actor.width / 2), Math.round(y));
  }

  private layout(): string | null {
    return this.manager.keyboardManager.currentLayout?.id ?? this.sources.find(source => source.type === 'xkb')?.id ?? null;
  }

  private scroll(step: number): void {
    const sources = this.sources;
    if (!step || sources.length < 2) return;
    const index = sources.indexOf(this.manager.currentSource!);
    sources[(index + step + sources.length) % sources.length].activate(true);
  }
}
