<script lang="ts">
  import { onDestroy } from "svelte";
  import AppIcon from "./AppIcon.svelte";
  import type { PanelApp } from "../shell/model";

  let {
    app,
    onlaunch,
    onmenu,
    onreorderstart,
    onreorderover,
    onreorderdrop,
    onreorderend,
    reorderable = true,
  }: {
    app: PanelApp;
    onlaunch: (app: PanelApp) => void;
    onmenu?: (command: string, x: number) => void;
    onreorderstart?: (command: string) => void;
    onreorderover?: (command: string, after: boolean) => void;
    onreorderdrop?: () => void;
    onreorderend?: () => void;
    reorderable?: boolean;
  } = $props();

  let hovered = false;
  let dragging = $state(false);
  let suppressClick = false;
  let reorderPointerId: number | undefined;
  let reorderStartX = 0;
  let reorderStartY = 0;
  let motionFrame: number | undefined;
  let motionCleanupFrame: number | undefined;
  let jumpHoldTimer: ReturnType<typeof setTimeout> | undefined;
  let motionElement: HTMLElement | undefined;
  let motionButton: HTMLElement | undefined;
  let motionY = 0;
  let motionVelocity = 0;
  let motionTime = 0;
  let jumpOffset = 0;

  const hoverLift = -5;
  const jumpLift = -11;
  const springStiffness = 155;
  const springDamping = 19;

  const className = "panel-app app-button";

  function openMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    onmenu?.(app.command, Math.round(rect.left + rect.width / 2));
  }

  function launch(event: MouseEvent) {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }
    const button = event.currentTarget as HTMLElement;
    hovered = button.matches(":hover");
    beginIconMotion(button);
    jumpOffset = jumpLift;
    if (jumpHoldTimer) clearTimeout(jumpHoldTimer);
    jumpHoldTimer = setTimeout(() => {
      jumpOffset = 0;
      scheduleMotionFrame();
    }, 190);
    scheduleMotionFrame();
    onlaunch(app);
  }

  const runningDots = $derived(
    Array.from({
      length: Math.min(4, Math.max(app.windowIds.length, app.running ? 1 : 0)),
    }),
  );

  function pointerEnter() {
    hovered = true;
    if (motionElement) scheduleMotionFrame();
  }

  function pointerLeave() {
    hovered = false;
    if (motionElement) scheduleMotionFrame();
  }

  function beginIconMotion(button: HTMLElement) {
    const icon = button.querySelector<HTMLElement>(".app-icon");
    if (!icon) return;
    if (motionElement !== icon) {
      stopIconMotion();
      motionElement = icon;
      motionButton = button;
      motionY = new DOMMatrixReadOnly(getComputedStyle(icon).transform).m42;
      motionVelocity = 0;
    }
    button.classList.add("is-motion-controlled");
    icon.style.transform = `translate3d(0, ${motionY}px, 0)`;
  }

  function scheduleMotionFrame() {
    if (!motionElement || motionFrame !== undefined) return;
    if (motionCleanupFrame !== undefined) {
      cancelAnimationFrame(motionCleanupFrame);
      motionCleanupFrame = undefined;
    }
    if (motionTime === 0) motionTime = performance.now();
    motionFrame = requestAnimationFrame(stepIconMotion);
  }

  function stepIconMotion(now: number) {
    motionFrame = undefined;
    if (!motionElement) return;
    const elapsed = Math.min((now - motionTime) / 1000, 1 / 30);
    motionTime = now;
    const target = (hovered ? hoverLift : 0) + jumpOffset;
    const acceleration =
      springStiffness * (target - motionY) - springDamping * motionVelocity;
    motionVelocity += acceleration * elapsed;
    motionY += motionVelocity * elapsed;
    motionElement.style.transform = `translate3d(0, ${motionY}px, 0)`;

    if (jumpOffset === 0 && Math.abs(target - motionY) < 0.02 && Math.abs(motionVelocity) < 0.05) {
      motionY = target;
      motionElement.style.transform = `translate3d(0, ${target}px, 0)`;
      const icon = motionElement;
      const button = motionButton;
      motionCleanupFrame = requestAnimationFrame(() => {
        icon.style.removeProperty("transform");
        button?.classList.remove("is-motion-controlled");
        motionCleanupFrame = undefined;
        if (motionElement === icon) {
          motionElement = undefined;
          motionButton = undefined;
        }
      });
      motionTime = 0;
      return;
    }
    scheduleMotionFrame();
  }

  function stopIconMotion() {
    if (motionFrame !== undefined) cancelAnimationFrame(motionFrame);
    if (motionCleanupFrame !== undefined) cancelAnimationFrame(motionCleanupFrame);
    motionFrame = undefined;
    motionCleanupFrame = undefined;
    motionElement?.style.removeProperty("transform");
    motionButton?.classList.remove("is-motion-controlled");
    motionElement = undefined;
    motionButton = undefined;
    motionTime = 0;
  }

  function pointerDown(event: PointerEvent) {
    if (!reorderable || !onreorderstart || event.button !== 0) return;
    reorderPointerId = event.pointerId;
    reorderStartX = event.clientX;
    reorderStartY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (event.pointerId !== reorderPointerId) return;
    const moved = Math.hypot(event.clientX - reorderStartX, event.clientY - reorderStartY);
    if (!dragging && moved < 8) return;
    if (!dragging) {
      dragging = true;
      suppressClick = true;
      onreorderstart?.(app.command);
    }
    previewPointerTarget(event.clientX, event.clientY);
  }

  function pointerUp(event: PointerEvent) {
    if (event.pointerId !== reorderPointerId) return;
    releasePointer(event);
    if (dragging) {
      previewPointerTarget(event.clientX, event.clientY);
      onreorderdrop?.();
      dragging = false;
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
      return;
    }
    reorderPointerId = undefined;
  }

  function pointerCancel(event: PointerEvent) {
    if (event.pointerId !== reorderPointerId) return;
    releasePointer(event);
    if (!dragging) {
      reorderPointerId = undefined;
      return;
    }
    dragging = false;
    onreorderend?.();
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }

  function releasePointer(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    reorderPointerId = undefined;
  }

  function previewPointerTarget(clientX: number, clientY: number) {
    if (!onreorderover) return;
    const target = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>(".app-button");
    const command = target?.dataset.command;
    if (!command) return;
    const rect = target.getBoundingClientRect();
    onreorderover(command, clientX > rect.left + rect.width / 2);
  }

  onDestroy(() => {
    if (jumpHoldTimer) clearTimeout(jumpHoldTimer);
    stopIconMotion();
  });
</script>

<button
  type="button"
  class={className}
  class:is-active={app.active}
  class:is-running={app.running}
  class:is-reordering={dragging}
  data-command={app.command}
  aria-label={app.label}
  onclick={launch}
  oncontextmenu={openMenu}
  onpointerdown={pointerDown}
  onpointermove={pointerMove}
  onpointerup={pointerUp}
  onpointercancel={pointerCancel}
  onpointerenter={pointerEnter}
  onpointerleave={pointerLeave}
>
  <AppIcon {app} />
  <span class="running-dots" aria-hidden="true">
    {#each runningDots as _, index (`${app.command}-${index}`)}
      <span class="running-dot" class:is-active-dot={app.active && index === 0}></span>
    {/each}
  </span>
</button>
