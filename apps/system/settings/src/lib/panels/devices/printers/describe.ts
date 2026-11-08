import { t } from "@luft/i18n";
import type { Printer, PrintJob } from "#lib/bindings.js";

const PROCESSING = 4;
const STOPPED = 5;

const PROBLEMS: [prefix: string, label: string, serious: boolean][] = [
  ["media-empty", "settings-printers-status-no-paper", true],
  ["media-jam", "settings-printers-status-jam", true],
  ["marker-supply-empty", "settings-printers-status-no-ink", true],
  ["toner-empty", "settings-printers-status-no-toner", true],
  ["cover-open", "settings-printers-status-cover-open", true],
  ["door-open", "settings-printers-status-cover-open", true],
  ["offline", "settings-printers-status-offline", true],
  ["connecting-to-device", "settings-printers-status-offline", true],
  ["cups-missing-filter", "settings-printers-status-cant-print", true],
  ["media-low", "settings-printers-status-low-paper", false],
  ["marker-supply-low", "settings-printers-status-low-ink", false],
  ["toner-low", "settings-printers-status-low-toner", false],
];

const SIDES: Record<string, string> = {
  "one-sided": "settings-printers-sides-off",
  "two-sided-long-edge": "settings-printers-sides-long",
  "two-sided-short-edge": "settings-printers-sides-short",
};

const COLOR_MODES: Record<string, string> = {
  color: "settings-printers-color-color",
  monochrome: "settings-printers-color-gray",
};

const ISO = /^[abc]\d+$/;

function found(printer: Printer) {
  return PROBLEMS.find(([prefix]) =>
    printer.reasons.some((reason) => reason.startsWith(prefix)),
  );
}

export function needsAttention(printer: Printer) {
  return found(printer)?.[2] ?? false;
}

export function status(printer: Printer) {
  const trouble = found(printer);
  if (trouble) return t(trouble[1]);
  if (!printer.accepting || printer.state === STOPPED)
    return t("settings-printers-status-paused");
  if (printer.state === PROCESSING)
    return t("settings-printers-status-printing");
  return t("settings-printers-status-ready");
}

export function summary(printer: Printer) {
  const state = status(printer);
  return printer.location ? `${state} · ${printer.location}` : state;
}

export function paperName(keyword: string) {
  const [, size = keyword] = keyword.split("_");
  if (ISO.test(size)) return size.toUpperCase();
  return size
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function papers(printer: Printer) {
  const seen = new Set<string>();
  return printer.media
    .map((keyword) => ({ value: keyword, label: paperName(keyword) }))
    .filter(
      (paper) => !seen.has(paper.label) && Boolean(seen.add(paper.label)),
    );
}

export function sideOptions(printer: Printer) {
  return printer.sides
    .filter((side) => side in SIDES)
    .map((side) => ({ value: side, label: t(SIDES[side]) }));
}

export function colorOptions(printer: Printer) {
  return printer.colorModes
    .filter((mode) => mode in COLOR_MODES)
    .map((mode) => ({ value: mode, label: t(COLOR_MODES[mode]) }));
}

export function jobsFor(printer: string, jobs: PrintJob[]) {
  return jobs.filter((job) => job.printer === printer);
}

export function connection(printer: Printer) {
  if (
    printer.device.startsWith("usb://") ||
    printer.device.includes("//localhost")
  )
    return t("settings-printers-by-usb");
  if (printer.temporary) return t("settings-printers-found-nearby");
  return printer.device.startsWith("dnssd://") ||
    printer.device.startsWith("ipp")
    ? t("settings-printers-on-network")
    : "";
}

export function swatch(color: string) {
  const first = color.split("#")[1];
  return first ? `#${first}` : "var(--text-muted)";
}
