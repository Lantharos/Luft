use crate::bus;
use crate::changes::{self, Request};
use crate::cli::DeveloperAction;
use crate::failure::Outcome;
use crate::output::Output;
use crate::settings;

const SWITCH: &str = "security.developer-tools";

pub fn run(action: Option<DeveloperAction>, output: Output) -> Outcome {
    match action.unwrap_or(DeveloperAction::Status) {
        DeveloperAction::On => changes::apply(Request::from_pairs([(SWITCH, "on")])?, output),
        DeveloperAction::Off => changes::apply(Request::from_pairs([(SWITCH, "off")])?, output),
        DeveloperAction::Status => {
            let on = bus::block_on(bus::developer_tools())??;
            output.show(&serde_json::json!({ "developerTools": on }), || {
                format!("Developer tools is {}.", if on { "on" } else { "off" })
            })
        }
        DeveloperAction::List => settings::list(true, None, output),
        DeveloperAction::Set(set) => changes::set(&set.changes, true, output),
    }
}
