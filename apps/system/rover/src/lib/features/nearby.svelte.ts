import { commands, events, type NearbyDevice } from '#lib/bindings.js';

/** Devices Pigeon finds nearby, empty while Pigeon isn't running. */
export class NearbyState {
	devices = $state.raw<NearbyDevice[]>([]);

	load = async () => {
		void events.roverNearby((devices) => (this.devices = devices));
		this.devices = await commands.nearbyDevices().catch(() => []);
	};

	lookAgain = () => void commands.lookForDevices().catch(() => {});

	send = (device: string, paths: string[]) => commands.sendToDevice({ device, paths });
}
