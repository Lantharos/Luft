import type Shell from 'gi://Shell';

export function terminateOnceShown(): void {
  const shell = global as unknown as Shell.Global;
  const stage = shell.stage;
  let painted = 0;
  const id = stage.connect('after-paint', () => {
    if (++painted < 2) {
      stage.queue_redraw();
      return;
    }
    stage.disconnect(id);
    shell.context.terminate();
  });
  stage.queue_redraw();
}
