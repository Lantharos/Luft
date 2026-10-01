const INTERPRETERS: [&str; 8] = [
    "python", "perl", "ruby", "node", "bash", "sh", "bun", "electron",
];
const INSPECTORS: [&str; 3] = ["secret-tool", "seahorse", "lssecret"];
const ELECTRON_BUNDLE: [&str; 3] = ["app", "app.asar", "resources"];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Program {
    pub executable: String,
    script: Option<String>,
    image: Option<String>,
}

impl Program {
    pub fn new(executable: String, script: Option<String>, image: Option<String>) -> Self {
        Self {
            executable,
            script,
            image,
        }
    }

    pub fn parse(text: &str) -> Self {
        let (executable, script) = match text.split_once(' ') {
            Some((executable, script)) => (executable, Some(script.to_owned())),
            None => (text, None),
        };
        Self::new(executable.to_owned(), script, None)
    }

    pub fn text(&self) -> String {
        match (&self.image, &self.script) {
            (Some(image), _) => image.clone(),
            (None, Some(script)) => format!("{} {script}", self.executable),
            (None, None) => self.executable.clone(),
        }
    }

    pub fn launched(&self) -> &str {
        self.image
            .as_deref()
            .or(self.script.as_deref())
            .unwrap_or(&self.executable)
    }

    pub fn interpreted(&self) -> bool {
        is_interpreter(&self.executable)
    }

    pub fn is_inspector(&self) -> bool {
        INSPECTORS.contains(&file_name(&self.executable))
    }

    pub fn label(&self) -> String {
        let launched = self.launched();
        let bundled =
            is_electron(&self.executable) && ELECTRON_BUNDLE.contains(&file_name(launched));
        let label = if bundled {
            launched.rsplit('/').nth(1).unwrap_or(launched)
        } else {
            stem(file_name(launched))
        };
        label.to_owned()
    }

    pub fn name(&self) -> String {
        self.label().to_lowercase()
    }
}

pub fn is_interpreter(path: &str) -> bool {
    let base = file_name(path);
    INTERPRETERS.iter().any(|interpreter| {
        base.strip_prefix(interpreter).is_some_and(|rest| {
            rest.chars()
                .all(|character| character.is_ascii_digit() || character == '.')
        })
    })
}

fn is_electron(path: &str) -> bool {
    file_name(path).starts_with("electron")
}

pub fn file_name(path: &str) -> &str {
    path.rsplit('/').next().unwrap_or(path)
}

pub fn stem(name: &str) -> &str {
    let name = strip_suffix_ignoring_case(name, ".appimage").unwrap_or(name);
    let versioned = name
        .char_indices()
        .find(|&(index, character)| {
            matches!(character, '-' | '_')
                && name[index + 1..].starts_with(|next: char| next.is_ascii_digit())
        })
        .map(|(index, _)| index);
    versioned.map_or(name, |index| &name[..index])
}

fn strip_suffix_ignoring_case<'a>(name: &'a str, suffix: &str) -> Option<&'a str> {
    let split = name.len().checked_sub(suffix.len())?;
    (name.is_char_boundary(split) && name[split..].eq_ignore_ascii_case(suffix))
        .then(|| &name[..split])
}

pub fn versionless(text: &str) -> String {
    text.split(' ')
        .map(|path| {
            let mut components: Vec<String> = path.split('/').map(ToOwned::to_owned).collect();
            let last = components.len() - 1;
            for (index, component) in components.iter_mut().enumerate() {
                if index < last || strip_suffix_ignoring_case(component, ".appimage").is_some() {
                    *component = without_versions(component);
                }
            }
            components.join("/")
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn without_versions(component: &str) -> String {
    let bytes = component.as_bytes();
    let mut result = String::with_capacity(component.len());
    let mut index = 0;
    while index < bytes.len() {
        let end = version_end(bytes, index);
        if end > index {
            result.push('*');
            index = end;
        } else {
            let character = component[index..].chars().next().expect("a character");
            result.push(character);
            index += character.len_utf8();
        }
    }
    result
}

fn version_end(bytes: &[u8], start: usize) -> usize {
    if start > 0 && bytes[start - 1].is_ascii_digit() {
        return start;
    }
    let digits = |from: usize| {
        bytes[from..]
            .iter()
            .take_while(|byte| byte.is_ascii_digit())
            .count()
    };
    let mut end = start + digits(start);
    if end == start {
        return start;
    }
    let mut groups = 1;
    while end + 1 < bytes.len() && bytes[end] == b'.' && bytes[end + 1].is_ascii_digit() {
        end += 1 + digits(end + 1);
        groups += 1;
    }
    if groups > 1 { end } else { start }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn versions_leave_the_path() {
        assert_eq!(
            versionless("/home/k/.config/discord/app-1.0.160/Discord"),
            "/home/k/.config/discord/app-*/Discord"
        );
        assert_eq!(
            versionless("/opt/idea-IU-241.14494.240/bin/idea"),
            "/opt/idea-IU-*/bin/idea"
        );
        assert_eq!(
            versionless("/home/k/Apps/Obsidian-1.6.7.AppImage"),
            "/home/k/Apps/Obsidian-*.AppImage"
        );
        assert_eq!(versionless("/usr/bin/python3.14"), "/usr/bin/python3.14");
        assert_eq!(versionless("/opt/helium/helium"), "/opt/helium/helium");
    }

    #[test]
    fn names_come_from_what_was_launched() {
        assert_eq!(stem("Obsidian-1.6.7.AppImage"), "Obsidian");
        assert_eq!(
            stem("satisfactory_mod_manager.appimage"),
            "satisfactory_mod_manager"
        );
        assert_eq!(
            Program::parse("/usr/lib64/electron/electron34 /usr/lib/obsidian/app.asar").name(),
            "obsidian"
        );
        assert_eq!(
            Program::parse("/home/k/.config/discord/app-1.0.160/Discord").name(),
            "discord"
        );
    }
}
