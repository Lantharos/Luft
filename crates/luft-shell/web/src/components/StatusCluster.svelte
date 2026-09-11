<script lang="ts">
  import Icon from "./Icon.svelte";
  import { sendAction } from "../shell/bridge";
  import type { ShellSnapshot, TrayItem } from "../shell/model";

  let { snapshot, className }: { snapshot: ShellSnapshot; className: string } = $props();

  function activateTray(event: MouseEvent, item: TrayItem) {
    event.stopPropagation();
    sendAction({ type: "tray-activate", service: item.service, path: item.path });
  }

  function openTrayMenu(event: MouseEvent, item: TrayItem) {
    event.preventDefault();
    event.stopPropagation();
    sendAction({ type: "tray-menu", service: item.service, path: item.path });
  }
</script>

<div class={className}>
  {#each snapshot.tray as item (item.service + item.path)}
    <button
      type="button"
      class="tray-item"
      aria-label={item.title}
      onclick={(event) => activateTray(event, item)}
      oncontextmenu={(event) => openTrayMenu(event, item)}
    >
      {#if item.iconUri}
        <img src={item.iconUri} alt="" />
      {/if}
    </button>
  {/each}

  <button type="button" class="status-indicators" aria-label="Quick settings" onclick={() => sendAction({ type: "toggle-quick-settings" })}>
    <Icon name={snapshot.status.network?.wireless ? "wifi" : "network"} />
    {#if snapshot.status.audio}
      <Icon name="volume" />
    {/if}
    {#if snapshot.status.battery}
      <Icon name="battery" />
    {/if}
  </button>
</div>
