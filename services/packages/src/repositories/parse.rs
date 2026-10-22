use anyhow::{Result, bail};

const KEPT: [&str; 14] = [
    "name",
    "baseurl",
    "metalink",
    "mirrorlist",
    "type",
    "skip_if_unavailable",
    "metadata_expire",
    "priority",
    "cost",
    "repo_gpgcheck",
    "includepkgs",
    "excludepkgs",
    "exclude",
    "module_hotfixes",
];
const ADDRESSES: [&str; 3] = ["baseurl", "metalink", "mirrorlist"];

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Section {
    pub id: String,
    pub values: Vec<(String, String)>,
}

impl Section {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.values
            .iter()
            .find(|(found, _)| found == key)
            .map(|(_, value)| value.as_str())
    }

    pub fn name(&self) -> &str {
        self.get("name").unwrap_or(&self.id)
    }

    pub fn address(&self) -> Option<&str> {
        ADDRESSES
            .iter()
            .find_map(|key| self.get(key))
            .and_then(|value| words(value).next())
    }

    pub fn keys(&self) -> Vec<&str> {
        self.get("gpgkey")
            .map(|value| words(value).collect())
            .unwrap_or_default()
    }

    fn enabled(&self) -> bool {
        self.get("enabled").is_none_or(truthy)
    }
}

pub fn words(value: &str) -> impl Iterator<Item = &str> {
    value
        .split(|character: char| character.is_whitespace() || character == ',')
        .filter(|word| !word.is_empty())
}

fn truthy(value: &str) -> bool {
    matches!(
        value.trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

pub fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._:-".contains(character))
}

/// Reads a dnf repository file, joining the indented lines that continue a value.
pub fn parse(text: &str) -> Result<Vec<Section>> {
    let mut sections: Vec<Section> = Vec::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with(['#', ';']) {
            continue;
        }
        if let Some(id) = trimmed
            .strip_prefix('[')
            .and_then(|rest| rest.strip_suffix(']'))
        {
            if !valid_id(id) {
                bail!("“{id}” isn't a name a software source can have.");
            }
            sections.push(Section {
                id: id.to_owned(),
                values: Vec::new(),
            });
            continue;
        }
        let Some(section) = sections.last_mut() else {
            bail!("This isn't a software source file.");
        };
        if line.starts_with(char::is_whitespace)
            && let Some((_, value)) = section.values.last_mut()
        {
            value.push(' ');
            value.push_str(trimmed);
            continue;
        }
        let Some((key, value)) = trimmed.split_once('=') else {
            bail!("This isn't a software source file.");
        };
        section
            .values
            .push((key.trim().to_ascii_lowercase(), value.trim().to_owned()));
    }
    if sections.is_empty() {
        bail!("This file has no software sources in it.");
    }
    Ok(sections)
}

fn secure(address: &str) -> bool {
    address.starts_with("https://")
}

/// The sections that are turned on, with only the settings that choose where packages come
/// from. Every one must check package signatures with a key and reach its server over HTTPS.
pub fn enabled(sections: Vec<Section>) -> Result<Vec<Section>> {
    let enabled: Vec<Section> = sections.into_iter().filter(Section::enabled).collect();
    if enabled.is_empty() {
        bail!("This file has no software sources that are turned on.");
    }
    for section in &enabled {
        let name = section.name();
        if !section.get("gpgcheck").is_some_and(truthy) {
            bail!("{name} doesn't sign its packages, so Luft can't check them.");
        }
        if section.keys().is_empty() {
            bail!("{name} doesn't name the key its packages are signed with.");
        }
        let addresses: Vec<&str> = ADDRESSES
            .iter()
            .filter_map(|key| section.get(key))
            .flat_map(words)
            .collect();
        if addresses.is_empty() {
            bail!("{name} doesn't say where its packages are.");
        }
        if let Some(address) = addresses.iter().find(|address| !secure(address)) {
            bail!("{name} isn't reached over a secure connection ({address}).");
        }
    }
    Ok(enabled)
}

/// Writes the sections back with signatures required and `gpgkey` pointing at the keys kept
/// on the computer, which `local` names for each address.
pub fn render(sections: &[Section], local: impl Fn(&str) -> String) -> String {
    let mut text = String::new();
    for section in sections {
        if !text.is_empty() {
            text.push('\n');
        }
        text.push_str(&format!("[{}]\n", section.id));
        for (key, value) in &section.values {
            if KEPT.contains(&key.as_str()) {
                text.push_str(&format!("{key}={value}\n"));
            }
        }
        let keys: Vec<String> = section.keys().into_iter().map(&local).collect();
        text.push_str(&format!(
            "enabled=1\ngpgcheck=1\ngpgkey={}\n",
            keys.join(" ")
        ));
    }
    text
}

#[cfg(test)]
mod tests {
    use super::*;

    const DOCKER: &str = "[docker-ce-stable]\nname=Docker CE Stable - $basearch\n\
        baseurl=https://download.docker.com/linux/fedora/$releasever/$basearch/stable\n\
        enabled=1\ngpgcheck=1\ngpgkey=https://download.docker.com/linux/fedora/gpg\n\n\
        [docker-ce-test]\nname=Docker CE Test\nbaseurl=https://download.docker.com/test\n\
        enabled=0\ngpgcheck=1\ngpgkey=https://download.docker.com/linux/fedora/gpg\n";

    #[test]
    fn keeps_only_the_sources_that_are_turned_on() {
        let sections = enabled(parse(DOCKER).unwrap()).unwrap();
        assert_eq!(sections.len(), 1);
        assert_eq!(sections[0].name(), "Docker CE Stable - $basearch");
        assert_eq!(
            sections[0].address(),
            Some("https://download.docker.com/linux/fedora/$releasever/$basearch/stable")
        );
    }

    #[test]
    fn refuses_sources_that_dont_check_signatures_or_use_plain_http() {
        let unsigned = "[stripe]\nbaseurl=https://packages.stripe.dev/x\ngpgcheck=0\n";
        assert!(enabled(parse(unsigned).unwrap()).is_err());
        let plain = "[x]\nbaseurl=http://example.com\ngpgcheck=1\ngpgkey=https://example.com/k\n";
        assert!(enabled(parse(plain).unwrap()).is_err());
        let keyless = "[x]\nbaseurl=https://example.com\ngpgcheck=1\n";
        assert!(enabled(parse(keyless).unwrap()).is_err());
    }

    #[test]
    fn reads_keys_continued_on_the_next_lines() {
        let text = "[x]\nbaseurl=https://example.com\ngpgcheck=1\n\
            gpgkey=https://example.com/a\n       https://example.com/b\n";
        let sections = parse(text).unwrap();
        assert_eq!(
            sections[0].keys(),
            ["https://example.com/a", "https://example.com/b"]
        );
    }

    #[test]
    fn writes_back_only_where_packages_come_from() {
        let text = "[x]\nname=X\nbaseurl=https://example.com\nsslverify=0\n\
            gpgcheck=1\nrepo_gpgcheck=1\ngpgkey=https://example.com/a\n";
        let sections = enabled(parse(text).unwrap()).unwrap();
        assert_eq!(
            render(&sections, |_| "file:///k.asc".to_owned()),
            "[x]\nname=X\nbaseurl=https://example.com\nrepo_gpgcheck=1\n\
             enabled=1\ngpgcheck=1\ngpgkey=file:///k.asc\n"
        );
    }
}
