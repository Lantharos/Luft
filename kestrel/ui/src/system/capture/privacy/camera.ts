import Shell from 'gi://Shell';

let monitor: Shell.CameraMonitor | null = null;

export const cameraMonitor = (): Shell.CameraMonitor => monitor ??= new Shell.CameraMonitor();
