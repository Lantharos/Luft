mod common;

use std::fs;
use std::io::Write;

use common::{job, run, write_scene};
use lopdf::Document;
use tempfile::tempdir;
use zip::write::SimpleFileOptions;

fn pdf_of(folder: &std::path::Path, name: &str, pictures: usize) -> std::path::PathBuf {
    let sources: Vec<_> = (0..pictures)
        .map(|index| {
            let path = folder.join(format!("{name}-{index}.png"));
            common::scene(64 + index as u32, 48).save(&path).unwrap();
            path
        })
        .collect();
    let references: Vec<&std::path::Path> = sources.iter().map(|path| path.as_path()).collect();
    let output = run(&job(&references, folder, &format!("{name}.pdf"), "pdf")).unwrap();
    sources
        .iter()
        .for_each(|path| fs::remove_file(path).unwrap());
    output
}

fn pages(path: &std::path::Path) -> usize {
    Document::load(path).unwrap().get_pages().len()
}

#[test]
fn pictures_become_a_pdf_with_one_page_each() {
    let folder = tempdir().unwrap();
    assert_eq!(pages(&pdf_of(folder.path(), "album", 3)), 3);
}

#[test]
fn jpegs_stay_jpegs_inside_a_pdf() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 64, 48);
    let jpeg = run(&job(&[&source], folder.path(), "photo.jpg", "jpeg")).unwrap();
    let pdf = run(&job(&[&jpeg], folder.path(), "photo.pdf", "pdf")).unwrap();
    let original = fs::read(&jpeg).unwrap();
    let embedded = fs::read(&pdf).unwrap();
    assert!(
        embedded
            .windows(original.len())
            .any(|window| window == original)
    );
}

#[test]
fn pdfs_merge_and_split() {
    let folder = tempdir().unwrap();
    let first = pdf_of(folder.path(), "first", 2);
    let second = pdf_of(folder.path(), "second", 3);
    let merged = run(&job(&[&first, &second], folder.path(), "merged.pdf", "pdf")).unwrap();
    assert_eq!(pages(&merged), 5);
    let image = convertible_lib::engine::document::pdf::render_page(&merged, 4, 72).unwrap();
    assert!(image.width() > 10);

    let mut range = job(&[&merged], folder.path(), "part.pdf", "pdf");
    range.options.pages = "2-3,5".to_owned();
    assert_eq!(pages(&run(&range).unwrap()), 3);

    let mut split = job(&[&merged], folder.path(), "each.pdf", "pdf");
    split.options.split = true;
    let output = run(&split).unwrap();
    assert!(output.is_dir());
    assert_eq!(fs::read_dir(&output).unwrap().count(), 5);
}

#[test]
fn pages_become_pictures() {
    let folder = tempdir().unwrap();
    let source = pdf_of(folder.path(), "pages", 2);
    let mut render = job(&[&source], folder.path(), "pages.png", "png");
    render.options.dpi = 144;
    let output = run(&render).unwrap();
    assert!(output.is_dir());
    let mut files: Vec<_> = fs::read_dir(&output)
        .unwrap()
        .flatten()
        .map(|entry| entry.path())
        .collect();
    files.sort();
    let image = image::open(&files[0]).unwrap();
    assert_eq!((image.width(), image.height()), (96, 72));

    render.options.pages = "2".to_owned();
    let single = run(&render).unwrap();
    assert!(single.is_file());
    assert!(image::open(&single).is_ok());
}

#[test]
fn bad_page_ranges_are_refused() {
    let folder = tempdir().unwrap();
    let source = pdf_of(folder.path(), "pages", 2);
    let mut render = job(&[&source], folder.path(), "pages.png", "png");
    render.options.pages = "4".to_owned();
    assert!(run(&render).is_err());
}

const MARKDOWN: &str = "# Field notes\n\nThe tide came **in** early.\n\n- buoy\n- rope\n\n```\nlet x = 1;\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |\n";

#[test]
fn markdown_converts_to_html_text_and_pdf() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("notes.md");
    fs::write(&source, MARKDOWN).unwrap();
    let html =
        fs::read_to_string(run(&job(&[&source], folder.path(), "notes.html", "html")).unwrap())
            .unwrap();
    assert!(
        html.contains("<h1>Field notes</h1>")
            && html.contains("<strong>in</strong>")
            && html.contains("<table>")
    );
    let text =
        fs::read_to_string(run(&job(&[&source], folder.path(), "notes.txt", "txt")).unwrap())
            .unwrap();
    assert!(text.contains("The tide came in early.") && !text.contains('#'));
    let pdf = run(&job(&[&source], folder.path(), "notes.pdf", "pdf")).unwrap();
    assert_eq!(pages(&pdf), 1);
    let document = Document::load(&pdf).unwrap();
    let extracted = document.extract_text(&[1]).unwrap();
    assert!(
        extracted.contains("Field") && extracted.contains("early"),
        "{extracted}"
    );
}

#[test]
fn long_markdown_flows_over_pages() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("long.md");
    fs::write(
        &source,
        "A sentence that goes on for a while and wraps around. ".repeat(600),
    )
    .unwrap();
    let pdf = run(&job(&[&source], folder.path(), "long.pdf", "pdf")).unwrap();
    assert!(pages(&pdf) > 1);
}

#[test]
fn letters_the_page_font_lacks_are_refused_rather_than_shown_as_boxes() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("japanese.md");
    fs::write(&source, "港の灯り").unwrap();
    let failure = run(&job(&[&source], folder.path(), "out.pdf", "pdf")).unwrap_err();
    assert!(failure.0.contains('港'), "{failure}");
    assert_eq!(common::only_entries(folder.path()), ["japanese.md"]);
}

fn word_document(path: &std::path::Path) {
    let body = r#"<?xml version="1.0"?><w:document xmlns:w="w"><w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Plan &amp; budget</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Bold</w:t></w:r><w:r><w:t xml:space="preserve"> then plain</w:t></w:r></w:p>
<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/></w:numPr></w:pPr><w:r><w:t>First item</w:t></w:r></w:p>
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>A</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>B</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
</w:body></w:document>"#;
    let mut writer = zip::ZipWriter::new(fs::File::create(path).unwrap());
    writer
        .start_file("word/document.xml", SimpleFileOptions::default())
        .unwrap();
    writer.write_all(body.as_bytes()).unwrap();
    writer.finish().unwrap();
}

#[test]
fn word_files_give_up_their_text() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("plan.docx");
    word_document(&source);
    let markdown =
        fs::read_to_string(run(&job(&[&source], folder.path(), "plan.md", "md")).unwrap()).unwrap();
    assert!(markdown.contains("# Plan & budget"), "{markdown}");
    assert!(markdown.contains("**Bold** then plain"), "{markdown}");
    assert!(markdown.contains("- First item"), "{markdown}");
    assert!(markdown.contains("| A | B |"), "{markdown}");
}

#[test]
fn sheets_round_trip_through_excel() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("data.csv");
    fs::write(&source, "name,count\n\"Doe, Jo\",3\nAna,4.5\n").unwrap();
    let excel = run(&job(&[&source], folder.path(), "data.xlsx", "xlsx")).unwrap();
    let back = run(&job(&[&excel], folder.path(), "back.tsv", "tsv")).unwrap();
    assert_eq!(
        fs::read_to_string(back).unwrap(),
        "name\tcount\nDoe, Jo\t3\nAna\t4.5\n"
    );
}
