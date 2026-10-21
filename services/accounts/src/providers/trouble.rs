use luft_accounts::types::Provider;

pub const ADVANCED_DATA_PROTECTION: &str = "Your Apple Account uses Advanced Data Protection, so iCloud Drive only opens outside Apple devices when Access iCloud Data on the Web is on. On your iPhone, open Settings, tap your name, then iCloud, and turn on Access iCloud Data on the Web. Then sign in again and approve the request on your iPhone.";
const APPLE_CHECK: &str = "Apple asks you to confirm it's you about once a month. Sign in again to keep iCloud Drive on this computer.";
const APPLE_PASSWORD: &str = "That Apple Account email or password isn't right.";
const WRONG_PASSWORD: &str = "The server didn't accept that user name and password.";

#[derive(Debug, PartialEq, Eq)]
pub enum Trouble {
    SignInAgain(String),
    Offline,
    Other(String),
}

fn mentions(error: &str, needles: &[&str]) -> bool {
    let error = error.to_ascii_lowercase();
    needles.iter().any(|needle| error.contains(needle))
}

pub fn classify(provider: Provider, error: &str) -> Trouble {
    if mentions(
        error,
        &[
            "no such host",
            "connection refused",
            "network is unreachable",
            "i/o timeout",
            "tls handshake timeout",
            "context deadline exceeded",
            "connection reset",
            "no route to host",
            "name resolution",
            "failed to lookup address",
        ],
    ) {
        return Trouble::Offline;
    }
    let again = |reason: &str| Trouble::SignInAgain(reason.to_owned());
    match provider {
        Provider::Icloud
            if mentions(
                error,
                &[
                    "requestpcs",
                    "pcs cookies",
                    "missing pcs",
                    "advanced data protection",
                ],
            ) =>
        {
            again(ADVANCED_DATA_PROTECTION)
        }
        Provider::Icloud if mentions(error, &["incorrect username or password", "-20101"]) => {
            again(APPLE_PASSWORD)
        }
        Provider::Icloud
            if mentions(
                error,
                &[
                    "trust token",
                    "please reauth",
                    "reauthenticate",
                    "unauthorized",
                    "421",
                    "401",
                ],
            ) =>
        {
            again(APPLE_CHECK)
        }
        Provider::Onedrive | Provider::Dropbox
            if mentions(
                error,
                &[
                    "invalid_grant",
                    "aadsts",
                    "expired_access_token",
                    "invalid_access_token",
                    "couldn't fetch token",
                    "unauthorized",
                    "token expired",
                ],
            ) =>
        {
            Trouble::SignInAgain(format!("{} needs you to sign in again.", provider.name()))
        }
        Provider::Nextcloud | Provider::Webdav if mentions(error, &["401", "unauthorized"]) => {
            again(WRONG_PASSWORD)
        }
        _ => Trouble::Other(plain(error)),
    }
}

pub fn explain(provider: Provider, error: &str) -> String {
    match classify(provider, error) {
        Trouble::SignInAgain(reason) => reason,
        Trouble::Offline => format!(
            "{} can't be reached. Check your internet connection.",
            provider.name()
        ),
        Trouble::Other(message) => message,
    }
}

pub fn explain_sign_in(provider: Provider, error: &str) -> String {
    match classify(provider, error) {
        Trouble::SignInAgain(reason)
            if !matches!(provider, Provider::Onedrive | Provider::Dropbox) =>
        {
            reason
        }
        Trouble::Offline => format!(
            "{} can't be reached. Check your internet connection.",
            provider.name()
        ),
        _ => plain(error),
    }
}

fn plain(error: &str) -> String {
    let first = error.lines().next().unwrap_or(error).trim();
    let mut sentence: String = first.chars().take(200).collect();
    if let Some(first) = sentence.get_mut(..1) {
        first.make_ascii_uppercase();
    }
    sentence
}

#[cfg(test)]
mod tests {
    use luft_accounts::types::Provider;

    use super::{ADVANCED_DATA_PROTECTION, Trouble, classify};

    #[test]
    fn apple_problems_ask_for_the_right_thing() {
        let adp = classify(
            Provider::Icloud,
            "requestPCS(iclouddrive): timed out waiting for device approval after 5 minutes",
        );
        assert_eq!(
            adp,
            Trouble::SignInAgain(ADVANCED_DATA_PROTECTION.to_owned())
        );
        assert!(
            matches!(classify(Provider::Icloud, "trust token expired, please reauth"), Trouble::SignInAgain(reason) if reason.contains("once a month"))
        );
        assert!(
            matches!(classify(Provider::Icloud, "authSRPComplete: sign in failed: 401 : {\"code\" : \"-20101\"}"), Trouble::SignInAgain(reason) if reason.contains("isn't right"))
        );
    }

    #[test]
    fn network_failures_are_not_sign_in_problems() {
        assert_eq!(
            classify(
                Provider::Onedrive,
                "Get \"https://graph.microsoft.com\": dial tcp: lookup graph.microsoft.com: no such host"
            ),
            Trouble::Offline
        );
        assert!(matches!(
            classify(Provider::Dropbox, "couldn't fetch token: invalid_grant"),
            Trouble::SignInAgain(_)
        ));
    }
}
