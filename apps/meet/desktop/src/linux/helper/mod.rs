mod disks;
mod efi;
mod esp;
mod live;
mod machine;
mod place;
mod prepare;
mod restart;
mod stick;
mod undo;

use std::io;

use serde_json::Value;

use crate::protocol::Call;
use crate::serving::{self, Context};

pub const ARGUMENT: &str = "--meet-helper";

pub fn requested() -> bool {
    std::env::args().nth(1).as_deref() == Some(ARGUMENT)
}

fn handle(context: &Context, call: Call) -> Result<Value, String> {
    let value = match call {
        Call::Check { source } => serde_json::to_value(prepare::check(&source)?),
        Call::Prepare { source, .. } => serde_json::to_value(prepare::prepare(context, &source)?),
        Call::Refresh { source } => serde_json::to_value(prepare::refresh(context, &source)?),
        Call::Restart { intent, .. } => serde_json::to_value(restart::restart(intent)?),
        Call::FirmwareSettings => serde_json::to_value(restart::firmware_settings()?),
        Call::Undo => serde_json::to_value(undo::undo(context)?),
        Call::Sticks { iso } => serde_json::to_value(stick::sticks(iso.as_deref())?),
        Call::Flash { stick, image } => {
            serde_json::to_value(stick::flash(context, &stick, &image)?)
        }
        Call::VentoyRoom { stick, needed } => serde_json::to_value(stick::room(&stick, needed)?),
        Call::AddToVentoy {
            stick,
            image,
            replace,
        } => serde_json::to_value(stick::add_to_ventoy(context, &stick, &image, replace)?),
        Call::Pack { .. } | Call::Tidy => {
            return Err("Meet Luft doesn't do that on Linux.".to_owned());
        }
    };
    value.map_err(|error| error.to_string())
}

const READABLE_BY_EVERYONE: libc::mode_t = 0o022;

pub fn serve() {
    unsafe { libc::umask(READABLE_BY_EVERYONE) };
    let context = Context::new(io::stdout());
    serving::serve(io::stdin(), &context, handle);
}
