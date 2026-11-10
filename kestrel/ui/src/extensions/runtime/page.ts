import type { BuiltPage } from '../api/v1/ui/settingsPage/serialize.js';

type Wrap = <Args extends unknown[], Result>(callback: (...args: Args) => Result) => (...args: Args) => Result | undefined;

export class ExtensionPage {
  private build: (() => BuiltPage | null) | null = null;
  private wrap: Wrap | null = null;
  private callbacks = new Map<string, (value: unknown) => void>();

  constructor(private readonly announce: () => void) {}

  get described(): boolean {
    return !!this.build;
  }

  describe(build: (() => BuiltPage | null) | null, wrap: Wrap): void {
    this.build = build;
    this.wrap = wrap;
    this.callbacks.clear();
    this.announce();
  }

  changed(): void {
    if (this.build) this.announce();
  }

  json(): string {
    const built = this.build?.();
    this.callbacks = built?.callbacks ?? new Map();
    return built?.json ?? '';
  }

  act(callback: string, value: unknown): void {
    const run = this.callbacks.get(callback);
    if (!run || !this.wrap) throw new Error('That control is gone; the page changed since');
    this.wrap(run)(value);
  }
}
