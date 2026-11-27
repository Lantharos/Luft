export const CONNECTING = 'connecting-to-device';

export interface Problem {
  reason: string;
  text: string;
  serious: boolean;
}

const KNOWN: [string, string][] = [
  ['media-empty', 'printing-paper-empty'],
  ['media-needed', 'printing-paper-empty'],
  ['media-jam', 'printing-paper-jam'],
  ['media-low', 'printing-paper-low'],
  ['toner-empty', 'printing-toner-empty'],
  ['toner-low', 'printing-toner-low'],
  ['marker-supply-empty', 'printing-ink-empty'],
  ['marker-supply-low', 'printing-ink-low'],
  ['marker-waste-full', 'printing-waste-full'],
  ['marker-waste-almost-full', 'printing-waste-full'],
  ['door-open', 'printing-door-open'],
  ['cover-open', 'printing-cover-open'],
  ['input-tray-missing', 'printing-tray-missing'],
  ['offline', 'printing-offline'],
  ['shutdown', 'printing-offline'],
  ['paused', 'printing-paused'],
  ['cups-missing-filter', 'printing-missing-driver'],
];
const QUIET = ['none', CONNECTING];
const REPORTED = ['offline'];
const SEVERITY = /-(report|warning|error)$/;

const severity = (reason: string) => reason.match(SEVERITY)?.[1] ?? 'error';

export function problems(reasons: string[]): Problem[] {
  return reasons.flatMap(reason => {
    const base = reason.replace(SEVERITY, '');
    if (QUIET.includes(base) || (severity(reason) === 'report' && !REPORTED.includes(base))) return [];
    const known = KNOWN.find(([prefix]) => base === prefix);
    if (!known && (base.startsWith('cups-') || base.startsWith('com.apple.'))) return [];
    const serious = severity(reason) === 'error' && !base.endsWith('-low');
    return [{ reason, text: known?.[1] ?? 'printing-problem', serious }];
  }).filter((problem, index, all) => all.findIndex(other => other.text === problem.text) === index);
}

export const connecting = (reasons: string[]) => reasons.some(reason => reason.startsWith(CONNECTING));
