mod drive;
mod live_system;
mod luft;
mod pack;
mod prepare;
mod refresh;
mod room;
mod stick;
mod system;
mod undo;
mod windows_space;

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
    pub locale: String,
}

pub fn requested() -> Option<Link> {
    let mut args = std::env::args().skip(1);
    (args.next()? == ARGUMENT).then_some(())?;
    Some(Link {
        pipe: args.next()?,
        parent: args.next()?.parse().ok()?,
        locale: args.next()?,
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
        Call::Prepare {
            luft,
            source,
            place,
        } => serde_json::to_value(prepare::prepare(context, luft, &source, &place)?),
        Call::Refresh { source } => serde_json::to_value(refresh::refresh(context, &source)?),
        Call::Pack { belongings } => serde_json::to_value(pack::pack(context, &belongings)?),
        Call::Restart {
            intent,
            windows,
            hints,
        } => serde_json::to_value(drive::state::restart(intent, windows, hints)?),
        Call::Tidy => serde_json::to_value(prepare::tidy()?),
        Call::FirmwareSettings => serde_json::to_value(system::firmware::restart_into_settings()?),
        Call::Undo => serde_json::to_value(undo::undo(context)?),
        Call::Luft => serde_json::to_value(luft::details()?),
        Call::LuftRange => serde_json::to_value(luft::range()?),
        Call::ResizeLuft { size } => serde_json::to_value(luft::resize(context, size)?),
        Call::CancelResize => serde_json::to_value(luft::cancel()?),
        Call::GiveWindows => serde_json::to_value(luft::give_windows()?),
        Call::StartLuft => serde_json::to_value(luft::start()?),
        Call::RemoveLuft => serde_json::to_value(luft::remove(context)?),
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
