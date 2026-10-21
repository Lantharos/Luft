const COMMAND_LINE: &str = "/proc/cmdline";
const LIVE_ARGUMENT: &str = "rd.live.image";

pub fn running() -> bool {
    std::fs::read_to_string(COMMAND_LINE)
        .unwrap_or_default()
        .split_whitespace()
        .any(|argument| argument == LIVE_ARGUMENT)
}
