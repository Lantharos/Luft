use super::{Installation, query};

pub const FLATHUB: &str = "flathub";
const FLATHUB_REPO: &str = "https://dl.flathub.org/repo/flathub.flatpakrepo";

pub fn ensure_flathub(installation: Installation) -> Result<(), String> {
    query(
        installation,
        &["remote-add", "--if-not-exists", FLATHUB, FLATHUB_REPO],
    )
    .map(|_| ())
}
