use sabine::{BridgeEvent, SabineWindow};

use crate::pty::{TerminalExited, TerminalOutput};

pub const OUTPUT: BridgeEvent<TerminalOutput> = BridgeEvent::new("terminal.output");
pub const EXITED: BridgeEvent<TerminalExited> = BridgeEvent::new("terminal.exited");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window.bridge_event(&OUTPUT).bridge_event(&EXITED)
}
