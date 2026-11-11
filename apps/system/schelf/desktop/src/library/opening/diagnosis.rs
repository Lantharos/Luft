use serde::Serialize;
use specta::Type;

#[derive(Serialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum Need {
    Library,
    Program,
    PerlModule,
    PythonModule,
    Typelib,
}

/// Something an app looked for when it started and didn't find.
#[derive(Serialize, Clone, Debug, PartialEq, Eq, Type)]
pub struct Missing {
    pub kind: Need,
    pub name: String,
}

impl Missing {
    fn new(kind: Need, name: impl Into<String>) -> Self {
        Self {
            kind,
            name: name.into(),
        }
    }

    /// How Fedora's packages name what provides it.
    pub fn capability(&self) -> String {
        let name = &self.name;
        match self.kind {
            Need::Library => format!("{name}()(64bit)"),
            Need::Program => name.clone(),
            Need::PerlModule => format!("perl({name})"),
            Need::PythonModule => format!("python3dist({})", name.to_lowercase()),
            Need::Typelib => format!("typelib({name})"),
        }
    }
}

fn between<'a>(line: &'a str, before: &str, after: &str) -> Option<&'a str> {
    let rest = &line[line.find(before)? + before.len()..];
    let found = &rest[..rest.find(after)?];
    (!found.is_empty() && !found.contains(char::is_whitespace)).then_some(found)
}

fn bare_program(name: &str) -> Option<String> {
    let name = name.rsplit('/').next()?;
    (!name.is_empty()).then(|| name.to_owned())
}

fn missing_in(line: &str) -> Option<Missing> {
    if let Some(library) = between(
        line,
        "error while loading shared libraries: ",
        ": cannot open shared object file",
    ) {
        return Some(Missing::new(Need::Library, library));
    }
    if let Some(module) = between(line, "Can't locate ", ".pm in @INC") {
        return Some(Missing::new(Need::PerlModule, module.replace('/', "::")));
    }
    if let Some(module) = between(line, "No module named '", "'") {
        let top = module.split('.').next().unwrap_or(module);
        return Some(Missing::new(Need::PythonModule, top));
    }
    if let Some(namespace) = between(line, "Typelib file for namespace '", "'")
        .or_else(|| between(line, "Namespace ", " not available"))
    {
        return Some(Missing::new(Need::Typelib, namespace));
    }
    if let Some(program) = between(line, "Can't exec \"", "\"") {
        return bare_program(program).map(|name| Missing::new(Need::Program, name));
    }
    line.strip_suffix(": command not found")
        .or_else(|| line.strip_suffix(": not found"))
        .and_then(|start| start.rsplit(": ").next())
        .filter(|program| !program.contains(char::is_whitespace))
        .and_then(bare_program)
        .map(|name| Missing::new(Need::Program, name))
}

/// What the app's last words say it was missing, the latest first.
pub fn missing(output: &[String]) -> Option<Missing> {
    output.iter().rev().find_map(|line| missing_in(line.trim()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn read(line: &str) -> Option<Missing> {
        missing(&[line.to_owned()])
    }

    #[test]
    fn libraries_the_loader_couldnt_find() {
        assert_eq!(
            read(
                "/usr/lib/chatgpt/ChatGPT: error while loading shared libraries: libnotify.so.4: \
                 cannot open shared object file: No such file or directory"
            ),
            Some(Missing::new(Need::Library, "libnotify.so.4"))
        );
    }

    #[test]
    fn programs_scripts_call() {
        assert_eq!(
            read("sh: line 1: unpaper: command not found"),
            Some(Missing::new(Need::Program, "unpaper"))
        );
        assert_eq!(
            read("Can't exec \"/usr/bin/gocr\": No such file or directory at /usr/bin/x line 3."),
            Some(Missing::new(Need::Program, "gocr"))
        );
        assert_eq!(
            read("/usr/bin/launcher: 4: exec: djvused: not found"),
            Some(Missing::new(Need::Program, "djvused"))
        );
    }

    #[test]
    fn modules_of_scripting_languages() {
        assert_eq!(
            read(
                "Can't locate Image/Sane.pm in @INC (you may need to install the Image::Sane module)"
            ),
            Some(Missing::new(Need::PerlModule, "Image::Sane"))
        );
        assert_eq!(
            read("ModuleNotFoundError: No module named 'PIL.Image'"),
            Some(Missing::new(Need::PythonModule, "PIL"))
        );
        assert_eq!(
            read("ValueError: Namespace Handy not available"),
            Some(Missing::new(Need::Typelib, "Handy"))
        );
    }

    #[test]
    fn the_latest_line_counts() {
        let output = [
            "sh: line 1: first: command not found".to_owned(),
            "error while loading shared libraries: libsecond.so.2: cannot open shared object file"
                .to_owned(),
        ];
        assert_eq!(
            missing(&output),
            Some(Missing::new(Need::Library, "libsecond.so.2"))
        );
    }

    #[test]
    fn other_errors_name_nothing() {
        assert_eq!(read("Segmentation fault (core dumped)"), None);
        assert_eq!(
            read("The SUID sandbox helper binary was found, but is not configured correctly"),
            None
        );
    }
}
