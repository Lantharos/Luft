import type { ElementLayout, Taskbar, TaskbarElement, TaskbarElementOptions, View } from '../../api/v1/types.js';
import type { Stub } from './accept.js';

const EMPTY: View = { type: 'row', children: [] };

type Asked = (layout: ElementLayout) => Promise<unknown>;

export const elementAnchors = new WeakMap<object, TaskbarElement>();

class Views {
  private readonly known = new Map<string, { view: View; generation: number }>();
  private readonly asked = new Map<string, number>();
  private generation = 0;

  constructor(private ask: Asked | null, private readonly arrived: () => void) {}

  get asking(): Asked | null {
    return this.ask;
  }

  get(layout: ElementLayout): View | null {
    if (!this.ask) return null;
    const key = JSON.stringify(layout);
    const known = this.known.get(key);
    if (!known && !this.asked.has(key)) this.fetch(key, layout);
    return known?.view ?? EMPTY;
  }

  replace(ask: Asked | null): void {
    this.ask = ask;
    this.generation++;
    if (!ask) {
      this.known.clear();
      this.asked.clear();
      return;
    }
    for (const key of new Set([...this.known.keys(), ...this.asked.keys()])) this.fetch(key, JSON.parse(key) as ElementLayout);
  }

  private fetch(key: string, layout: ElementLayout): void {
    const generation = this.generation;
    const settled = () => {
      if (this.asked.get(key) === generation) this.asked.delete(key);
    };
    this.asked.set(key, generation);
    this.ask!(layout).then(view => {
      settled();
      if (!this.ask || generation < (this.known.get(key)?.generation ?? -1)) return;
      this.known.set(key, { view: view as View, generation });
      this.arrived();
    }, settled);
  }
}

type Changes = Partial<Omit<TaskbarElementOptions, 'key' | 'content' | 'expanded'>> & { content?: Stub; expanded?: Stub | null };
type Shown = Partial<Omit<TaskbarElementOptions, 'key'>>;

export function sandboxedElement(taskbar: Taskbar, options: TaskbarElementOptions & { content: Stub; expanded?: Stub }) {
  let real: TaskbarElement | null = null;
  const refresh = () => real?.refresh();
  const content = new Views(options.content, refresh);
  const expanded = new Views(options.expanded ?? null, refresh);
  real = taskbar.addElement({
    ...options,
    content: layout => content.get(layout)!,
    expanded: options.expanded && (layout => expanded.get(layout)!),
  });
  const element = {
    update: (changes: Changes) => {
      const { content: newContent, expanded: newExpanded, ...rest } = changes;
      const shown: Shown = rest;
      content.replace(newContent ?? content.asking);
      if ('expanded' in changes) shown.expanded = newExpanded ? layout => expanded.get(layout)! : undefined;
      expanded.replace('expanded' in changes ? newExpanded ?? null : expanded.asking);
      real!.update(shown);
    },
    refresh: () => {
      content.replace(content.asking);
      expanded.replace(expanded.asking);
    },
    dispose: () => real!.dispose(),
  };
  elementAnchors.set(element, real);
  return element;
}
