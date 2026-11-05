import { Guest, appWindow, events as sabineEvents } from '@lantharos/sabine';
import { appearance } from '@luft/ui';
import { commands, events, type Target } from '#lib/bindings.js';

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
		const state = await commands.appState();
		const stops = [
			appearance.start(state),
			events.signinOnline(() => appWindow.close()),
			sabineEvents.singleInstance(async (activation) => {
				appWindow.focus();
				const target = await commands.activationTarget(activation);
				if (target) await this.open(target);
			}),
			sabineEvents.guestNavigated(({ url }) => {
				this.address = url;
				this.loading = false;
				void commands.checkConnectivity();
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
