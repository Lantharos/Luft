export function escapeHtml(text: string) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function signatureHtml(signature: string) {
	return `<div class="signature">-- <br>${escapeHtml(signature).replace(/\n/g, '<br>')}</div>`;
}
