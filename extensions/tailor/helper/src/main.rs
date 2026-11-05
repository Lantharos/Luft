mod files;
mod home;
mod look;
mod serve;
#[path = "../../themes/mod.rs"]
mod themes;
mod watch;

use std::io;

use home::Home;

fn main() -> io::Result<()> {
    let home = Home::current();
    match std::env::args().nth(1).as_deref() {
        Some("restore") => serve::restore(&home),
        _ => serve::serve(&home),
    }
}
