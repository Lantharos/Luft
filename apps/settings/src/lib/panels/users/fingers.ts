export const FINGERS = [
	['right-index-finger', 'Right index finger'],
	['left-index-finger', 'Left index finger'],
	['right-thumb', 'Right thumb'],
	['left-thumb', 'Left thumb'],
	['right-middle-finger', 'Right middle finger'],
	['left-middle-finger', 'Left middle finger'],
	['right-ring-finger', 'Right ring finger'],
	['left-ring-finger', 'Left ring finger'],
	['right-little-finger', 'Right little finger'],
	['left-little-finger', 'Left little finger']
] as const;

const LABELS: Record<string, string> = Object.fromEntries(FINGERS);

export const fingerLabel = (finger: string) => LABELS[finger] ?? finger;

export function progressMessage(result: string, swipe: boolean) {
	switch (result) {
		case 'enroll-stage-passed':
			return swipe ? 'Good. Swipe again.' : 'Good. Lift your finger, then place it again.';
		case 'enroll-retry-scan':
			return 'That didn’t read well. Try again.';
		case 'enroll-swipe-too-short':
			return 'Swipe a little slower.';
		case 'enroll-finger-not-centered':
			return 'Center your finger on the sensor.';
		case 'enroll-remove-and-retry':
			return 'Lift your finger and try again.';
		case 'enroll-completed':
			return 'Fingerprint added.';
		case 'enroll-data-full':
			return 'The reader has no room for more fingerprints.';
		case 'enroll-disconnected':
			return 'The fingerprint reader was disconnected.';
		case 'enroll-duplicate':
			return 'This fingerprint has already been added.';
		default:
			return 'Couldn’t add this fingerprint. Try again.';
	}
}
