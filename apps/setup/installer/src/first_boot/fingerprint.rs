use zbus::proxy::SignalStream;
use zbus::{Connection, OwnedObjectPath, Proxy};

const SERVICE: &str = "net.reactivated.Fprint";
const MANAGER_PATH: &str = "/net/reactivated/Fprint/Manager";
const MANAGER: &str = "net.reactivated.Fprint.Manager";
const DEVICE: &str = "net.reactivated.Fprint.Device";

pub struct Enrolling {
    reader: Proxy<'static>,
    pub statuses: SignalStream<'static>,
}

impl Enrolling {
    pub async fn start(connection: &Connection, user: &str, finger: &str) -> zbus::Result<Self> {
        let manager = Proxy::new(connection, SERVICE, MANAGER_PATH, MANAGER).await?;
        let path: OwnedObjectPath = manager.call("GetDefaultDevice", &()).await?;
        let reader = Proxy::new_owned(connection.clone(), SERVICE, path, DEVICE).await?;
        let statuses = reader.receive_signal("EnrollStatus").await?;
        reader.call_method("Claim", &(user,)).await?;
        let enrolling = Self { reader, statuses };
        if let Err(error) = enrolling
            .reader
            .call_method("EnrollStart", &(finger,))
            .await
        {
            enrolling.release().await;
            return Err(error);
        }
        Ok(enrolling)
    }

    pub async fn stop(self) {
        let _ = self.reader.call_method("EnrollStop", &()).await;
        self.release().await;
    }

    async fn release(&self) {
        let _ = self.reader.call_method("Release", &()).await;
    }
}
