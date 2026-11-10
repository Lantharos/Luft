class Activity {
	private last = 0;

	mark() {
		this.last = performance.now();
	}

	idleFor() {
		return performance.now() - this.last;
	}
}

export const activity = new Activity();
