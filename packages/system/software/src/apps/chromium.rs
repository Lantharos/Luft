pub const RESOURCES: &str = "chrome_100_percent.pak";
pub const ENABLE_FEATURES: &str = "--enable-features=";
pub const FINGER_SCROLLING: &str = "WaylandUnscaledTouchpadScrolling:scroll_scaling_factor/1";
const FINGER_SCROLLING_FEATURE: &str = "WaylandUnscaledTouchpadScrolling";
const LOAD_EXTENSION: &str = "--load-extension=";
/// Middle-click autoscroll, which Chromium has on Windows only.
const AUTOSCROLL_EXTENSION: &str = "/usr/share/luft/chromium/autoscroll";

pub fn mentions_finger_scrolling(text: &str) -> bool {
    text.contains(FINGER_SCROLLING_FEATURE)
}

pub fn enable_finger_scrolling(arguments: &mut Vec<String>) {
    match arguments
        .iter_mut()
        .rfind(|argument| argument.starts_with(ENABLE_FEATURES))
    {
        Some(features) => {
            features.push(',');
            features.push_str(FINGER_SCROLLING);
        }
        None => arguments.insert(0, format!("{ENABLE_FEATURES}{FINGER_SCROLLING}")),
    }
}

pub fn load_autoscroll(arguments: &mut Vec<String>) {
    match arguments
        .iter_mut()
        .rfind(|argument| argument.starts_with(LOAD_EXTENSION))
    {
        Some(extensions) if !extensions.contains(AUTOSCROLL_EXTENSION) => {
            extensions.push(',');
            extensions.push_str(AUTOSCROLL_EXTENSION);
        }
        Some(_) => {}
        None => arguments.insert(0, format!("{LOAD_EXTENSION}{AUTOSCROLL_EXTENSION}")),
    }
}
