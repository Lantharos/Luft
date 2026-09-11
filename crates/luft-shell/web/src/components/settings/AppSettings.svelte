<script lang="ts">
  import type { SettingsConfig } from "../../lib/settings_model";
  import TextField from "./TextField.svelte";
  let { config = $bindable() }: { config: SettingsConfig } = $props();
</script>

<section class="settings-section">
  <h2>Default applications</h2>
  <TextField label="Terminal" value={config.default_apps.terminal} onchange={(value) => config.default_apps.terminal = value} />
  <TextField label="Files" value={config.default_apps.file_manager} onchange={(value) => config.default_apps.file_manager = value} />
  <TextField label="Web browser" value={config.default_apps.browser} onchange={(value) => config.default_apps.browser = value} />
  <TextField label="App launcher" value={config.default_apps.launcher} onchange={(value) => config.default_apps.launcher = value} />
  <TextField label="Settings application" value={config.default_apps.settings} onchange={(value) => config.default_apps.settings = value} placeholder="Luft Settings" hint="Leave empty to use Luft Settings." />
</section>
<section class="settings-section">
  <h2>Startup</h2>
  <TextField label="Additional startup commands" value={config.session.startup_apps.join("\n")}
    onchange={(value) => config.session.startup_apps = value.split("\n")} multiline hint="One command per line. Changes take effect next session." />
</section>
