<script lang="ts">
  import type { OutputConfig } from "../../lib/settings_model";
  import NumberField from "./NumberField.svelte";
  import Toggle from "./Toggle.svelte";
  import Choices from "./Choices.svelte";
  let { output = $bindable() }: { output: OutputConfig } = $props();
  const transforms = [
    { value: "normal", label: "Normal" }, { value: "rotate90", label: "90°" },
    { value: "rotate180", label: "180°" }, { value: "rotate270", label: "270°" },
    { value: "flipped", label: "Flipped" }, { value: "flipped90", label: "Flipped 90°" },
    { value: "flipped180", label: "Flipped 180°" }, { value: "flipped270", label: "Flipped 270°" },
  ];
</script>

<Toggle label="Enable display" checked={output.enabled} onchange={(value) => output.enabled = value} />
<div class="settings-field-grid">
  <NumberField label="Scale" value={output.scale} onchange={(value) => output.scale = value} min={0.5} max={4} step={0.25} optional placeholder="Use default scale" />
  <NumberField label="Refresh rate (Hz)" value={output.refresh_millihertz === null ? null : output.refresh_millihertz / 1000}
    onchange={(value) => output.refresh_millihertz = value === null ? null : Math.round(value * 1000)} min={1} max={1000} step={0.001} optional placeholder="Preferred mode" />
  <NumberField label="Width (px)" value={output.width} onchange={(value) => output.width = value} min={1} optional placeholder="Preferred mode" />
  <NumberField label="Height (px)" value={output.height} onchange={(value) => output.height = value} min={1} optional placeholder="Preferred mode" />
  <NumberField label="Horizontal position" value={output.x} onchange={(value) => output.x = value} optional placeholder="Automatic" />
  <NumberField label="Vertical position" value={output.y} onchange={(value) => output.y = value} optional placeholder="Automatic" />
</div>
<Choices label="Orientation" value={output.transform} options={transforms} onchange={(value) => output.transform = value} />
<Toggle label="Adaptive sync" checked={output.adaptive_sync} onchange={(value) => output.adaptive_sync = value} hint="Use a variable refresh rate when supported by this display." />
