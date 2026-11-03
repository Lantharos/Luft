import {outcome} from '../processes.js';

interface DumpedNode {
  id: number;
  type: string;
  info?: {props?: Record<string, string | number | boolean>};
}

export type Match = Record<string, string>;

const POSITIONS: Record<number, string[]> = {1: ['MONO'], 2: ['FL', 'FR']};

async function nodeId(match: Match): Promise<number | null> {
  const {stdout} = await outcome(['pw-dump']);
  const node = (JSON.parse(stdout || '[]') as DumpedNode[]).find(object => object.type === 'PipeWire:Interface:Node' &&
    Object.entries(match).every(([key, value]) => object.info?.props?.[key] === value));
  return node?.id ?? null;
}

/**
 * Test sessions run PipeWire without a session manager, which is what gives streams their ports and links them. These
 * do its part: give a node ports, and link two ports.
 */
export async function givePorts(match: Match, direction: 'Input' | 'Output', channels: 1 | 2, monitor = false): Promise<boolean> {
  const id = await nodeId(match);
  if (id === null) return false;
  const config = {
    direction, mode: 'dsp', monitor,
    format: {mediaType: 'audio', mediaSubtype: 'raw', format: 'F32P', rate: 48000, channels, position: POSITIONS[channels]},
  };
  return (await outcome(['pw-cli', 's', `${id}`, 'PortConfig', JSON.stringify(config)])).ok;
}

export async function link(from: string, to: string): Promise<boolean> {
  const {ok, stderr} = await outcome(['pw-link', from, to]);
  return ok || stderr.includes('File exists');
}

/** Gives the speakers their ports and their monitor, once per session. */
export async function speakers(): Promise<boolean> {
  return (await outcome(['pw-link', '-i'])).stdout.includes('speakers:playback_FL') || givePorts({'node.name': 'speakers'}, 'Input', 2, true);
}

/** Routes a playing node into the speakers. */
export async function intoSpeakers(match: Match, port: string, channels: 1 | 2): Promise<boolean> {
  if (!await speakers() || !await givePorts(match, 'Output', channels)) return false;
  const ports = channels === 1 ? [`${port}_MONO`, `${port}_MONO`] : [`${port}_FL`, `${port}_FR`];
  return await link(ports[0], 'speakers:playback_FL') && await link(ports[1], 'speakers:playback_FR');
}

/** Lets Kestrel's sound levels hear the speakers. */
export async function speakersIntoLevels(): Promise<boolean> {
  return await speakers() && await givePorts({'node.name': 'kestrel-sound-levels'}, 'Input', 1) &&
    await link('speakers:monitor_FL', 'kestrel-sound-levels:input_MONO');
}
