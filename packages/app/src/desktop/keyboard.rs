use sabine::BridgeEvent;
use zbus::{OwnedVariant, Proxy};

/// Whether there's a keyboard to type on: the computer's own while it isn't
/// folded into a tablet, or one plugged in or paired.
pub const KEYBOARD_CHANGED: BridgeEvent<bool> = BridgeEvent::new("appearance.keyboard");

const KESTREL: &str = "com.lantharos.kestrel";
const KEYBOARD: &str = "keyboard-attached";

pub async fn read(proxy: &Proxy<'_>) -> bool {
    super::read(proxy, KESTREL, KEYBOARD)
        .await
        .and_then(|value: OwnedVariant| bool::try_from(value).ok())
        .unwrap_or(true)
}

pub async fn current() -> bool {
    match super::proxy().await {
        Ok(proxy) => read(&proxy).await,
        Err(_) => true,
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    namespace == KESTREL && key == KEYBOARD
}
