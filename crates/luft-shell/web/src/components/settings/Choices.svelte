<script lang="ts">
  let { label, value, options, onchange }: {
    label: string; value: string; options: { value: string; label: string }[]; onchange: (value: string) => void;
  } = $props();

  function keydown(event: KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onchange(option.value);
    (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }
</script>

<div class="settings-field">
  <span>{label}</span>
  <div class="settings-choices" role="radiogroup" aria-label={label}>
    {#each options as option, index (option.value)}
      <button type="button" role="radio" aria-checked={value === option.value}
        tabindex={value === option.value ? 0 : -1} onkeydown={(event) => keydown(event, index)}
        onclick={() => onchange(option.value)}>{option.label}</button>
    {/each}
  </div>
</div>
