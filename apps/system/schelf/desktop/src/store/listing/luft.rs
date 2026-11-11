use std::sync::OnceLock;

use luft_app::block_on;
use luft_software::system::image::Deployments;
use luft_software::variant::Version;

/// The version of Luft this computer runs, such as `1.2-nightly.21`, as its
/// image says; none when it can't be found.
pub fn running() -> Option<&'static str> {
    static RUNNING: OnceLock<Option<String>> = OnceLock::new();
    RUNNING
        .get_or_init(|| block_on(Deployments::load()).ok()?.status().current.version)
        .as_deref()
}

/// Whether this Luft is `minimum` or newer, which a Luft whose version can't
/// be found never is.
pub fn reaches(minimum: &str) -> bool {
    matches!(
        (running().and_then(Version::parse), Version::parse(minimum)),
        (Some(running), Some(minimum)) if running >= minimum
    )
}
