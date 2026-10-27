use std::time::{Duration, Instant};

use serde::Deserialize;
use serde_json::Value;
use specta::Type;

use super::job::Failed;
use super::{Events, PROGRESS};
use crate::live::cache;
use crate::live::source::Source;
use crate::protocol::{Call, Progress, Stage};
use crate::stick::damaged;
use crate::stick::fetch;

const PROGRESS_INTERVAL: Duration = Duration::from_millis(250);

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Asking {
    source: Source,
}

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

fn json(value: impl serde::Serialize) -> Result<Value, Failed> {
    serde_json::to_value(value).map_err(|error| Failed::from(error.to_string()))
}

pub fn offer(asking: Asking) -> Result<Value, Failed> {
    json(fetch::offer(&asking.source)?)
}

pub fn make(
    events: &Events,
    making: Making,
    call: impl Fn(&Events, Call) -> Result<Value, Failed>,
) -> Result<Value, Failed> {
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
    call(events, request).inspect_err(|failed| {
        if failed.detail() == damaged() && matches!(making.source, Source::Download { .. }) {
            let _ = cache::forget(&image.path);
        }
    })
}
