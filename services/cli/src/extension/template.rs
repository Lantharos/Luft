//! A new extension that runs as it is: a manifest, one module and its English
//! messages, in a folder named after its id.

use std::path::Path;

use crate::failure::{Failure, Outcome};

fn short_name(id: &str) -> &str {
    id.rsplit('.').next().unwrap_or(id)
}

fn manifest(id: &str, minimum: &str) -> String {
    format!(
        "id = \"{id}\"\nname = \"{name}\"\ndescription = \"Says hello from quick settings.\"\nversion = \"1.0.0\"\napi = 1\npermissions = [\"quick-settings\", \"notifications\"]\n\n[luft]\nminimum = \"{minimum}\"\n\n[[settings]]\nkey = \"loud\"\ntype = \"switch\"\nlabel = \"loud\"\ndefault = false\n",
        name = short_name(id)
    )
}

const MODULE: &str = "export default function enable(luft) {
  luft.quickSettings.addToggle({
    title: luft.t('title'),
    icon: 'face-smile-symbolic',
    onToggled: on => {
      if (on) luft.notifications.send({ title: luft.t(luft.settings.get('loud') ? 'shout' : 'greeting') });
    },
  });
}
";

fn messages(id: &str) -> String {
    format!(
        "extension-name = {name}\nextension-description = Says hello from quick settings.\ntitle = {name}\ngreeting = Hello there\nshout = HELLO THERE\nloud = Shout\n    .description = Says it louder\n",
        name = short_name(id)
    )
}

/// Makes the folder for `id` in `parent`, refusing one that's already there.
pub fn make(parent: &Path, id: &str, minimum: &str) -> Outcome<std::path::PathBuf> {
    let folder = parent.join(id);
    if folder.exists() {
        return Err(Failure::invalid(format!(
            "{} is already there.",
            folder.display()
        )));
    }
    std::fs::create_dir_all(folder.join("locales/en"))?;
    std::fs::write(folder.join("extension.toml"), manifest(id, minimum))?;
    std::fs::write(folder.join("extension.js"), MODULE)?;
    std::fs::write(
        folder
            .join("locales/en")
            .join(format!("{}.ftl", short_name(id).to_lowercase())),
        messages(id),
    )?;
    Ok(folder)
}

#[cfg(test)]
mod tests {
    use super::{make, manifest};
    use crate::extension::manifest::parse;

    #[test]
    fn a_new_extension_passes_its_own_check() {
        assert!(parse(&manifest("com.example.Weather", "1.2")).is_ok());
        let parent = tempfile::tempdir().unwrap();
        let folder = make(parent.path(), "com.example.Weather", "1.2").unwrap();
        assert!(folder.join("locales/en/weather.ftl").is_file());
        assert!(make(parent.path(), "com.example.Weather", "1.2").is_err());
    }
}
