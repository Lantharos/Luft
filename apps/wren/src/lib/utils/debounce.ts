export function debounce(run: () => void, delay: number) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(run, delay);
	};
	schedule.cancel = () => clearTimeout(timer);
	return schedule;
}
