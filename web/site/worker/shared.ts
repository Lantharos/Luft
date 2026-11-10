export const refused = (status: number, reason: string) => new Response(reason, { status, headers: { 'cache-control': 'no-store' } });

export async function shared(address: string, seconds: number, context: ExecutionContext, ask: () => Promise<object | null>) {
	const kept = await caches.default.match(address);
	if (kept) return kept;
	const answer = await ask().catch(() => null);
	if (!answer) return refused(502, 'The source did not answer.');
	const response = Response.json(answer, { headers: { 'cache-control': `public, max-age=${seconds}` } });
	context.waitUntil(caches.default.put(address, response.clone()));
	return response;
}
