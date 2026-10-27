use std::time::{Duration, Instant};

use serde::Deserialize;
use specta::Type;

use super::job::Failed;
use super::{Events, PROGRESS, platform};
use crate::live::cache;
use crate::live::source::Source;
use crate::protocol::{Call, Progress, Sourced, Stage};
use crate::stick::fetch::{self, Offer};
use crate::stick::{Finished, damaged};

const PROGRESS_INTERVAL: Duration = Duration::from_millis(250);

#[derive(Deserialize, Type)]
#[serde(tag = "kind", rename_all = "camelCase")]
enum Way {
    Erase,
    Ventoy { replace: bool },
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Making {
    source: Source,
    stick: String,
    way: Way,
}

pub fn offer(sourced: Sourced) -> Result<Offer, Failed> {
    Ok(fetch::offer(&sourced.source)?)
}

pub fn make(events: &Events, making: Making) -> Result<Finished, Failed> {
    let mut last: Option<Instant> = None;
    let image = fetch::fetch(&making.source, |done, total| {
        if last.is_none_or(|at| at.elapsed() >= PROGRESS_INTERVAL) || done == total {
            last = Some(Instant::now());
            events.emit(
                PROGRESS,
                Progress {
                    stage: Stage::Downloading,
                    done,
                    total,
                },
            );
        }
    })?;
    let request = match making.way {
        Way::Erase => Call::Flash {
            stick: making.stick,
            image: image.clone(),
        },
        Way::Ventoy { replace } => Call::AddToVentoy {
            stick: making.stick,
            image: image.clone(),
            replace,
        },
    };
    platform::call(events, request).inspect_err(|failed| {
        if failed.detail() == damaged() && matches!(making.source, Source::Download { .. }) {
            let _ = cache::forget(&image.path);
        }
    })
}
