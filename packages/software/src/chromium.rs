pub const RESOURCES: &str = "chrome_100_percent.pak";
pub const ENABLE_FEATURES: &str = "--enable-features=";
pub const FINGER_SCROLLING: &str = "WaylandUnscaledTouchpadScrolling:scroll_scaling_factor/1";
const FINGER_SCROLLING_FEATURE: &str = "WaylandUnscaledTouchpadScrolling";

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
