(() => {
  if (window.__sabineAutoscrollInstalled) return;
  window.__sabineAutoscrollInstalled = true;

  const RESTING_RADIUS = 15;
  const EXPONENT = 2.2;
  const SPEED = 0.008;
  const MARKER_SIZE = 28;

  let active = null;

  const overflows = (element, axis) => {
    const style = getComputedStyle(element);
    const overflow = axis === "y" ? style.overflowY : style.overflowX;
    const room = axis === "y"
      ? element.scrollHeight - element.clientHeight
      : element.scrollWidth - element.clientWidth;
    if (room < 1) return false;
    if (element === document.scrollingElement) return overflow !== "hidden" && overflow !== "clip";
    return overflow === "auto" || overflow === "scroll" || overflow === "overlay";
  };

  const parentOf = (element) => element.parentElement || element.getRootNode().host || null;

  const scrollersFrom = (start) => {
    let vertical = null;
    let horizontal = null;
    for (let element = start; element && !(vertical && horizontal); element = parentOf(element)) {
      if (!vertical && overflows(element, "y")) vertical = element;
      if (!horizontal && overflows(element, "x")) horizontal = element;
    }
    const root = document.scrollingElement;
    if (root) {
      if (!vertical && overflows(root, "y")) vertical = root;
      if (!horizontal && overflows(root, "x")) horizontal = root;
    }
    return vertical || horizontal ? { vertical, horizontal } : null;
  };

  const startsAutoscroll = (event) => {
    if (event.button !== 1 || event.defaultPrevented || !event.isTrusted) return false;
    const target = event.composedPath()[0];
    if (!(target instanceof Element)) return false;
    return !target.closest("a[href], area[href], [contenteditable]:not([contenteditable='false'])");
  };

  const markerFor = ({ vertical, horizontal }, x, y) => {
    const host = document.createElement("div");
    host.style.cssText = `position:fixed;left:${x - MARKER_SIZE / 2}px;top:${y - MARKER_SIZE / 2}px;` +
      `width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;pointer-events:none;z-index:2147483647;`;
    const arrow = (points) => `<path d="${points}" fill="currentColor"/>`;
    const arrows = [
      vertical ? arrow("M14 5l4 5h-8zM14 23l4-5h-8z") : "",
      horizontal ? arrow("M5 14l5-4v8zM23 14l-5-4v8z") : "",
    ].join("");
    host.attachShadow({ mode: "closed" }).innerHTML =
      `<style>svg{color:#1d1d1f;--plate:rgba(255,255,255,.92);--edge:rgba(0,0,0,.28)}` +
      `@media (prefers-color-scheme:dark){svg{color:#f5f5f7;--plate:rgba(40,40,44,.92);--edge:rgba(255,255,255,.3)}}</style>` +
      `<svg width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 28 28">` +
      `<circle cx="14" cy="14" r="13" fill="var(--plate)" stroke="var(--edge)"/>` +
      `<circle cx="14" cy="14" r="1.75" fill="currentColor"/>${arrows}</svg>`;
    document.documentElement.append(host);
    return host;
  };

  const cursorFor = (dx, dy) => {
    const vertical = dy < 0 ? "n" : dy > 0 ? "s" : "";
    const horizontal = dx < 0 ? "w" : dx > 0 ? "e" : "";
    return vertical || horizontal ? `${vertical}${horizontal}-resize` : "all-scroll";
  };

  const setCursor = (cursor) => {
    if (active.cursor === cursor) return;
    active.cursor = cursor;
    active.style.textContent = `*{cursor:${cursor}!important}`;
  };

  const speedAlong = (distance) => {
    const outside = Math.abs(distance) > RESTING_RADIUS ? Math.abs(distance) : 0;
    return Math.sign(distance) * outside ** EXPONENT * SPEED;
  };

  const step = (time) => {
    if (!active) return;
    const elapsed = active.time === null ? 0 : (time - active.time) / 1000;
    active.time = time;
    const dx = active.scrollers.horizontal ? active.pointerX - active.originX : 0;
    const dy = active.scrollers.vertical ? active.pointerY - active.originY : 0;
    active.restX += speedAlong(dx) * elapsed;
    active.restY += speedAlong(dy) * elapsed;
    const left = Math.trunc(active.restX);
    const top = Math.trunc(active.restY);
    active.restX -= left;
    active.restY -= top;
    const { vertical, horizontal } = active.scrollers;
    if (vertical && vertical === horizontal) {
      vertical.scrollBy({ left, top, behavior: "instant" });
    } else {
      if (vertical && top) vertical.scrollBy({ top, behavior: "instant" });
      if (horizontal && left) horizontal.scrollBy({ left, behavior: "instant" });
    }
    setCursor(cursorFor(Math.abs(dx) > RESTING_RADIUS ? dx : 0, Math.abs(dy) > RESTING_RADIUS ? dy : 0));
    active.frame = requestAnimationFrame(step);
  };

  const stop = () => {
    if (!active) return;
    cancelAnimationFrame(active.frame);
    active.marker.remove();
    active.style.remove();
    active = null;
    removeEventListener("mousemove", track, true);
    removeEventListener("keydown", stop, true);
    removeEventListener("wheel", stop, true);
    removeEventListener("blur", stop);
    removeEventListener("pagehide", stop);
  };

  const track = (event) => {
    active.pointerX = event.clientX;
    active.pointerY = event.clientY;
    if (active.mode === "initial" &&
        Math.hypot(event.clientX - active.originX, event.clientY - active.originY) > RESTING_RADIUS) {
      active.mode = "holding";
    }
  };

  const start = (event, scrollers) => {
    const style = document.createElement("style");
    document.documentElement.append(style);
    active = {
      scrollers,
      originX: event.clientX,
      originY: event.clientY,
      pointerX: event.clientX,
      pointerY: event.clientY,
      restX: 0,
      restY: 0,
      mode: "initial",
      time: null,
      cursor: null,
      style,
      marker: markerFor(scrollers, event.clientX, event.clientY),
    };
    setCursor("all-scroll");
    addEventListener("mousemove", track, true);
    addEventListener("keydown", stop, true);
    addEventListener("wheel", stop, true);
    addEventListener("blur", stop);
    addEventListener("pagehide", stop);
    active.frame = requestAnimationFrame(step);
  };

  const swallowNextClick = () => {
    const swallow = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    for (const type of ["click", "auxclick", "contextmenu"]) {
      addEventListener(type, swallow, { capture: true, once: true });
      setTimeout(() => removeEventListener(type, swallow, true), 0);
    }
  };

  addEventListener("mousedown", (event) => {
    if (!active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    stop();
    addEventListener("mouseup", swallowNextClick, { capture: true, once: true });
  }, true);

  addEventListener("mousedown", (event) => {
    if (active || !startsAutoscroll(event)) return;
    const scrollers = scrollersFrom(event.composedPath()[0]);
    if (!scrollers) return;
    event.preventDefault();
    start(event, scrollers);
  });

  addEventListener("mouseup", (event) => {
    if (!active || event.button !== 1) return;
    if (active.mode === "initial") {
      active.mode = "toggled";
      swallowNextClick();
    } else if (active.mode === "holding") {
      stop();
      swallowNextClick();
    }
  }, true);
})();
