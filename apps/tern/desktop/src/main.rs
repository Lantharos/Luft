const INSTALL_DESKTOP_ENTRY: &str = "--install-desktop-entry";

fn main() {
    if !std::env::args().any(|arg| arg == INSTALL_DESKTOP_ENTRY) {
        tern_lib::run_app();
    }
    match tern_lib::install_desktop_entry() {
        Ok(()) => println!("Tern is now registered as a terminal for this user."),
        Err(error) => {
            eprintln!("Could not register Tern as a terminal: {error}");
            std::process::exit(1);
        }
    }
}
