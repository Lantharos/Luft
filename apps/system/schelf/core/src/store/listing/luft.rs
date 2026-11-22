use std::sync::OnceLock;

use luft_dbus::runtime::block_on;
use luft_software::system::image::{Deployments, Paired};
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

/// A version of Luft on this computer, whose own apps go with it.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Luft {
    Running,
    Staged,
}

fn versions() -> &'static (Option<Paired>, Option<Paired>) {
    static PAIRED: OnceLock<(Option<Paired>, Option<Paired>)> = OnceLock::new();
    PAIRED.get_or_init(|| match block_on(Deployments::load()) {
        Ok(deployments) => {
            let (running, staged) = deployments.paired();
            (Some(running), staged)
        }
        Err(_) => (None, None),
    })
}

impl Luft {
    fn paired(self) -> Option<&'static Paired> {
        let (running, staged) = versions();
        match self {
            Self::Running => running.as_ref(),
            Self::Staged => staged.as_ref(),
        }
    }

    /// The image of this version, which says which apps it came out with.
    pub fn digest(self) -> Option<&'static str> {
        self.paired()?.digest.as_deref()
    }

    /// The release of Luft's own `id` this version came out with, the newest
    /// it takes, when it names one.
    pub fn release_of(self, id: &str) -> Option<&'static str> {
        self.paired()?
            .releases
            .iter()
            .find(|(paired, _)| paired.eq_ignore_ascii_case(id))
            .map(|(_, version)| version.as_str())
    }
}
