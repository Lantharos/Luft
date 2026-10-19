//! Hands the activation token of the person's action to the app it opens,
//! so that app's window comes to the front.

#[cfg(feature = "launch")]
mod context;

use std::process::Command;

use serde::Deserialize;

#[cfg(feature = "launch")]
pub use context::context;

pub const TOKEN_VARIABLES: [&str; 2] = ["XDG_ACTIVATION_TOKEN", "DESKTOP_STARTUP_ID"];

const WEB_SCHEMES: [&str; 3] = ["http", "https", "mailto"];

/// The parameters of a command that only hands the page's token on.
#[derive(Deserialize)]
pub struct Token {
    pub token: Option<String>,
}

/// Gives a launched program the token, or none, so it never reuses the one
/// this app was launched with.
pub fn pass_token(command: &mut Command, token: Option<&str>) {
    for variable in TOKEN_VARIABLES {
        match token {
            Some(token) => command.env(variable, token),
            None => command.env_remove(variable),
        };
    }
}

/// Whether `uri` is a web or mail link, the only kinds a page may ask to
/// open in another app.
pub fn is_web_link(uri: &str) -> bool {
    uri.split_once(':').is_some_and(|(scheme, rest)| {
        !rest.is_empty()
            && WEB_SCHEMES
                .iter()
                .any(|web| scheme.eq_ignore_ascii_case(web))
    })
}

/// Opens a web or mail link from a page in the person's default app for it.
#[cfg(feature = "launch")]
pub fn open_web_link(uri: &str, token: Option<&str>) -> Result<(), String> {
    if !is_web_link(uri) {
        return Err("Only web and mail links open in other apps".to_owned());
    }
    gio::AppInfo::launch_default_for_uri(uri, Some(&context(token)))
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::is_web_link;

    #[test]
    fn web_and_mail_links_open() {
        assert!(is_web_link("https://luft.computer/"));
        assert!(is_web_link("HTTP://example.com"));
        assert!(is_web_link("mailto:mara@example.com"));
    }

    #[test]
    fn other_schemes_stay_closed() {
        for uri in [
            "file:///etc/passwd",
            "javascript:alert(1)",
            "smb://server/share",
            "ghelp:gnome-terminal",
            "kestrel-signin:?url=http://example.com",
            " https://example.com",
            "https:",
            "/home/mara/notes.md",
        ] {
            assert!(!is_web_link(uri), "{uri}");
        }
    }
}
