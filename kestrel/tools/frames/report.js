import GLib from 'gi://GLib';

const COLUMNS = [
  ['first frame', result => result.firstFrameMs],
  ['frames', result => result.frames],
  ['missed', result => result.missed],
  ['slow', result => result.slow],
  ['CPU p50', result => result.cpu.p50],
  ['CPU p95', result => result.cpu.p95],
  ['CPU max', result => result.cpu.max],
  ['update p95', result => result.update.p95],
  ['layout p95', result => result.layout.p95],
  ['GPU p50', result => result.gpu?.p50 ?? '-'],
  ['GPU p95', result => result.gpu?.p95 ?? '-'],
  ['longest', result => result.longestIntervalMs],
];
const NAME_WIDTH = 36;
const CELL_WIDTH = 14;

const reportName = ({width, height, scale}) => `frames-${width}x${height}@${Math.round(scale * 100)}.json`;

function readBaseline(path) {
  if (!path) return null;
  const [, contents] = GLib.file_get_contents(path);
  return JSON.parse(new TextDecoder().decode(contents)).interactions;
}

const cell = (value, before) => (before === undefined ? `${value}` : `${before} → ${value}`).padStart(CELL_WIDTH);

export function printReport({display, interactions}, baselinePath) {
  const baseline = readBaseline(baselinePath);
  const lines = [
    `Kestrel frames at ${display.width}x${display.height}, ${Math.round(display.scale * 100)}%, ${display.refreshRate.toFixed(0)} Hz (times in ms)`,
    `${'interaction'.padEnd(NAME_WIDTH)}${COLUMNS.map(([label]) => label.padStart(CELL_WIDTH)).join('')}`,
  ];
  for (const [name, result] of Object.entries(interactions)) {
    const before = baseline?.[name];
    if (result.error || before?.error) {
      lines.push(`${name.padEnd(NAME_WIDTH)}${result.error ?? 'compared with a run that failed'}`);
      continue;
    }
    lines.push(`${name.padEnd(NAME_WIDTH)}${COLUMNS.map(([, value]) => cell(value(result), before && value(before))).join('')}`);
  }
  for (const line of lines) console.log(`Kestrel frames: ${line}`);
}

export function saveReport(report) {
  const path = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), reportName(report.display)]);
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  GLib.file_set_contents(path, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Kestrel frames: saved ${path}`);
}
