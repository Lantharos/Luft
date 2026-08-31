<script lang="ts">
  import { sendAction } from "../shell/bridge";
  import type { ShellSnapshot } from "../shell/model";
  import Icon from "./Icon.svelte";

  let { snapshot }: { snapshot: ShellSnapshot } = $props();
  const prompt = $derived(snapshot.capturePrompt);
  let selectedOutput = $derived(
    prompt?.outputs.find((output) => output.primary)?.name ?? prompt?.outputs[0]?.name ?? "",
  );
  const title = $derived(
    prompt?.kind === "screenshot" ? "Take a screenshot?" : "Share your screen?",
  );
  const description = $derived(
    prompt?.kind === "screenshot"
      ? `${prompt?.appName ?? "An application"} wants to capture a display.`
      : `${prompt?.appName ?? "An application"} wants to see a display until you stop sharing.`,
  );
  const confirmLabel = $derived(prompt?.kind === "screenshot" ? "Take Screenshot" : "Share Screen");
  const privacyNote = $derived(
    prompt?.kind === "screenshot"
      ? "Only the selected display will be captured."
      : "You can stop sharing from the requesting app.",
  );
  function allow() {
    if (!prompt || !selectedOutput) return;
    sendAction({
      type: "capture-consent-allow",
      request: prompt.id,
      output: selectedOutput,
    });
  }

  function deny() {
    if (!prompt) return;
    sendAction({ type: "capture-consent-deny", request: prompt.id });
  }
</script>

{#if prompt}
  <section class="capture-consent" aria-labelledby="capture-consent-title">
    <header class="capture-consent-header">
      <span class="capture-app-icon">
        {#if prompt.appIconUri}
          <img src={prompt.appIconUri} alt="" />
        {:else}
          <Icon name="monitor" />
        {/if}
      </span>
      <span class="capture-consent-copy">
        <h1 id="capture-consent-title">{title}</h1>
        <p>{description}</p>
      </span>
      <span class="capture-security" aria-label="Luft protected request">
        <Icon name="shield-check" />
      </span>
    </header>

    <div class="capture-output-list" role="radiogroup" aria-label="Display to capture">
      {#each prompt.outputs as output (output.name)}
        <button
          type="button"
          class="capture-output"
          class:is-selected={selectedOutput === output.name}
          role="radio"
          aria-checked={selectedOutput === output.name}
          onclick={() => (selectedOutput = output.name)}
        >
          <span class="capture-output-preview"><Icon name="monitor" /></span>
          <span class="capture-output-copy">
            <strong>{output.label}</strong>
            <small>{output.name} · {output.width} × {output.height}{output.scale === 1 ? "" : ` · ${output.scale}× scale`}</small>
          </span>
          {#if output.primary}<span class="capture-primary">Main display</span>{/if}
          <span class="capture-selection" aria-hidden="true"><span></span></span>
        </button>
      {/each}
    </div>

    <footer class="capture-consent-actions">
      <p>{privacyNote}</p>
      <div>
        <button
          type="button"
          class="capture-button is-secondary"
          onclick={deny}
        >Cancel</button>
        <button
          type="button"
          class="capture-button is-primary"
          disabled={!selectedOutput}
          onclick={allow}
        >{confirmLabel}</button>
      </div>
    </footer>
  </section>
{/if}
