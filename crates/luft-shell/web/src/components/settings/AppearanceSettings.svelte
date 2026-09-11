<script lang="ts">
  import type { SettingsConfig } from "../../lib/settings_model";
  import TextField from "./TextField.svelte";
  import NumberField from "./NumberField.svelte";
  let { config = $bindable() }: { config: SettingsConfig } = $props();
</script>

<section class="settings-section">
  <h2>Desktop</h2>
  <TextField label="Wallpaper" value={config.compositor.background_image} onchange={(value) => config.compositor.background_image = value || null}
    placeholder="Path to an image" hint="The shell accent follows your wallpaper. Leave empty to use the default background." />
</section>
<section class="settings-section">
  <h2>Cursor</h2>
  <div class="settings-field-grid">
    <TextField label="Theme" value={config.cursor.theme} onchange={(value) => config.cursor.theme = value} />
    <NumberField label="Size (px)" value={config.cursor.size} onchange={(value) => config.cursor.size = value ?? 0} min={1} max={256} />
  </div>
  <TextField label="Additional theme directory" value={config.cursor.path} onchange={(value) => config.cursor.path = value || null}
    placeholder="Use system themes" hint="A directory containing cursor theme folders. Existing apps may need to be reopened to use a changed cursor theme." />
</section>
