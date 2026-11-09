import GdkPixbuf from 'gi://GdkPixbuf';

const encoder = new TextEncoder();

/** A blank A4 page as a PDF, laid out with the offsets PDF readers look for. */
export function onePagePdf(): Uint8Array {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>',
  ];
  let text = '%PDF-1.4\n';
  const offsets = objects.map((body, index) => {
    const at = text.length;
    text += `${index + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const table = text.length;
  text += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(at => `${String(at).padStart(10, '0')} 00000 n \n`).join('')}`;
  text += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${table}\n%%EOF\n`;
  return encoder.encode(text);
}

/** A small picture in one colour, saved as a PNG. */
export function savePicture(path: string): void {
  const picture = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 320, 200)!;
  picture.fill(0x3d6fb6ff);
  picture.savev(path, 'png', [], []);
}
