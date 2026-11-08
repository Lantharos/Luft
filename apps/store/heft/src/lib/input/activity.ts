/** When someone last wrote, erased or moved around a page, so background work can wait for a pause. */
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
