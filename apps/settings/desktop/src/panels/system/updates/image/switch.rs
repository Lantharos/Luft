use std::sync::Mutex;

use luft_software::system::image::{self, Deployments};
use luft_software::task::Task;
use luft_software::variant::Variant;
use serde::Serialize;

use super::super::state;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Offer {
    to: Variant,
    size: Option<u64>,
}

static SIZE: Mutex<Option<(Variant, u64)>> = Mutex::new(None);

fn known_size(variant: Variant) -> Option<u64> {
    SIZE.lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .filter(|(sized, _)| *sized == variant)
        .map(|(_, size)| size)
}

fn measure(deployments: Deployments, variant: Variant) {
    std::thread::spawn(move || {
        let size = match deployments.switch_size(variant) {
            Ok(size) => size,
            Err(error) => return eprintln!("Measuring the switch to {variant:?}: {error}"),
        };
        *SIZE.lock().unwrap_or_else(|poisoned| poisoned.into_inner()) = Some((variant, size));
        state::edit_overview(|overview| {
            if let Some(offer) = overview
                .system
                .offer
                .as_mut()
                .filter(|offer| offer.to == variant)
            {
                offer.size = Some(size);
            }
        });
    });
}

pub fn offer(deployments: Deployments, refreshed: bool) -> Option<Offer> {
    let to = deployments.variant_offer()?;
    let size = known_size(to).filter(|_| !refreshed);
    if size.is_none() {
        measure(deployments, to);
    }
    Some(Offer { to, size })
}

pub fn run(variant: Variant, task: Task) -> Result<(), String> {
    luft_app::block_on(image::switch(variant, known_size(variant), task))
}
