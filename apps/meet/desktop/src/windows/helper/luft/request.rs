use luft_meet::resize::{Request, VARIABLE, VENDOR};

use crate::windows::helper::system::firmware;

fn vendor() -> String {
    format!("{{{VENDOR}}}")
}

pub fn read() -> Option<Request> {
    let bytes = firmware::read_variable(&vendor(), VARIABLE).ok()??;
    Request::parse(&bytes)
        .inspect_err(|error| eprintln!("Luft's resize request isn't readable: {error}"))
        .ok()
}

pub fn write(request: &Request) -> Result<(), String> {
    firmware::write_variable(&vendor(), VARIABLE, &request.to_bytes())
}

pub fn clear() -> Result<(), String> {
    if firmware::read_variable(&vendor(), VARIABLE)?.is_none() {
        return Ok(());
    }
    firmware::write_variable(&vendor(), VARIABLE, &[])
}
