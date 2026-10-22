use std::cmp::Ordering;
use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::http;

const DOWNLOADS: &str = "https://get.luft.computer";

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Area {
    Desktop,
    Apps,
    System,
    Installing,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Section {
    pub area: Area,
    pub title: String,
    pub changes: Vec<String>,
}

#[derive(Deserialize)]
struct Notes {
    previous: Option<String>,
    notes: Vec<Section>,
}

fn fetch(channel: &str, version: &str) -> Option<Notes> {
    let text = http::text(&format!("{DOWNLOADS}/{channel}/notes/{version}.json")).ok()?;
    serde_json::from_str(&text).ok()
}

pub fn merge(lists: impl IntoIterator<Item = Vec<Section>>) -> Option<Vec<Section>> {
    let mut merged = BTreeMap::<(Area, String), Vec<String>>::new();
    for Section {
        area,
        title,
        changes,
    } in lists.into_iter().flatten()
    {
        merged.entry((area, title)).or_default().extend(changes);
    }
    (!merged.is_empty()).then(|| {
        merged
            .into_iter()
            .map(|((area, title), changes)| Section {
                area,
                title,
                changes,
            })
            .collect()
    })
}

pub fn between(channel: &str, installed: &str, offered: &str) -> Option<Vec<Section>> {
    let mut gathered = Vec::new();
    let mut version = Some(offered.to_owned());
    while let Some(current) = version.take().filter(|current| newer(current, installed)) {
        let Some(Notes { previous, notes }) = fetch(channel, &current) else {
            break;
        };
        gathered.push(notes);
        version = previous;
    }
    merge(gathered)
}

fn numbers(version: &str) -> Vec<u64> {
    version
        .split(['.', '-'])
        .map_while(|part| part.parse().ok())
        .collect()
}

fn newer(version: &str, than: &str) -> bool {
    numbers(version).cmp(&numbers(than)) == Ordering::Greater
}

#[cfg(test)]
mod tests {
    use super::{Area, Section, merge, newer};

    fn section(area: Area, title: &str, changes: &[&str]) -> Section {
        Section {
            area,
            title: title.into(),
            changes: changes.iter().map(|&change| change.into()).collect(),
        }
    }

    #[test]
    fn compares_versions_by_their_numbers() {
        assert!(newer("1.20261022.60", "1.20261022.57"));
        assert!(newer("1.20261101.3", "1.20261022.57"));
        assert!(newer("1.20261022.57", "1.20261020.57-nightly"));
        assert!(!newer("1.20261022.57", "1.20261022.57"));
        assert!(!newer("1.20261020.9", "1.20261022.57"));
    }

    #[test]
    fn merges_each_area_newest_first_in_the_changelog_order() {
        let newest = vec![section(Area::System, "System", &["Sleep wakes faster."])];
        let older = vec![
            section(Area::Desktop, "Desktop", &["The taskbar fades in."]),
            section(Area::Apps, "Rover", &["Rover opens archives."]),
            section(Area::System, "System", &["Updates resume."]),
        ];
        assert_eq!(
            merge([newest, older]),
            Some(vec![
                section(Area::Desktop, "Desktop", &["The taskbar fades in."]),
                section(Area::Apps, "Rover", &["Rover opens archives."]),
                section(
                    Area::System,
                    "System",
                    &["Sleep wakes faster.", "Updates resume."]
                ),
            ])
        );
        assert_eq!(merge([vec![], vec![]]), None);
    }
}
