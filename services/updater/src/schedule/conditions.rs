use zbus::Connection;

const NETWORK_MANAGER: &str = "org.freedesktop.NetworkManager";
const NETWORK_MANAGER_PATH: &str = "/org/freedesktop/NetworkManager";
const METERED: [u32; 2] = [1, 3];

/// Whether NetworkManager says the connection in use is metered, or guesses so.
pub async fn metered(connection: &Connection) -> bool {
    let proxy = zbus::Proxy::new(
        connection,
        NETWORK_MANAGER,
        NETWORK_MANAGER_PATH,
        NETWORK_MANAGER,
    )
    .await;
    match proxy {
        Ok(proxy) => proxy
            .get_property::<u32>("Metered")
            .await
            .is_ok_and(|metered| METERED.contains(&metered)),
        Err(_) => false,
    }
}
