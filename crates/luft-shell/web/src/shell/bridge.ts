import type { ShellAction, ShellSnapshot, ShellSurface } from "./model";
import { emptySnapshot } from "./model";

declare global {
  interface Window {
    __LUFT_INITIAL_STATE__?: ShellSnapshot;
    __LUFT_SURFACE__?: ShellSurface;
    sabine?: {
      bridge?: NativeBridge;
      window?: NativeWindowControls;
      popup?: NativePopupControls;
    };
    ipc?: { postMessage: (message: string) => void };
    luftShell?: {
      setSnapshot: (snapshot: ShellSnapshot) => void;
    };
  }
}

type NativeBridge = {
  commands: string[];
  invoke<T>(name: string, params?: Record<string, unknown>): Promise<T>;
  listen?<T>(name: string, callback: (payload: T) => void): () => void;
};

type NativeWindowControls = {
  close?: () => void;
  minimize?: () => void;
  toggleMaximize?: () => void;
  startDrag?: () => void;
};

type NativePopupControls = {
  open?: (options: {
    x: number;
    y: number;
    width: number;
    height: number;
    html?: string;
    url?: string;
  }) => void | Promise<unknown>;
  close?: () => void | Promise<unknown>;
};

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
let currentSnapshot = normalizeSnapshot(window.__LUFT_INITIAL_STATE__);
let currentRevision = 0;
let receivedNativeState = false;

export const getSnapshot = () => currentSnapshot;

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  listener(currentSnapshot);
  return () => listeners.delete(listener);
};

export const sendAction = (action: ShellAction) => {
  const bridge = window.sabine?.bridge;
  if (bridge?.commands.includes("luft.action")) {
    void bridge.invoke(
      "luft.action",
      action as unknown as Record<string, unknown>,
    );
    return;
  }
  window.ipc?.postMessage(JSON.stringify(action));
};

window.luftShell = {
  setSnapshot(snapshot: ShellSnapshot) {
    applySnapshot(snapshot);
  },
};

void initializeNativeBridge();

async function initializeNativeBridge() {
  const bridge = await waitForNativeBridge();
  if (!bridge) return;

  bridge.listen?.<ShellSnapshot>("luft.snapshot", (snapshot) => {
    receivedNativeState = true;
    currentRevision = Math.max(currentRevision, 1);
    applySnapshot(snapshot);
  });
  bridge.listen?.<NativePatch>("luft.patch", applyPatch);

  if (!bridge.commands.includes("luft.ready")) return;
  try {
    const ready = await bridge.invoke<NativeReady>("luft.ready");
    if (ready.surface) {
      window.__LUFT_SURFACE__ = ready.surface;
    }
    if (ready.snapshot && !receivedNativeState) {
      applySnapshot(ready.snapshot);
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

async function waitForNativeBridge(): Promise<NativeBridge | undefined> {
  if (!isSabineRuntime()) return undefined;

  const deadline = performance.now() + 2000;
  while (performance.now() < deadline) {
    if (window.sabine?.bridge) {
      return window.sabine.bridge;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }
  return undefined;
}

function isSabineRuntime() {
  return (
    Boolean(window.sabine?.bridge) ||
    new URLSearchParams(window.location.search).has("sabine")
  );
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
  if (window.__LUFT_SURFACE__) {
    return window.__LUFT_SURFACE__;
  }
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
