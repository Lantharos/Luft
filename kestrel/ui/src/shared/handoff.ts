export function terminateOnceShown(): void {
  const stage = global.stage;
  let painted = 0;
  const id = stage.connect('after-paint', () => {
    if (++painted < 2) {
      stage.queue_redraw();
      return;
    }
    stage.disconnect(id);
    global.context.terminate();
  });
  stage.queue_redraw();
}
