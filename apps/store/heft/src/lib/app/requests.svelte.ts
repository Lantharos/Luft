/** Dialogs asked for from places that don't own them, such as the command palette. */
class Requests {
	export: 'pdf' | 'png' | null = $state(null);
	newSubject = $state(false);
	photo = $state(false);
}

export const requests = new Requests();
