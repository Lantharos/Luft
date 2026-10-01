use std::marker::PhantomData;

use futures_util::StreamExt;
use zbus::fdo::{PropertiesChangedStream, PropertiesProxy};
use zbus::names::InterfaceName;
use zbus::proxy::{CacheProperties, OwnerChangedStream};
use zbus::zvariant::OwnedValue;
use zbus::{Connection, Proxy};

pub struct Endpoint {
    pub service: &'static str,
    pub path: &'static str,
    pub interface: &'static str,
}

pub struct RemoteProperty<T> {
    properties: PropertiesProxy<'static>,
    interface: InterfaceName<'static>,
    name: &'static str,
    owner: OwnerChangedStream<'static>,
    changes: PropertiesChangedStream,
    value: PhantomData<T>,
}

impl<T: TryFrom<OwnedValue>> RemoteProperty<T> {
    pub async fn new(
        connection: &Connection,
        endpoint: &Endpoint,
        name: &'static str,
    ) -> zbus::Result<Self> {
        let Endpoint {
            service,
            path,
            interface,
        } = *endpoint;
        let properties = PropertiesProxy::builder(connection)
            .destination(service)?
            .path(path)?
            .cache_properties(CacheProperties::No)
            .build()
            .await?;
        let owner = Proxy::new(connection, service, path, interface)
            .await?
            .receive_owner_changed()
            .await?;
        let changes = properties.receive_properties_changed().await?;
        Ok(Self {
            properties,
            interface: InterfaceName::from_static_str(interface)?,
            name,
            owner,
            changes,
            value: PhantomData,
        })
    }

    pub async fn get(&self) -> Option<T> {
        let value = self
            .properties
            .get(self.interface.as_ref(), self.name)
            .await
            .ok()?;
        T::try_from(value).ok()
    }

    pub async fn changed(&mut self) -> Option<T> {
        loop {
            tokio::select! {
                Some(owner) = self.owner.next() => {
                    return match owner {
                        Some(_) => self.get().await,
                        None => None,
                    };
                }
                Some(signal) = self.changes.next() => {
                    let Ok(args) = signal.args() else { continue };
                    if args.interface_name != self.interface {
                        continue;
                    }
                    if let Some(value) = args.changed_properties.get(self.name)
                        && let Ok(value) = value.try_to_owned()
                    {
                        return T::try_from(value).ok();
                    }
                    if args.invalidated_properties.contains(&self.name) {
                        return self.get().await;
                    }
                }
                else => return std::future::pending().await,
            }
        }
    }
}
