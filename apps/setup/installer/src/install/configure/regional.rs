use std::os::unix::fs::symlink;
use std::path::PathBuf;

use anyhow::{Result, bail};
use luft_i18n::t;
use serde::Deserialize;

use super::deployment::Deployment;
use crate::L10N;
use crate::system::files::write;

#[derive(Deserialize, Clone)]
pub struct Keyboard {
    pub layout: String,
    #[serde(default)]
    pub variant: String,
}

#[derive(Deserialize, Clone)]
pub struct Regional {
    pub locale: String,
    pub keyboard: Keyboard,
    pub timezone: String,
    pub hostname: String,
}

fn plain(text: &str, extra: &[char]) -> bool {
    !text.is_empty()
        && text
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || extra.contains(&c))
}

impl Regional {
    pub fn check(&self) -> Result<()> {
        let keyboard = &self.keyboard;
        if !plain(&self.locale, &['_', '.', '-', '@'])
            || !plain(&keyboard.layout, &['_', '-'])
            || !(keyboard.variant.is_empty() || plain(&keyboard.variant, &['_', '-']))
            || !plain(&self.timezone, &['/', '_', '-', '+'])
            || self.timezone.contains("..")
            || !plain(&self.hostname, &['-'])
            || self.hostname.len() > 63
        {
            bail!(t!(L10N, "installer-regional-invalid"));
        }
        Ok(())
    }

    fn keyboard_conf(&self) -> String {
        let Keyboard { layout, variant } = &self.keyboard;
        let mut section = format!(
            "Section \"InputClass\"\n        Identifier \"system-keyboard\"\n        MatchIsKeyboard \"on\"\n        Option \"XkbLayout\" \"{layout}\"\n"
        );
        if !variant.is_empty() {
            section.push_str(&format!("        Option \"XkbVariant\" \"{variant}\"\n"));
        }
        section.push_str("EndSection\n");
        section
    }

    fn vconsole(&self) -> String {
        let Keyboard { layout, variant } = &self.keyboard;
        format!("XKBLAYOUT={layout}\nXKBVARIANT={variant}\n")
    }

    pub fn apply(&self, deployment: &Deployment) -> Result<()> {
        if !deployment
            .root
            .join("usr/share/zoneinfo")
            .join(&self.timezone)
            .is_file()
        {
            bail!(t!(
                L10N,
                "installer-unknown-zone",
                zone = self.timezone.as_str()
            ));
        }
        let files: Vec<(PathBuf, String)> = vec![
            (
                deployment.etc("locale.conf"),
                format!("LANG={}\n", self.locale),
            ),
            (deployment.etc("vconsole.conf"), self.vconsole()),
            (
                deployment.etc("X11/xorg.conf.d/00-keyboard.conf"),
                self.keyboard_conf(),
            ),
            (deployment.etc("hostname"), format!("{}\n", self.hostname)),
        ];
        for (path, contents) in &files {
            write(path, contents)?;
        }
        let localtime = deployment.etc("localtime");
        let _ = std::fs::remove_file(&localtime);
        symlink(
            format!("../usr/share/zoneinfo/{}", self.timezone),
            &localtime,
        )?;
        let mut touched: Vec<PathBuf> = files.into_iter().map(|(path, _)| path).collect();
        touched.push(localtime);
        deployment.relabel(&touched)
    }
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
        assert!(regional("Europe/Berlin", "de").check().is_ok());
        assert!(regional("../../etc/shadow", "de").check().is_err());
        assert!(
            regional("Europe/Berlin", "de\" Option \"x")
                .check()
                .is_err()
        );
    }

    #[test]
    fn writes_the_keyboard_for_localed() {
        let settings = regional("Europe/Berlin", "de");
        assert_eq!(settings.vconsole(), "XKBLAYOUT=de\nXKBVARIANT=nodeadkeys\n");
        assert!(
            settings
                .keyboard_conf()
                .contains("Option \"XkbVariant\" \"nodeadkeys\"")
        );
    }
}
