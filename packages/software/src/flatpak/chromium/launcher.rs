use std::fs;
use std::path::{Path, PathBuf};

use super::flags::{FlagsFile, Style};
use crate::chromium::ENABLE_FEATURES;

const APPLICATION_GROUP: &str = "[Application]";
const COBALT_CONFIG: &str = "etc/cobalt.ini";
const CONFIG_HOME: &str = "XDG_CONFIG_HOME";
const FLAGS_SUFFIX: &str = "flags.conf";

pub fn flags_file(id: &str, deploy: &Path) -> Option<FlagsFile> {
    let files = deploy.join("files");
    if let Ok(cobalt) = fs::read_to_string(files.join(COBALT_CONFIG)) {
        let name = application_key(&cobalt, "Name")
            .map(str::to_owned)
            .unwrap_or_else(|| id.rsplit('.').next().unwrap_or(id).to_lowercase());
        return Some(FlagsFile {
            path: PathBuf::from(format!("{name}-{FLAGS_SUFFIX}")),
            style: Style::Cobalt,
        });
    }
    let metadata = fs::read_to_string(deploy.join("metadata")).ok()?;
    let command = application_key(&metadata, "command")?;
    let script = match command.strip_prefix("/app/") {
        Some(inside) => files.join(inside),
        None => files.join("bin").join(command),
    };
    let script = fs::read(script).ok()?;
    let script = String::from_utf8(script).ok()?;
    script_flags_file(&script).map(|path| FlagsFile {
        path,
        style: Style::Arguments,
    })
}

fn application_key<'a>(ini: &'a str, key: &str) -> Option<&'a str> {
    ini.lines()
        .map(str::trim)
        .skip_while(|line| *line != APPLICATION_GROUP)
        .skip(1)
        .take_while(|line| !line.starts_with('['))
        .filter_map(|line| line.split_once('='))
        .find(|(name, _)| name.trim() == key)
        .map(|(_, value)| value.trim())
        .filter(|value| !value.is_empty())
}

fn script_flags_file(script: &str) -> Option<PathBuf> {
    if script.contains(ENABLE_FEATURES) {
        return None;
    }
    script.match_indices(CONFIG_HOME).find_map(|(start, _)| {
        let rest = script[start + CONFIG_HOME.len()..].trim_start_matches('}');
        let path: String = rest
            .strip_prefix('/')?
            .chars()
            .take_while(|character| {
                character.is_ascii_alphanumeric() || "._/-".contains(*character)
            })
            .collect();
        path.ends_with(FLAGS_SUFFIX).then(|| PathBuf::from(path))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_flags_file_a_launcher_passes_on() {
        let script = "if [ -f \"${XDG_CONFIG_HOME}/discord-flags.conf\" ]\nthen\n    mapfile -t FLAGS <<< \"$(grep -Ev '^\\s*$|^#' \"${XDG_CONFIG_HOME}/discord-flags.conf\")\"\nfi\nzypak-wrapper /app/discord/Discord \"${FLAGS[@]}\" \"$@\"";
        assert_eq!(
            script_flags_file(script),
            Some(PathBuf::from("discord-flags.conf"))
        );
    }

    #[test]
    fn leaves_launchers_that_choose_their_own_features() {
        let script = "OBSIDIAN_USER_ARGS_FILE=\"${XDG_CONFIG_HOME}/obsidian/user-flags.conf\"\nEXTRA_ARGS+=(--enable-features=WaylandWindowDecorations)";
        assert_eq!(script_flags_file(script), None);
    }

    #[test]
    fn ignores_other_config_files() {
        let script = "FIRST_RUN=\"${XDG_CONFIG_HOME}/flatpak-vscode-first-run\"";
        assert_eq!(script_flags_file(script), None);
    }

    #[test]
    fn finds_application_keys() {
        let ini = "[Application]\nName=brave\nConfigDir=BraveSoftware/Brave-Browser\n\n[Zypak]\nName=other";
        assert_eq!(application_key(ini, "Name"), Some("brave"));
        assert_eq!(application_key(ini, "EntryPoint"), None);
    }
}
