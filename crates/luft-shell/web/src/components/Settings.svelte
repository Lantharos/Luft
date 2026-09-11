<script lang="ts">
  import { onMount } from "svelte";
  import { invoke, isAvailable } from "@lantharos/sabine";
  import { initialSettingsPage, settingsPages, type SettingsConfig, type SettingsState, type ConnectedOutput } from "../lib/settings_model";
  import { settingsError } from "../lib/settings_validation";
  import Icon from "./Icon.svelte";
  import InputSettings from "./settings/InputSettings.svelte";
  import AppearanceSettings from "./settings/AppearanceSettings.svelte";
  import DisplaySettings from "./settings/DisplaySettings.svelte";
  import SessionSettings from "./settings/SessionSettings.svelte";
  import AppSettings from "./settings/AppSettings.svelte";
  import "../styles/settings.css";

  let page = $state(initialSettingsPage());
  let config = $state<SettingsConfig | null>(null);
  let original = $state.raw<SettingsConfig | null>(null);
  let outputs = $state.raw<ConnectedOutput[]>([]);
  let outputsError = $state<string | null>(null);
  let busy = $state(false);
  let error = $state("");
  let notice = $state("");
  const title = $derived(settingsPages.find((item) => item.id === page)?.label ?? "Settings");
  const dirty = $derived(config !== null && JSON.stringify(config) !== JSON.stringify(original));

  onMount(() => { void load(); });

  async function load() {
    busy = true;
    error = "";
    notice = "";
    try {
      if (!isAvailable()) throw new Error("Open Luft Settings from the desktop to read your settings.");
      const state = await invoke<SettingsState>("settings.read", {});
      original = state.config;
      config = structuredClone(state.config);
      outputs = state.outputs;
      outputsError = state.outputs_error;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    } finally {
      busy = false;
    }
  }

  async function save() {
    if (!config || !original || busy || !dirty) return;
    error = settingsError(config, outputs) ?? "";
    notice = "";
    if (error) return;
    busy = true;
    try {
      const next = JSON.parse(JSON.stringify(config)) as SettingsConfig;
      next.session.startup_apps = next.session.startup_apps.map((command) => command.trim()).filter(Boolean);
      const saved = await invoke<SettingsConfig>("settings.save", { original, config: next });
      original = saved;
      config = structuredClone(saved);
      notice = "Settings saved.";
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    } finally {
      busy = false;
    }
  }

  async function openTool(tool: "network" | "audio" | "bluetooth") {
    error = "";
    notice = "";
    try {
      await invoke("settings.open-tool", { tool });
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
  }

  function keydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void save();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="settings-app">
  <aside class="settings-sidebar">
    <h1>Settings</h1>
    <nav aria-label="Settings pages">
      {#each settingsPages as item (item.id)}
        <button type="button" class={['settings-nav-item', { 'is-active': item.id === page }]}
          aria-current={item.id === page ? "page" : undefined} onclick={() => { page = item.id; error = ""; notice = ""; }}>
          <Icon name={item.icon} /><span>{item.label}</span>
        </button>
      {/each}
    </nav>
  </aside>

  <div class="settings-main">
    <header class="settings-page-heading"><h2>{title}</h2></header>
    <div class="settings-content" aria-busy={busy}>
      {#if config}
        <fieldset disabled={busy}>
          {#if page === "appearance"}<AppearanceSettings bind:config />
          {:else if page === "display"}<DisplaySettings bind:display={config.display} {outputs} {outputsError} />
          {:else if page === "input"}<InputSettings bind:input={config.input} />
          {:else if page === "power"}<SessionSettings bind:session={config.session} />
          {:else if page === "apps"}<AppSettings bind:config />
          {:else if page === "network"}
            <section class="settings-section settings-tool">
              <Icon name="network" /><h2>Network connections</h2>
              <p>Manage wired connections, Wi-Fi and VPN profiles in NetworkManager.</p>
              <button type="button" class="settings-button" onclick={() => openTool("network")}>Open Network Connections</button>
            </section>
            <section class="settings-section settings-tool">
              <Icon name="bluetooth" /><h2>Bluetooth devices</h2>
              <p>Pair devices and manage Bluetooth connections with Blueman.</p>
              <button type="button" class="settings-button" onclick={() => openTool("bluetooth")}>Open Bluetooth Manager</button>
            </section>
          {:else if page === "audio"}
            <section class="settings-section settings-tool">
              <Icon name="volume" /><h2>Sound devices & applications</h2>
              <p>Choose playback and recording devices, adjust application volume and manage audio profiles.</p>
              <button type="button" class="settings-button" onclick={() => openTool("audio")}>Open Volume Control</button>
            </section>
          {/if}
        </fieldset>
      {:else if busy}<p class="settings-note">Loading settings…</p>{/if}
    </div>
    <footer class="settings-footer">
      <div class="settings-feedback">
        {#if error}<p class="settings-error" role="alert">{error}</p>
        {:else}<p role="status">{busy ? "Working…" : dirty ? "Unsaved changes" : notice}</p>{/if}
      </div>
      <div class="settings-footer-actions">
        <button type="button" class="settings-button" disabled={busy} onclick={load}>Reload</button>
        <button type="button" class="settings-button is-primary" disabled={busy || !dirty} onclick={save}>Save Changes</button>
      </div>
    </footer>
  </div>
</div>
