export function connectivity() {
	return new Response('online', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
}
