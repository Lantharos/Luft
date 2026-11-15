<script lang="ts">
	import { statusLabel, statusTone } from '../format';
	import type { ReleaseStatus } from '../store';

	let { status }: { status: ReleaseStatus } = $props();
	</script>

<span class="status {statusTone(status)}"><span class="dot"></span>{statusLabel(status)}</span>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		white-space: nowrap;
		font-size: 13px;
		color: var(--text-soft);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: var(--radius-pill);
		background: var(--text-muted);
	}

	.done .dot {
		background: var(--success);
	}

	.active .dot {
		background: var(--secondary);
	}

	.attention {
		color: var(--danger);
	}

	.attention .dot {
		background: var(--danger);
	}
</style>
