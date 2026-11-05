use luft_i18n::t;
use luft_software::system::image::Deployments;
use luft_software::variant::{self, Variant};

use super::notice::notify;
use super::store::GraphicsSeen;
use crate::L10N;

pub const CHECK_GRAPHICS_ARGUMENT: &str = "--check-graphics";

async fn check() -> Result<(), String> {
    let cards = variant::nvidia_cards();
    if cards.is_empty() {
        return Ok(());
    }
    if GraphicsSeen::load().cards == cards {
        return Ok(());
    }
    let offer = Deployments::load().await?.variant_offer();
    GraphicsSeen { cards }.save()?;
    match offer {
        Some(Variant::Nvidia) => {
            notify(
                &t!(L10N, "desktop-updates-nvidia-summary"),
                &t!(L10N, "desktop-updates-nvidia-body"),
            )
            .await
        }
        _ => Ok(()),
    }
}

pub fn run() {
    if let Err(error) = luft_app::block_on(check()) {
        eprintln!("Looking at the graphics card failed: {error}");
        std::process::exit(1);
    }
}
