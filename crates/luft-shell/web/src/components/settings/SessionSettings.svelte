<script lang="ts">
  import type { SettingsConfig } from "../../lib/settings_model";
  import TextField from "./TextField.svelte";
  import NumberField from "./NumberField.svelte";
  let { session = $bindable() }: { session: SettingsConfig["session"] } = $props();
</script>

<section class="settings-section">
  <h2>Idle</h2>
  <div class="settings-field-grid">
    <NumberField label="Lock after (seconds)" value={session.idle_lock_seconds} onchange={(value) => session.idle_lock_seconds = value} min={1} optional placeholder="Never" />
    <NumberField label="Suspend after (seconds)" value={session.idle_suspend_seconds} onchange={(value) => session.idle_suspend_seconds = value} min={1} optional placeholder="Never" />
  </div>
  <p class="settings-note">Leave a timeout empty to disable it. Apps playing media or presenting can inhibit idle actions.</p>
</section>
<section class="settings-section">
  <h2>Session commands</h2>
  <TextField label="Lock screen" value={session.lock_command} onchange={(value) => session.lock_command = value} multiline />
  <TextField label="Restart" value={session.reboot_command} onchange={(value) => session.reboot_command = value} />
  <TextField label="Power off" value={session.poweroff_command} onchange={(value) => session.poweroff_command = value} />
</section>
