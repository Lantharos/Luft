export interface Palette {
	tones: [number, number, number][];
	ink: [number, number, number];
	text: string;
	muted: string;
}

const TONES = ['--accent', '--tertiary', '--secondary'];

function rgb(probe: HTMLElement, variable: string): [number, number, number] {
	probe.style.color = `var(${variable})`;
	const match = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['0', '0', '0'];
	return [Number(match[0]), Number(match[1]), Number(match[2])];
}

export function readPalette(host: HTMLElement): Palette {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	host.append(probe);
	const palette: Palette = {
		tones: TONES.map((variable) => rgb(probe, variable)),
		ink: rgb(probe, '--ink'),
		text: `rgb(${rgb(probe, '--text').join(', ')})`,
		muted: `rgb(${rgb(probe, '--text-muted').join(', ')})`
	};
	probe.remove();
	return palette;
}

export function mix([red, green, blue]: [number, number, number], alpha: number) {
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
