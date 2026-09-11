<script lang="ts">
  const id = $props.id();
  let { label, value, onchange, hint, placeholder = "", multiline = false }: {
    label: string; value: string | null; onchange: (value: string) => void;
    hint?: string; placeholder?: string; multiline?: boolean;
  } = $props();
</script>

<label class="settings-field">
  <span id={`${id}-label`}>{label}</span>
  {#if multiline}
    <textarea aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined} value={value ?? ""} {placeholder} rows="3" oninput={(event) => onchange(event.currentTarget.value)}></textarea>
  {:else}
    <input aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined} type="text" value={value ?? ""} {placeholder} oninput={(event) => onchange(event.currentTarget.value)} spellcheck="false" />
  {/if}
  {#if hint}<small id={`${id}-hint`}>{hint}</small>{/if}
</label>
