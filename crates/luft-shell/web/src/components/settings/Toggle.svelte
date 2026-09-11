<script lang="ts">
  const id = $props.id();
  let { label, checked, onchange, hint }: {
    label: string; checked: boolean; onchange: (checked: boolean) => void; hint?: string;
  } = $props();
</script>

<button type="button" class="settings-toggle-row" role="switch" aria-label={label} aria-describedby={hint ? `${id}-hint` : undefined} aria-checked={checked} onclick={() => onchange(!checked)}>
  <span class="settings-row-copy"><span>{label}</span>{#if hint}<small id={`${id}-hint`}>{hint}</small>{/if}</span>
  <span class={['settings-switch', { 'is-checked': checked }]} aria-hidden="true"><span></span></span>
</button>
