use zbus::Connection;

use super::failed;
use super::properties::Properties;

const DESTINATION: &str = "com.lantharos.Sleep1";
const PATH: &str = "/com/lantharos/Sleep1";

pub async fn power_off_after(connection: &Connection) -> Option<u32> {
    Properties::read(connection, DESTINATION, PATH, DESTINATION)
        .await
        .ok()?
        .get::<u32>("PowerOffAfter")
}

pub async fn set_power_off_after(connection: &Connection, seconds: u32) -> Result<(), String> {
    connection
        .call_method(
            Some(DESTINATION),
            PATH,
            Some(DESTINATION),
            "SetPowerOffAfter",
            &seconds,
        )
        .await
        .map(|_| ())
        .map_err(failed)
}
