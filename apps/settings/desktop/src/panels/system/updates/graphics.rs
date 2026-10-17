use luft_software::image::Deployments;
use luft_software::system::System;
use luft_software::variant::{self, Variant};

use super::background::notify;
use super::store::GraphicsSeen;

pub const CHECK_GRAPHICS_ARGUMENT: &str = "--check-graphics";

const SUMMARY: &str = "Get the most out of your NVIDIA graphics";
const BODY: &str = "Switch to NVIDIA's own driver in Settings.";

async fn check() -> Result<(), String> {
    let cards = variant::nvidia_cards();
    if cards.is_empty() || System::current() != System::Image {
        return Ok(());
    }
    if GraphicsSeen::load().cards == cards {
        return Ok(());
    }
    let offer = Deployments::load().await?.variant_offer();
    GraphicsSeen { cards }.save()?;
    match offer {
        Some(Variant::Nvidia) => notify(SUMMARY, BODY).await,
        _ => Ok(()),
    }
}

pub fn run() {
    if let Err(error) = luft_app::block_on(check()) {
        eprintln!("Looking at the graphics card failed: {error}");
        std::process::exit(1);
    }
}
