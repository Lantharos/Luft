use std::path::PathBuf;

use clap::{Args, Parser, Subcommand, ValueEnum};
use clap_complete::Shell;

const AFTER_HELP: &str = "\
Changes that need an administrator, or that Settings only makes after you confirm, are shown \
together in one review on the screen, and nothing changes until someone at the computer \
approves them there.

Exit codes: 0 done, 1 failed, 2 usage, 3 invalid setting or value, 4 declined in the review, \
5 not available right now, 6 only Settings can do this.";

#[derive(Parser)]
#[command(
    name = "luft",
    version,
    about = "Luft's settings, updates, logs and extensions, from the command line",
    after_help = AFTER_HELP,
    propagate_version = true
)]
pub struct Cli {
    /// Print answers as JSON, for scripts and agents
    #[arg(long, global = true)]
    pub json: bool,

    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Show the version of Luft, updates, Secure Boot, encryption and Developer tools
    Status,
    /// Look for, download and install updates, or go back to the previous version
    Update {
        #[command(subcommand)]
        action: Option<UpdateAction>,
    },
    /// Show the release channel, or move to stable or nightly versions
    Channel { channel: Option<Channel> },
    /// Turn Developer tools on or off, and change the switches only developers need
    Developer {
        #[command(subcommand)]
        action: Option<DeveloperAction>,
    },
    /// Read and change the settings Settings has, by the names it shows
    Settings {
        #[command(subcommand)]
        action: SettingsAction,
    },
    /// Change settings: luft set appearance.style=dark taskbar.size=large
    Set(SetArgs),
    /// Change the settings a JSON file lists, or standard input with -
    Apply {
        /// A file holding an object of setting and value, such as {"appearance.style": "dark"}
        file: PathBuf,
    },
    /// Put back what the last change through luft changed
    Undo,
    /// What was changed through luft, when and on whose behalf
    History {
        /// How many of the newest changes to show
        #[arg(long, default_value_t = 20)]
        limit: usize,
    },
    /// Show the logs of a part of Luft, such as kestrel, updater or keyring
    Logs(LogsArgs),
    /// Gather what helps with a bug report into one file, with personal details taken out
    Report {
        /// Where to save the report
        #[arg(long, short)]
        output: Option<PathBuf>,
    },
    /// Make, check, try and pack extensions
    Extension {
        #[command(subcommand)]
        action: ExtensionAction,
    },
    /// Offer luft to AI agents over the Model Context Protocol, on standard input and output
    Mcp,
    /// Print the completions for a shell
    Completions { shell: Shell },
}

#[derive(Subcommand)]
pub enum UpdateAction {
    /// Look for an update and say what it brings
    Check,
    /// Download the newest update, ready to install at the next restart
    Download,
    /// Restart to install the downloaded update, once you confirm the restart on the screen
    Install,
    /// Start the previous version at the next restart
    Rollback,
}

#[derive(Clone, Copy, ValueEnum)]
pub enum Channel {
    Stable,
    Nightly,
}

#[derive(Subcommand)]
pub enum DeveloperAction {
    /// Turn Developer tools on, after the review on the screen
    On,
    /// Turn Developer tools off, after the review on the screen
    Off,
    /// Show whether Developer tools is on
    Status,
    /// List the switches only developers need
    List,
    /// Change switches only developers need, while Developer tools is on
    Set(SetArgs),
}

#[derive(Subcommand)]
pub enum SettingsAction {
    /// List the settings, with their current values
    List {
        /// Only the settings on this page of Settings, such as appearance or taskbar
        #[arg(long)]
        page: Option<String>,
    },
    /// Show the current value of settings
    Get {
        #[arg(required = true)]
        settings: Vec<String>,
    },
    /// Change settings, as luft set does
    Set(SetArgs),
    /// Everything about settings: name, page, kind of value, what it takes and whether changing it needs a review
    Describe { settings: Vec<String> },
}

#[derive(Args)]
pub struct SetArgs {
    /// SETTING=VALUE, by the setting's id or its name in Settings
    #[arg(required = true, value_name = "SETTING=VALUE")]
    pub changes: Vec<String>,
}

#[derive(Args)]
pub struct LogsArgs {
    /// The part of Luft
    #[arg(value_enum)]
    pub part: crate::logs::Part,
    /// Only what was logged since then, such as "10 min ago" or "today"
    #[arg(long)]
    pub since: Option<String>,
    /// How many of the newest lines to show
    #[arg(long, short = 'n', default_value_t = 200)]
    pub lines: u32,
    /// Keep showing new lines as they come
    #[arg(long, short)]
    pub follow: bool,
}

#[derive(Subcommand)]
pub enum ExtensionAction {
    /// Make a new extension in a folder named after its id
    New {
        /// The extension's id, such as com.example.Weather
        id: String,
        /// The folder to make it in
        #[arg(long, default_value = ".")]
        directory: PathBuf,
    },
    /// Check an extension's manifest and files the way Luft reads them
    Check {
        #[arg(default_value = ".")]
        directory: PathBuf,
    },
    /// Load an extension again after changing it
    Reload { id: String },
    /// Show what an extension and Kestrel logged about it
    Logs {
        id: String,
        #[arg(long, short)]
        follow: bool,
    },
    /// Pack an extension the way the store takes it
    Pack {
        #[arg(default_value = ".")]
        directory: PathBuf,
        /// The folder to put the package in
        #[arg(long, default_value = ".")]
        output: PathBuf,
    },
    /// Try an extension in Luft: opens Settings, which asks you to approve it
    RunInLuft {
        #[arg(default_value = ".")]
        directory: PathBuf,
    },
}
