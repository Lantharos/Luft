mod ibus;
pub mod sequences;
pub mod system;
pub mod user;

use std::fs;

use crate::paths;
pub use ibus::Reloader;

const HEADER: &str =
    "# Dead keys from your layouts in Keys. Keys rewrites this file when they change.\n";
const SECTION: &str = "# layout ";

fn sections(text: &str) -> Vec<(String, String)> {
    let mut sections: Vec<(String, String)> = Vec::new();
    for line in text.lines() {
        if let Some(id) = line.strip_prefix(SECTION) {
            sections.push((id.to_owned(), String::new()));
        } else if let Some((_, body)) = sections.last_mut() {
            body.push_str(line);
            body.push('\n');
        }
    }
    sections
}

pub fn update(id: &str, sequences: &str, reloader: &Reloader) -> Result<(), String> {
    let file = paths::compose();
    let before = fs::read_to_string(&file).unwrap_or_default();
    let mut sections = sections(&before);
    sections.retain(|(section, _)| section != id);
    if !sequences.is_empty() {
        sections.push((id.to_owned(), sequences.to_owned()));
    }
    let mut after = HEADER.to_owned();
    for (section, body) in &sections {
        after.push_str(SECTION);
        after.push_str(section);
        after.push('\n');
        after.push_str(body);
    }
    if after == before || (before.is_empty() && sections.is_empty()) {
        return Ok(());
    }
    paths::write(&file, &after)?;
    user::include(&file)?;
    reloader.reload();
    Ok(())
}
