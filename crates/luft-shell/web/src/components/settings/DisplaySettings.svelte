<script lang="ts">
  import { defaultOutput, type ConnectedOutput, type OutputConfig, type SettingsConfig } from "../../lib/settings_model";
  import TextField from "./TextField.svelte";
  import NumberField from "./NumberField.svelte";
  import Choices from "./Choices.svelte";
  import OutputEditor from "./OutputEditor.svelte";
  let { display = $bindable(), outputs, outputsError }: {
    display: SettingsConfig["display"]; outputs: ConnectedOutput[]; outputsError: string | null;
  } = $props();
  let newOutput = $state("");
  let addError = $state("");
  const names = $derived([...new Set([
    ...outputs.map((output) => output.name),
    ...(display.primary ? [display.primary] : []),
    ...Object.keys(display).filter((name) => name !== "primary" && name !== "default_scale"),
  ])]);
  const primaryOptions = $derived([
    { value: "", label: "Automatic" }, ...names.map((name) => ({ value: name, label: name })),
  ]);

  function outputConfig(name: string): OutputConfig | undefined {
    const value = display[name];
    return value && typeof value === "object" ? value : undefined;
  }

  function addOutput() {
    const name = newOutput.trim();
    if (!name || ["primary", "default_scale"].includes(name)) {
      addError = "Enter a display connector name, such as DP-1 or HDMI-A-1.";
      return;
    }
    if (!outputConfig(name)) display[name] = defaultOutput();
    newOutput = "";
    addError = "";
  }
</script>

<section class="settings-section">
  <h2>Arrangement</h2>
  <Choices label="Primary display" value={display.primary ?? ""} options={primaryOptions} onchange={(value) => display.primary = value || null} />
  <NumberField label="Default scale" value={display.default_scale} onchange={(value) => display.default_scale = value ?? 1} min={0.5} max={4} step={0.25} />
  {#if outputsError}<p class="settings-note" role="status">Connected displays could not be read. Saved display settings are still available.</p>{/if}
</section>

{#each names as name (name)}
  {@const connected = outputs.find((output) => output.name === name)}
  {@const output = outputConfig(name)}
  <section class="settings-section">
    <header class="settings-section-heading">
      <div><h2>{name}</h2>{#if connected}<p>{[connected.make, connected.model].filter(Boolean).join(" ")} · {connected.width} × {connected.height} · {Number((connected.refresh_millihertz / 1000).toFixed(2))} Hz</p>{:else}<p>Not connected</p>{/if}</div>
      {#if output}<button type="button" class="settings-text-button" onclick={() => delete display[name]}>Reset display</button>{/if}
    </header>
    {#if output}
      <OutputEditor bind:output={display[name] as OutputConfig} />
    {:else}
      <p class="settings-note">Using the display’s preferred mode and automatic placement.</p>
      <button type="button" class="settings-button" onclick={() => display[name] = defaultOutput()}>Customize display</button>
    {/if}
  </section>
{/each}

<section class="settings-section">
  <h2>Add a display</h2>
  <p class="settings-note">Save settings for a display that is not connected.</p>
  <div class="settings-add-output">
    <TextField label="Connector name" value={newOutput} onchange={(value) => newOutput = value} placeholder="DP-1" />
    <button type="button" class="settings-button" onclick={addOutput}>Add</button>
  </div>
  {#if addError}<p class="settings-error" role="alert">{addError}</p>{/if}
</section>
