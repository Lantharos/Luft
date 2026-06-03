#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args = std::env::args().collect::<Vec<_>>();
    if fenestra_cef::run_fenestra_host_from_args(&args) {
        return;
    }
    if args.iter().any(|arg| arg == "--portal-backend") {
        if let Err(error) = rover_lib::run_portal_backend() {
            eprintln!("rover portal backend failed: {}", error);
            std::process::exit(1);
        }
        return;
    }
    if args
        .iter()
        .any(|arg| arg == "--install-file-chooser-portal")
    {
        if let Err(error) = rover_lib::install_file_chooser_portal() {
            eprintln!("failed to install Rover file chooser portal: {}", error);
            std::process::exit(1);
        }
        println!("Rover file chooser portal installed for this user.");
        return;
    }
    if let Err(error) = rover_lib::run(&args) {
        eprintln!("failed to run Rover: {}", error);
        std::process::exit(1);
    }
}
