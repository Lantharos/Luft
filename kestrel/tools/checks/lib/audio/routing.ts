import {outcome} from '../processes.js';

interface DumpedNode {
  id: number;
  type: string;
  info?: {direction?: string; props?: Record<string, string | number | boolean>};
}

export type Match = Record<string, string>;

const POSITIONS: Record<number, string[]> = {1: ['MONO'], 2: ['FL', 'FR']};

async function nodeId(match: Match): Promise<number | null> {
  const {stdout} = await outcome(['pw-dump']);
  const node = (JSON.parse(stdout || '[]') as DumpedNode[]).find(object => object.type === 'PipeWire:Interface:Node' &&
    Object.entries(match).every(([key, value]) => object.info?.props?.[key] === value));
  return node?.id ?? null;
}

export async function givePorts(match: Match, direction: 'Input' | 'Output', channels: 1 | 2, monitor = false): Promise<boolean> {
  const id = await nodeId(match);
  if (id === null) return false;
  const config = {
    direction, mode: 'dsp', monitor,
    format: {mediaType: 'audio', mediaSubtype: 'raw', format: 'F32P', rate: 48000, channels, position: POSITIONS[channels]},
  };
  return (await outcome(['pw-cli', 's', `${id}`, 'PortConfig', JSON.stringify(config)])).ok;
}

export async function removeNode(match: Match): Promise<boolean> {
  const id = await nodeId(match);
  return id !== null && (await outcome(['pw-cli', 'destroy', `${id}`])).ok;
}

export async function link(from: string, to: string): Promise<boolean> {
  const {ok, stderr} = await outcome(['pw-link', from, to]);
  return ok || stderr.includes('File exists');
}

async function ports(match: Match, direction: 'input' | 'output'): Promise<DumpedNode[]> {
  const objects = JSON.parse((await outcome(['pw-dump'])).stdout || '[]') as DumpedNode[];
  const node = objects.find(object => object.type === 'PipeWire:Interface:Node' &&
    Object.entries(match).every(([key, value]) => object.info?.props?.[key] === value));
  return objects.filter(object => object.type === 'PipeWire:Interface:Port' &&
    object.info?.direction === direction && object.info.props?.['node.id'] === node?.id && !object.info.props?.['port.monitor']);
}

export async function intoRecorder(source: Match, recorder: Match): Promise<boolean> {
  if (!(await ports(source, 'output')).length && !await givePorts(source, 'Output', 2)) return false;
  if (!await givePorts(recorder, 'Input', 2)) return false;
  const [outputs, inputs] = [await ports(source, 'output'), await ports(recorder, 'input')];
  if (!outputs.length || !inputs.length) return false;
  const linked = await Promise.all(inputs.map((input, index) => link(`${outputs[Math.min(index, outputs.length - 1)].id}`, `${input.id}`)));
  return linked.every(Boolean);
}

export async function speakers(): Promise<boolean> {
  return (await outcome(['pw-link', '-i'])).stdout.includes('speakers:playback_FL') || givePorts({'node.name': 'speakers'}, 'Input', 2, true);
}

export async function intoSpeakers(match: Match, port: string, channels: 1 | 2): Promise<boolean> {
  if (!await speakers() || !await givePorts(match, 'Output', channels)) return false;
  const ports = channels === 1 ? [`${port}_MONO`, `${port}_MONO`] : [`${port}_FL`, `${port}_FR`];
  return await link(ports[0], 'speakers:playback_FL') && await link(ports[1], 'speakers:playback_FR');
}

export async function speakersIntoLevels(): Promise<boolean> {
  return await speakers() && await givePorts({'node.name': 'kestrel-sound-levels'}, 'Input', 1) &&
    await link('speakers:monitor_FL', 'kestrel-sound-levels:input_MONO');
}
