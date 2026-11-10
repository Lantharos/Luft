use std::io::Write;

const PAGE: (u32, u32) = (595, 842);
const MARGIN: u32 = 56;
const FONTS: [&str; 3] = ["Helvetica", "Helvetica-Bold", "Courier-Bold"];
const WIN_ANSI_ABOVE_ASCII: [(char, u8); 27] = [
    ('€', 0x80),
    ('‚', 0x82),
    ('ƒ', 0x83),
    ('„', 0x84),
    ('…', 0x85),
    ('†', 0x86),
    ('‡', 0x87),
    ('ˆ', 0x88),
    ('‰', 0x89),
    ('Š', 0x8a),
    ('‹', 0x8b),
    ('Œ', 0x8c),
    ('Ž', 0x8e),
    ('‘', 0x91),
    ('’', 0x92),
    ('“', 0x93),
    ('”', 0x94),
    ('•', 0x95),
    ('–', 0x96),
    ('—', 0x97),
    ('˜', 0x98),
    ('™', 0x99),
    ('š', 0x9a),
    ('›', 0x9b),
    ('œ', 0x9c),
    ('ž', 0x9e),
    ('Ÿ', 0x9f),
];

#[derive(Clone, Copy)]
pub enum Font {
    Text = 1,
    Heading = 2,
    Key = 3,
}

pub struct Line {
    pub font: Font,
    pub size: u32,
    pub gap: u32,
    pub text: String,
}

fn win_ansi(character: char) -> u8 {
    match character {
        '\0'..='\u{7f}' | '\u{a0}'..='\u{ff}' => character as u8,
        _ => WIN_ANSI_ABOVE_ASCII
            .iter()
            .find(|(known, _)| *known == character)
            .map_or(b'?', |(_, byte)| *byte),
    }
}

fn escape(text: &str) -> Vec<u8> {
    let mut escaped = Vec::with_capacity(text.len());
    for character in text.chars() {
        if matches!(character, '(' | ')' | '\\') {
            escaped.push(b'\\');
        }
        escaped.push(win_ansi(character));
    }
    escaped
}

fn content(lines: &[Line]) -> Vec<u8> {
    let mut stream = b"BT\n".to_vec();
    let mut y = PAGE.1 - MARGIN;
    for line in lines {
        y -= line.gap;
        let _ = write!(
            stream,
            "/F{} {} Tf 1 0 0 1 {MARGIN} {y} Tm (",
            line.font as u8, line.size
        );
        stream.extend(escape(&line.text));
        stream.extend(b") Tj\n");
    }
    stream.extend(b"ET\n");
    stream
}

pub fn pdf(lines: &[Line]) -> Vec<u8> {
    let fonts = (1..=FONTS.len())
        .map(|index| format!("/F{index} {} 0 R", index + 3))
        .collect::<Vec<_>>()
        .join(" ");
    let stream = content(lines);
    let mut objects: Vec<Vec<u8>> = vec![
        b"<< /Type /Catalog /Pages 2 0 R >>".to_vec(),
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>".to_vec(),
        format!(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {} {}] /Resources << /Font << {fonts} >> >> /Contents {} 0 R >>",
            PAGE.0,
            PAGE.1,
            FONTS.len() + 4
        )
        .into_bytes(),
    ];
    objects.extend(FONTS.iter().map(|font| {
        format!("<< /Type /Font /Subtype /Type1 /BaseFont /{font} /Encoding /WinAnsiEncoding >>")
            .into_bytes()
    }));
    objects.push(
        [
            format!("<< /Length {} >>\nstream\n", stream.len()).as_bytes(),
            &stream,
            b"endstream",
        ]
        .concat(),
    );

    let mut document = b"%PDF-1.4\n".to_vec();
    let mut offsets = Vec::with_capacity(objects.len());
    for (index, object) in objects.iter().enumerate() {
        offsets.push(document.len());
        let _ = writeln!(document, "{} 0 obj", index + 1);
        document.extend(object);
        document.extend(b"\nendobj\n");
    }
    let table = document.len();
    let _ = write!(
        document,
        "xref\n0 {}\n0000000000 65535 f \n",
        objects.len() + 1
    );
    for offset in offsets {
        let _ = writeln!(document, "{offset:010} 00000 n ");
    }
    let _ = write!(
        document,
        "trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{table}\n%%EOF\n",
        objects.len() + 1
    );
    document
}
