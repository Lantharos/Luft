mod drive;
mod live_system;
mod pack;
mod prepare;
mod refresh;
mod system;
mod undo;

use std::fs::{File, OpenOptions};
use std::os::windows::io::AsRawHandle;

use serde_json::Value;
use windows::Win32::Foundation::HANDLE;
use windows::Win32::System::Pipes::GetNamedPipeServerProcessId;

use crate::protocol::Call;
pub use crate::serving::Context;

pub const ARGUMENT: &str = "--meet-helper";

pub struct Link {
    pipe: String,
    parent: u32,
}

pub fn requested() -> Option<Link> {
    let mut args = std::env::args().skip(1);
    (args.next()? == ARGUMENT).then_some(())?;
    Some(Link {
        pipe: args.next()?,
        parent: args.next()?.parse().ok()?,
    })
}

fn server_is(pipe: &File, parent: u32) -> bool {
    let mut server = 0u32;
    unsafe { GetNamedPipeServerProcessId(HANDLE(pipe.as_raw_handle()), &mut server) }.is_ok()
        && server == parent
}

fn handle(context: &Context, call: Call) -> Result<Value, String> {
    let value = match call {
        Call::Check { source } => serde_json::to_value(prepare::check(&source)?),
        Call::Prepare { luft, source } => {
            serde_json::to_value(prepare::prepare(context, luft, &source)?)
        }
        Call::Refresh { source } => serde_json::to_value(refresh::refresh(context, &source)?),
        Call::Pack { belongings } => serde_json::to_value(pack::pack(context, &belongings)?),
        Call::Restart { intent, windows } => {
            serde_json::to_value(drive::state::restart(intent, windows)?)
        }
        Call::Tidy => serde_json::to_value(prepare::tidy()?),
        Call::FirmwareSettings => serde_json::to_value(system::firmware::restart_into_settings()?),
        Call::Undo => serde_json::to_value(undo::undo(context)?),
    };
    value.map_err(|error| error.to_string())
}

pub fn serve(link: Link) {
    let calls = OpenOptions::new()
        .read(true)
        .open(format!("{}-calls", link.pipe));
    let replies = OpenOptions::new()
        .write(true)
        .open(format!("{}-replies", link.pipe));
    let (Ok(calls), Ok(replies)) = (calls, replies) else {
        return;
    };
    if !server_is(&calls, link.parent) || !server_is(&replies, link.parent) {
        return;
    }
    let context = Context::new(replies);
    crate::serving::serve(calls, &context, handle);
}
