#[derive(Default)]
pub(super) struct KeyFile {
    preamble: Vec<String>,
    groups: Vec<Group>,
}

struct Group {
    name: String,
    lines: Vec<String>,
}

fn key_of(line: &str) -> Option<&str> {
    let (key, _) = line.split_once('=')?;
    let key = key.trim();
    (!key.is_empty() && !key.starts_with('#')).then_some(key)
}

impl KeyFile {
    pub(super) fn parse(text: &str) -> Self {
        let mut file = Self::default();
        for line in text.lines() {
            let trimmed = line.trim();
            if let Some(name) = trimmed
                .strip_prefix('[')
                .and_then(|rest| rest.strip_suffix(']'))
            {
                file.groups.push(Group {
                    name: name.to_owned(),
                    lines: Vec::new(),
                });
            } else if let Some(group) = file.groups.last_mut() {
                group.lines.push(line.to_owned());
            } else {
                file.preamble.push(line.to_owned());
            }
        }
        file
    }

    pub(super) fn get(&self, group: &str, key: &str) -> Option<&str> {
        self.groups
            .iter()
            .find(|candidate| candidate.name == group)?
            .lines
            .iter()
            .find(|line| key_of(line) == Some(key))?
            .split_once('=')
            .map(|(_, value)| value.trim())
    }

    pub(super) fn set(&mut self, group: &str, key: &str, value: impl std::fmt::Display) {
        let line = format!("{key}={value}");
        let index = match self
            .groups
            .iter()
            .position(|candidate| candidate.name == group)
        {
            Some(index) => index,
            None => {
                self.groups.push(Group {
                    name: group.to_owned(),
                    lines: Vec::new(),
                });
                self.groups.len() - 1
            }
        };
        let lines = &mut self.groups[index].lines;
        match lines
            .iter()
            .position(|existing| key_of(existing) == Some(key))
        {
            Some(existing) => lines[existing] = line,
            None => lines.push(line),
        }
    }

    pub(super) fn remove_group(&mut self, group: &str) {
        self.groups.retain(|candidate| candidate.name != group);
    }

    pub(super) fn render(&self) -> String {
        let mut text = String::new();
        for line in &self.preamble {
            text.push_str(line);
            text.push('\n');
        }
        for (index, group) in self.groups.iter().enumerate() {
            if index > 0 {
                text.push('\n');
            }
            text.push_str(&format!("[{}]\n", group.name));
            for line in group.lines.iter().filter(|line| !line.trim().is_empty()) {
                text.push_str(line);
                text.push('\n');
            }
        }
        text
    }
}
