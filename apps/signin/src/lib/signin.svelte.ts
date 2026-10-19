import { Guest, appWindow, events, invoke, listen } from '@lantharos/sabine';
import { appearance, type Appearance } from '@luft/ui';

interface Target {
	network: string;
	url: string;
}

interface AppState extends Appearance {
	target: Target | null;
}

interface Activation {
	arguments: string[];
}

const PARTITION = 'portal';

class SignIn {
	network = $state('');
	address = $state('');
	loading = $state(true);
	private guest: Guest | null = null;
	private bounds = { x: 0, y: 0, width: 1, height: 1 };

	get host(): string {
		return URL.canParse(this.address) ? new URL(this.address).host : '';
	}

	get secure(): boolean {
		return this.address.startsWith('https:');
	}

	async start(): Promise<() => void> {
		const state = await invoke<AppState>('app_state');
		const stops = [
			appearance.start(state),
			listen('signin.online', () => appWindow.close()),
			listen<Activation>('singleInstance.activate', async ({ arguments: args }) => {
				appWindow.focus();
				const target = await invoke<Target | null>('activation_target', { arguments: args });
				if (target) await this.open(target);
			}),
			events.guestNavigated(({ url }) => {
				this.address = url;
				this.loading = false;
				void invoke('check_connectivity');
			})
		];
		if (state.target) await this.open(state.target);
		return () => stops.forEach((stop) => stop());
	}

	private async open({ network, url }: Target) {
		this.network = network;
		this.address = url;
		this.loading = true;
		if (this.guest) {
			await this.guest.navigate(url);
			return;
		}
		this.guest = await Guest.create({
			id: PARTITION,
			url,
			bounds: this.bounds,
			partition: PARTITION,
			popupPolicy: 'navigateSame',
			allowDownloads: false,
			backgroundColor: '#ffffff'
		});
		await this.guest.setBounds(this.bounds);
	}

	place(rect: DOMRect) {
		this.bounds = { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
		void this.guest?.setBounds(this.bounds);
	}

	reload() {
		this.loading = true;
		void this.guest?.reload({ ignoreCache: true });
	}
}

export const signIn = new SignIn();
