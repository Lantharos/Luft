import type { ShellAction, ShellSnapshot, ShellSurface } from "./model";
import { emptySnapshot } from "./model";
import { bridge, invoke, isAvailable, listen } from "@lantharos/sabine";

type NativeReady = {
  surface?: ShellSurface;
  snapshot?: ShellSnapshot;
};

type NativePatch = {
  revision: number;
  changes: Partial<ShellSnapshot>;
};

type Listener = (snapshot: ShellSnapshot) => void;

const listeners = new Set<Listener>();
let currentSnapshot = normalizeSnapshot();
let currentRevision = 0;
let receivedNativeState = false;

export const getSnapshot = () => currentSnapshot;

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  listener(currentSnapshot);
  return () => listeners.delete(listener);
};

export const sendAction = (action: ShellAction) => {
  if (!isAvailable() || !bridge.commands().includes("luft.action")) {
    console.error("Luft shell action bridge is unavailable", action);
    return;
  }
  void invoke("luft.action", action as unknown as Record<string, unknown>).catch(
    (error) => console.error("Luft shell action failed", error),
  );
};

void initializeNativeBridge();

async function initializeNativeBridge() {
  if (!isAvailable()) {
    if (isSabineRuntime()) {
      console.error("Sabine did not install the Luft shell bridge");
    }
    return;
  }

  listen<ShellSnapshot>("luft.snapshot", (snapshot) => {
    receivedNativeState = true;
    currentRevision = Math.max(currentRevision, 1);
    applySnapshot(snapshot);
  });
  listen<NativePatch>("luft.patch", applyPatch);

  if (!bridge.commands().includes("luft.ready")) return;
  try {
    const ready = await invoke<NativeReady>("luft.ready");
    if (ready.snapshot && !receivedNativeState) {
      applySnapshot(ready.snapshot);
    } else if (ready.surface && !receivedNativeState) {
      applySnapshot({ ...currentSnapshot, surface: ready.surface });
    }
  } catch (error) {
    console.error("failed to initialize luft shell bridge", error);
  }
}

function applySnapshot(snapshot: ShellSnapshot) {
  currentSnapshot = normalizeSnapshot(snapshot);
  for (const listener of listeners) {
    listener(currentSnapshot);
  }
}

function applyPatch(patch: NativePatch) {
  if (!Number.isSafeInteger(patch.revision) || patch.revision <= currentRevision) {
    return;
  }
  receivedNativeState = true;
  currentRevision = patch.revision;
  applySnapshot({ ...currentSnapshot, ...patch.changes });
}

function isSabineRuntime() {
  return isAvailable() || new URLSearchParams(window.location.search).has("sabine");
}

function normalizeSnapshot(snapshot?: ShellSnapshot): ShellSnapshot {
  return {
    ...emptySnapshot(),
    ...snapshot,
    surface: surfaceFromRuntime(snapshot),
    palette: {
      ...emptySnapshot().palette,
      ...snapshot?.palette,
    },
    status: {
      ...snapshot?.status,
    },
    panelApps: (snapshot?.panelApps ?? emptySnapshot().panelApps).map((app) => ({
      ...app,
      windowIds: app.windowIds ?? (app.windowId === undefined ? [] : [app.windowId]),
    })),
  };
}

function surfaceFromRuntime(snapshot?: ShellSnapshot): ShellSurface {
  if (snapshot?.surface) {
    return snapshot.surface;
  }
  const query = new URLSearchParams(window.location.search);
  const surface = query.get("surface");
  if (isSurface(surface)) {
    return surface;
  }
  return "panel";
}

function isSurface(value: string | null): value is ShellSurface {
  return (
    value === "panel" ||
    value === "panel-menu" ||
    value === "session-menu" ||
    value === "quick-settings" ||
    value === "date-center" ||
    value === "notification-toast" ||
    value === "start-menu"
  );
}
