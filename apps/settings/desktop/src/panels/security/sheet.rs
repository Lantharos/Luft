use std::fmt::Write;

const PAGE: (u32, u32) = (595, 842);
const MARGIN: u32 = 56;
const FONTS: [&str; 3] = ["Helvetica", "Helvetica-Bold", "Courier-Bold"];

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

fn escape(text: &str) -> String {
    let mut escaped = String::with_capacity(text.len());
    for character in text.chars() {
        if matches!(character, '(' | ')' | '\\') {
            escaped.push('\\');
        }
        escaped.push(if character.is_ascii() { character } else { '?' });
    }
    escaped
}

fn content(lines: &[Line]) -> String {
    let mut stream = String::from("BT\n");
    let mut y = PAGE.1 - MARGIN;
    for line in lines {
        y -= line.gap;
        let _ = writeln!(
            stream,
            "/F{} {} Tf 1 0 0 1 {MARGIN} {y} Tm ({}) Tj",
            line.font as u8,
            line.size,
            escape(&line.text)
        );
    }
    stream.push_str("ET\n");
    stream
}

pub fn pdf(lines: &[Line]) -> Vec<u8> {
    let fonts = (1..=FONTS.len())
        .map(|index| format!("/F{index} {} 0 R", index + 3))
        .collect::<Vec<_>>()
        .join(" ");
    let stream = content(lines);
    let mut objects = vec![
        "<< /Type /Catalog /Pages 2 0 R >>".to_owned(),
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>".to_owned(),
        format!(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {} {}] /Resources << /Font << {fonts} >> >> /Contents {} 0 R >>",
            PAGE.0,
            PAGE.1,
            FONTS.len() + 4
        ),
    ];
    objects.extend(FONTS.iter().map(|font| {
        format!("<< /Type /Font /Subtype /Type1 /BaseFont /{font} /Encoding /WinAnsiEncoding >>")
    }));
    objects.push(format!(
        "<< /Length {} >>\nstream\n{stream}endstream",
        stream.len()
    ));

    let mut document = String::from("%PDF-1.4\n");
    let mut offsets = Vec::with_capacity(objects.len());
    for (index, object) in objects.iter().enumerate() {
        offsets.push(document.len());
        let _ = write!(document, "{} 0 obj\n{object}\nendobj\n", index + 1);
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
    document.into_bytes()
}
