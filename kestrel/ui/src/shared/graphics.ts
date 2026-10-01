import type Shell from 'gi://Shell';

interface GraphicsRecovery {
  connect(signal: 'graphics-restored', callback: () => void): number;
  disconnect(id: number): void;
}

interface RecoveringBackend {
  get_graphics_recovery_context(): GraphicsRecovery;
}

export function whenGraphicsRestored(restored: () => void): () => void {
  const backend = (global as unknown as Shell.Global).stage.context.get_backend() as unknown as RecoveringBackend;
  const recovery = backend.get_graphics_recovery_context();
  const id = recovery.connect('graphics-restored', restored);
  return () => recovery.disconnect(id);
}
