<script lang="ts">
  const id = $props.id();
  let { label, value, onchange, hint, min, max, step = 1, optional = false, placeholder = "" }: {
    label: string; value: number | null; onchange: (value: number | null) => void;
    hint?: string; min?: number; max?: number; step?: number; optional?: boolean; placeholder?: string;
  } = $props();
</script>

<label class="settings-field">
  <span id={`${id}-label`}>{label}</span>
  <input aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined} type="number" value={value ?? ""} {min} {max} {step} {placeholder}
    oninput={(event) => onchange(event.currentTarget.value === "" && optional ? null : event.currentTarget.valueAsNumber)} />
  {#if hint}<small id={`${id}-hint`}>{hint}</small>{/if}
</label>
