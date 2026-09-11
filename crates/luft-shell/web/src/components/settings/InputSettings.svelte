<script lang="ts">
  import type { InputConfig } from "../../lib/settings_model";
  import TextField from "./TextField.svelte";
  import NumberField from "./NumberField.svelte";
  import Toggle from "./Toggle.svelte";
  let { input = $bindable() }: { input: InputConfig } = $props();
</script>

<section class="settings-section">
  <h2>Keyboard</h2>
  <div class="settings-field-grid">
    <TextField label="Layout" value={input.keyboard_layout} onchange={(value) => input.keyboard_layout = value} hint="XKB layout name, such as us, gb or de. Separate multiple layouts with commas." />
    <TextField label="Variant" value={input.keyboard_variant} onchange={(value) => input.keyboard_variant = value} placeholder="Default" hint="For example, intl or dvorak." />
    <NumberField label="Repeat delay (ms)" value={input.repeat_delay} onchange={(value) => input.repeat_delay = value ?? 0} min={0} max={5000} step={10} />
    <NumberField label="Repeat rate (keys/s)" value={input.repeat_rate} onchange={(value) => input.repeat_rate = value ?? 0} min={0} max={200} hint="Set to 0 to disable key repeat." />
  </div>
  <TextField label="Layout options" value={input.keyboard_options} onchange={(value) => input.keyboard_options = value} hint="XKB options, such as grp:alt_shift_toggle or caps:escape." />
  <Toggle label="Num Lock" checked={input.num_lock} onchange={(value) => input.num_lock = value} hint="Enable the numeric keypad." />
</section>
<section class="settings-section">
  <h2>Pointer & touchpad</h2>
  <Toggle label="Tap to click" checked={input.tap_to_click} onchange={(value) => input.tap_to_click = value} />
  <Toggle label="Natural scrolling" checked={input.natural_scroll} onchange={(value) => input.natural_scroll = value} hint="Move content in the direction of your fingers." />
  <Toggle label="Disable touchpad while typing" checked={input.disable_while_typing} onchange={(value) => input.disable_while_typing = value} />
  <NumberField label="Pointer acceleration" value={input.pointer_acceleration} onchange={(value) => input.pointer_acceleration = value ?? 0} min={-1} max={1} step={0.1} hint="−1 is slowest, 0 is the default, 1 is fastest." />
</section>
