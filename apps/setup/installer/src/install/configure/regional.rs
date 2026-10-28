use std::os::unix::fs::symlink;
use std::path::PathBuf;

use anyhow::{Result, bail};
use luft_i18n::t;
use luft_installer_contract::{Keyboard, Regional};

use super::deployment::Deployment;
use crate::L10N;
use crate::system::files::write;

fn plain(text: &str, extra: &[char]) -> bool {
    !text.is_empty()
        && text
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || extra.contains(&c))
}

pub fn check(regional: &Regional) -> Result<()> {
    let keyboard = &regional.keyboard;
    if !plain(&regional.locale, &['_', '.', '-', '@'])
        || !plain(&keyboard.layout, &['_', '-'])
        || !(keyboard.variant.is_empty() || plain(&keyboard.variant, &['_', '-']))
        || !plain(&regional.timezone, &['/', '_', '-', '+'])
        || regional.timezone.contains("..")
        || !plain(&regional.hostname, &['-'])
        || regional.hostname.len() > 63
    {
        bail!(t!(L10N, "installer-regional-invalid"));
    }
    Ok(())
}

fn keyboard_conf(Keyboard { layout, variant }: &Keyboard) -> String {
    let mut section = format!(
        "Section \"InputClass\"\n        Identifier \"system-keyboard\"\n        MatchIsKeyboard \"on\"\n        Option \"XkbLayout\" \"{layout}\"\n"
    );
    if !variant.is_empty() {
        section.push_str(&format!("        Option \"XkbVariant\" \"{variant}\"\n"));
    }
    section.push_str("EndSection\n");
    section
}

fn vconsole(Keyboard { layout, variant }: &Keyboard) -> String {
    format!("XKBLAYOUT={layout}\nXKBVARIANT={variant}\n")
}

pub fn apply(regional: &Regional, deployment: &Deployment) -> Result<()> {
    if !deployment
        .root
        .join("usr/share/zoneinfo")
        .join(&regional.timezone)
        .is_file()
    {
        bail!(t!(
            L10N,
            "installer-unknown-zone",
            zone = regional.timezone.as_str()
        ));
    }
    let keyboards = deployment.etc("X11/xorg.conf.d");
    let files: Vec<(PathBuf, String)> = vec![
        (
            deployment.etc("locale.conf"),
            format!("LANG={}\n", regional.locale),
        ),
        (
            deployment.etc("vconsole.conf"),
            vconsole(&regional.keyboard),
        ),
        (
            keyboards.join("00-keyboard.conf"),
            keyboard_conf(&regional.keyboard),
        ),
        (
            deployment.etc("hostname"),
            format!("{}\n", regional.hostname),
        ),
    ];
    for (path, contents) in &files {
        write(path, contents)?;
    }
    let localtime = deployment.etc("localtime");
    let _ = std::fs::remove_file(&localtime);
    symlink(
        format!("../usr/share/zoneinfo/{}", regional.timezone),
        &localtime,
    )?;
    let mut touched: Vec<PathBuf> = files.into_iter().map(|(path, _)| path).collect();
    touched.extend([localtime, keyboards]);
    deployment.relabel(&touched)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn regional(timezone: &str, layout: &str) -> Regional {
        Regional {
            locale: "en_US.UTF-8".to_owned(),
            keyboard: Keyboard {
                layout: layout.to_owned(),
                variant: "nodeadkeys".to_owned(),
            },
            timezone: timezone.to_owned(),
            hostname: "ada-laptop".to_owned(),
        }
    }

    #[test]
    fn refuses_paths_and_quotes() {
        assert!(check(&regional("Europe/Berlin", "de")).is_ok());
        assert!(check(&regional("../../etc/shadow", "de")).is_err());
        assert!(check(&regional("Europe/Berlin", "de\" Option \"x")).is_err());
    }

    #[test]
    fn writes_the_keyboard_for_localed() {
        let settings = regional("Europe/Berlin", "de");
        assert_eq!(
            vconsole(&settings.keyboard),
            "XKBLAYOUT=de\nXKBVARIANT=nodeadkeys\n"
        );
        assert!(keyboard_conf(&settings.keyboard).contains("Option \"XkbVariant\" \"nodeadkeys\""));
    }
}
