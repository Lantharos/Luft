<script lang="ts">
  import { sendAction } from "../shell/bridge";
  import type { PanelApp, ShellSnapshot, WindowItem } from "../shell/model";
  import AppIcon from "./AppIcon.svelte";
  import Icon from "./Icon.svelte";

  let { snapshot }: { snapshot: ShellSnapshot } = $props();
  const app = $derived(snapshot.panelApps.find((entry) => entry.command === snapshot.panelMenuCommand));
  const window = $derived(app ? matchedWindow(app, snapshot.windows) : undefined);
  const isRunning = $derived(Boolean(window ?? app?.running));
  const canLaunch = $derived(Boolean(app && launchable(app)));
  const isMaximized = $derived(window?.state === "maximized");

  function close() {
    sendAction({ type: "panel-menu-close" });
  }

  function open(app: PanelApp, forceNew = false) {
    close();
    if (!forceNew && window) {
      sendAction({ type: "window-activate", window: window.id });
    } else if (app.windowId !== undefined && !forceNew) {
      sendAction({ type: "window-activate", window: app.windowId });
    } else {
      sendAction({ type: "panel-launch", command: app.command });
    }
  }

  function unpin(app: PanelApp) {
    close();
    sendAction({ type: "panel-unpin", command: app.command });
  }

  function pin(app: PanelApp) {
    close();
    sendAction({ type: "panel-pin", label: app.label, command: app.command });
  }

  function minimize(window: WindowItem) {
    close();
    sendAction({ type: "window-minimize", window: window.id });
  }

  function toggleMaximize(window: WindowItem) {
    close();
    sendAction({ type: "window-toggle-maximize", window: window.id });
  }

  function closeWindow(window: WindowItem) {
    close();
    sendAction({ type: "window-close", window: window.id });
  }

  function forceQuit(app: PanelApp) {
    close();
    sendAction({ type: "panel-force-quit", command: app.command });
  }

  function matchedWindow(app: PanelApp, windows: WindowItem[]) {
    return (
      windows.find((window) => window.active && app.windowIds.includes(window.id)) ??
      windows.find((window) => window.visible && app.windowIds.includes(window.id)) ??
      windows.find((window) => app.windowIds.includes(window.id)) ??
      windows.find((window) => window.active && window.visible && windowMatchesApp(window, app)) ??
      windows.find((window) => window.visible && windowMatchesApp(window, app)) ??
      windows.find((window) => windowMatchesApp(window, app))
    );
  }

  function windowMatchesApp(window: WindowItem, app: PanelApp) {
    if (app.windowIds.includes(window.id)) return true;
    if (app.windowId === window.id) return true;
    const command = commandName(app.command);
    const label = app.label.toLowerCase();
    return [window.appId, window.title].some((value) => {
      const text = value?.toLowerCase() ?? "";
      return Boolean(text && ((command && text.includes(command)) || (label && text.includes(label))));
    });
  }

  function commandName(command: string) {
    return command.trim().split(/\s+/)[0]?.split("/").at(-1)?.replace(/^['"]|['"]$/g, "").toLowerCase() ?? "";
  }

  function launchable(app: PanelApp) {
    return !app.command.startsWith("window:") && !app.command.startsWith("window-group:");
  }
</script>

<section class="panel-menu-shell">
  {#if app}
    <div class="panel-menu" role="menu" tabindex="-1" data-command={app.command} onpointerdown={(event) => event.stopPropagation()}>
      <header class="panel-menu-header">
        <span class="panel-menu-icon"><AppIcon {app} /></span>
        <span class="panel-menu-identity">
          <strong>{app.label}</strong>
          {#if window}
            <span>{window.title}</span>
          {:else if isRunning}
            <span>Running</span>
          {:else}
            <span>Not running</span>
          {/if}
        </span>
      </header>

      {#if window}
        {#if !window.active || canLaunch}
          <div class="panel-menu-group">
            {#if !window.active}
              <button type="button" class="panel-menu-item" role="menuitem" onclick={() => open(app)}>
                <Icon name="app" />
                <span>Show Window</span>
              </button>
            {/if}
            {#if canLaunch}
              <button type="button" class="panel-menu-item" role="menuitem" onclick={() => open(app, true)}>
                <Icon name="plus" />
                <span>New Window</span>
              </button>
            {/if}
          </div>
        {/if}

        <div class="panel-menu-group">
          <button type="button" class="panel-menu-item" role="menuitem" onclick={() => minimize(window)}>
            <Icon name="minimize" />
            <span>Minimize</span>
          </button>
          <button type="button" class="panel-menu-item" role="menuitem" onclick={() => toggleMaximize(window)}>
            <Icon name="maximize" />
            <span>{isMaximized ? "Restore" : "Maximize"}</span>
          </button>
          <button type="button" class="panel-menu-item" role="menuitem" onclick={() => closeWindow(window)}>
            <Icon name="close" />
            <span>Close Window</span>
          </button>
        </div>
      {:else if canLaunch}
        <div class="panel-menu-group">
          <button type="button" class="panel-menu-item" role="menuitem" onclick={() => open(app, true)}>
            <Icon name={isRunning ? "plus" : "app"} />
            <span>{isRunning ? "New Window" : "Open"}</span>
          </button>
        </div>
      {/if}

      {#if app.pinned || canLaunch}
        <div class="panel-menu-group">
          {#if app.pinned}
            <button type="button" class="panel-menu-item" role="menuitem" onclick={() => unpin(app)}>
              <Icon name="panel" />
              <span>Remove from Panel</span>
            </button>
          {:else}
            <button type="button" class="panel-menu-item" role="menuitem" onclick={() => pin(app)}>
              <Icon name="panel" />
              <span>Keep in Panel</span>
            </button>
          {/if}
        </div>
      {/if}

      {#if isRunning}
        <div class="panel-menu-group">
          <button type="button" class="panel-menu-item is-danger" role="menuitem" onclick={() => forceQuit(app)}>
            <Icon name="power" />
            <span>Force Quit</span>
          </button>
        </div>
      {/if}
    </div>
  {/if}
</section>
