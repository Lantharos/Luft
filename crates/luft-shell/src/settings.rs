use luft_config::LuftConfig;
use luft_ipc::{IpcRequest, IpcResponse, OutputSummary, SettingsConfirmation, send_request};
use sabine::{BridgeError, RuntimeConfig, RuntimeMode, SabineWindow};
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReadSettings {}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SaveSettings {
    original: LuftConfig,
    config: LuftConfig,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ConfirmSettings {
    id: u64,
}

#[derive(Serialize)]
struct SettingsResult {
    config: Box<LuftConfig>,
    confirmation: Option<SettingsConfirmation>,
    outputs: Vec<OutputSummary>,
    outputs_error: Option<String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct OpenTool {
    tool: SettingsTool,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
enum SettingsTool {
    Network,
    Audio,
    Bluetooth,
}

pub fn run(page: &str) -> Result<(), Box<dyn Error>> {
    let page = match page {
        "display" | "input" | "appearance" | "power" | "apps" | "network" | "audio" => page,
        _ => "appearance",
    };
    let entry = crate::web::resources::entrypoint()?;
    let window = SabineWindow::new()
        .app_id("net.aveid.luft.settings")
        .title("Luft Settings")
        .size(920, 700)
        .system_chrome()
        .opaque()
        .entry(format!("{}?surface=settings&page={page}", entry.display()))
        .runtime(RuntimeConfig {
            mode: RuntimeMode::SharedPreferred,
            allow_user_install: cfg!(debug_assertions),
            ..RuntimeConfig::default()
        })
        .bridge_typed("settings.read", |_: ReadSettings| {
            settings_request(IpcRequest::GetSettings)
        })
        .bridge_typed("settings.save", |request: SaveSettings| {
            settings_request(IpcRequest::ApplySettings {
                original: Box::new(request.original),
                config: Box::new(request.config),
            })
        })
        .bridge_typed("settings.confirm", |request: ConfirmSettings| {
            settings_request(IpcRequest::ConfirmSettings { id: request.id })
        })
        .bridge_typed("settings.revert", |request: ConfirmSettings| {
            settings_request(IpcRequest::RevertSettings { id: request.id })
        })
        .bridge_typed("settings.open-tool", |request: OpenTool| {
            let command = match request.tool {
                SettingsTool::Network => "nm-connection-editor",
                SettingsTool::Audio => "pavucontrol",
                SettingsTool::Bluetooth => "blueman-manager",
            };
            let mut child =
                crate::apps::spawn_command(command, std::env::var("DISPLAY").ok().as_deref())
                    .map_err(|error| {
                        BridgeError::new(format!("Could not open {command}: {error}"))
                    })?;
            std::thread::spawn(move || {
                let _ = child.wait();
            });
            Ok(())
        });
    let status = window.launch()?.wait()?;
    if !status.success() {
        return Err(format!("Luft Settings exited with {status}").into());
    }
    Ok(())
}

fn settings_request(request: IpcRequest) -> Result<SettingsResult, BridgeError> {
    match send_request(&request).map_err(bridge_error)? {
        IpcResponse::Settings {
            config,
            confirmation,
        } => {
            let (outputs, outputs_error) = match connected_outputs() {
                Ok(outputs) => (outputs, None),
                Err(error) => (Vec::new(), Some(error.to_string())),
            };
            Ok(SettingsResult {
                config,
                confirmation,
                outputs,
                outputs_error,
            })
        }
        IpcResponse::Error { message } => Err(BridgeError::new(message)),
        _ => Err(BridgeError::new("Unexpected settings response")),
    }
}

fn connected_outputs() -> Result<Vec<OutputSummary>, Box<dyn Error>> {
    match send_request(&IpcRequest::ListOutputs)? {
        IpcResponse::Outputs { outputs } => Ok(outputs),
        IpcResponse::Error { message } => Err(message.into()),
        _ => Err("Could not read the connected displays".into()),
    }
}

fn bridge_error(error: impl std::fmt::Display) -> BridgeError {
    BridgeError::new(error.to_string())
}
