const FACES = ['400', '700', 'italic 400', 'italic 700'];

export function loadFonts() {
	return Promise.all(FACES.map((face) => document.fonts.load(`${face} 16px "Maple Mono NF"`)));
}
