const STARTED_WITHOUT_KEY: &str = "luft.started=without-key";
const LIVE: &str = "rd.live.image";

fn command_line_has(wanted: &str) -> bool {
    std::fs::read_to_string("/proc/cmdline")
        .is_ok_and(|line| line.split_whitespace().any(|argument| argument == wanted))
}

pub fn without_key() -> bool {
    command_line_has(STARTED_WITHOUT_KEY)
}

pub fn from_stick() -> bool {
    command_line_has(LIVE)
}
