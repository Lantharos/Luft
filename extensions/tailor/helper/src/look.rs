use std::collections::BTreeMap;
use std::fmt::Write;

use serde::{Deserialize, Serialize};

/// The desktop's look, as the extension passes it on whenever it changes.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Look {
    pub dark: bool,
    pub colors: BTreeMap<String, String>,
    pub font: String,
    pub text_scale: f64,
    pub square_corners: bool,
    pub reduced_motion: bool,
}

fn kebab(role: &str) -> String {
    role.chars().fold(String::new(), |mut name, letter| {
        if letter.is_ascii_uppercase() {
            name.push('-');
        }
        name.push(letter.to_ascii_lowercase());
        name
    })
}

impl Look {
    /// The look as CSS custom properties, which each app's stylesheet draws from.
    pub fn stylesheet(&self) -> String {
        let mut css = String::from(":root {\n");
        for (role, color) in &self.colors {
            let _ = writeln!(css, "  --kestrel-{}: {color};", kebab(role));
        }
        let _ = writeln!(css, "  --luft-font: \"{}\";", self.font);
        let _ = writeln!(css, "  --luft-text-scale: {};", self.text_scale);
        let _ = writeln!(css, "  --luft-corners: {};", u8::from(!self.square_corners));
        let _ = writeln!(
            css,
            "  color-scheme: {};",
            if self.dark { "dark" } else { "light" }
        );
        css.push_str("}\n");
        css
    }
}

#[cfg(test)]
pub fn sample(primary: &str) -> Look {
    Look {
        dark: true,
        colors: BTreeMap::from([
            ("primary".to_owned(), primary.to_owned()),
            ("surfaceContainerLow".to_owned(), "#1a1a18".to_owned()),
        ]),
        font: "Open Runde".to_owned(),
        text_scale: 1.0,
        square_corners: false,
        reduced_motion: false,
    }
}

#[cfg(test)]
mod tests {
    use super::sample;

    #[test]
    fn roles_become_kebab_case_properties() {
        let css = sample("#a0c4ff").stylesheet();
        assert!(css.contains("--kestrel-surface-container-low: #1a1a18;"));
        assert!(css.contains("--kestrel-primary: #a0c4ff;"));
        assert!(css.contains("color-scheme: dark;"));
    }
}
