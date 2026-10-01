use zbus::Connection;
use zbus::zvariant::OwnedObjectPath;

const FPRINTD: &str = "net.reactivated.Fprint";

pub async fn enrolled() -> bool {
    let Ok(system) = Connection::system().await else {
        return false;
    };
    let devices = system
        .call_method(
            Some(FPRINTD),
            "/net/reactivated/Fprint/Manager",
            Some("net.reactivated.Fprint.Manager"),
            "GetDevices",
            &(),
        )
        .await
        .and_then(|reply| reply.body().deserialize::<Vec<OwnedObjectPath>>());
    for device in devices.unwrap_or_default() {
        let fingers = system
            .call_method(
                Some(FPRINTD),
                device.as_str(),
                Some("net.reactivated.Fprint.Device"),
                "ListEnrolledFingers",
                &("",),
            )
            .await
            .and_then(|reply| reply.body().deserialize::<Vec<String>>());
        if fingers.is_ok_and(|fingers| !fingers.is_empty()) {
            return true;
        }
    }
    false
}
