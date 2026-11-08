import Shell from 'gi://Shell';

export const NOTES_APP = 'com.lantharos.Heft.desktop';

interface PenActionHandlers {
  canInteract(): boolean;
  takeScreenshot(): void;
  toggleStart(): void;
}

export class PenActions {
  private readonly signal: number;

  constructor(handlers: PenActionHandlers) {
    const run: Record<string, () => void> = {
      screenshot: handlers.takeScreenshot,
      notes: () => Shell.AppSystem.get_default().lookup_app(NOTES_APP)?.activate(),
      start: handlers.toggleStart,
    };
    this.signal = global.display.connect('pen-action', (_display, _device, action: string) => {
      if (handlers.canInteract()) run[action]?.();
    });
  }

  destroy(): void {
    global.display.disconnect(this.signal);
  }
}
