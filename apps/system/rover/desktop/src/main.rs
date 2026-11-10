struct Command {
    flag: &'static str,
    run: fn() -> Result<(), String>,
    success: Option<&'static str>,
    failure: &'static str,
}

const PORTAL_BACKEND: &str = "--portal-backend";

const COMMANDS: [Command; 3] = [
    Command {
        flag: "--install-file-chooser-portal",
        run: rover_lib::install_file_chooser_portal,
        success: Some("Rover file chooser portal installed for this user."),
        failure: "Could not install the Rover file chooser portal",
    },
    Command {
        flag: "--file-manager-bus",
        run: rover_lib::run_file_manager_bus,
        success: None,
        failure: "Rover file manager bus failed",
    },
    Command {
        flag: "--install-file-manager-bus",
        run: rover_lib::install_file_manager_bus,
        success: Some("Rover file manager bus installed for this user."),
        failure: "Could not install the Rover file manager bus",
    },
];

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if sabine::dispatch_host_mode_from_args(&args) {
        return;
    }
    if args.iter().any(|arg| arg == PORTAL_BACKEND) {
        rover_lib::run_portal_backend();
    }
    let Some(command) = COMMANDS
        .iter()
        .find(|command| args.iter().any(|arg| arg == command.flag))
    else {
        rover_lib::run_app();
    };
    match (command.run)() {
        Ok(()) => {
            if let Some(success) = command.success {
                println!("{success}");
            }
        }
        Err(error) => {
            eprintln!("{}: {error}", command.failure);
            std::process::exit(1);
        }
    }
}
