use std::collections::BTreeSet;
use std::sync::Arc;

use super::collection::Collection;
use super::item::Item;
use super::{Target, alias_path, collection_path, item_path};
use crate::daemon::Daemon;
use luft_keyring_vault::LOGIN;

pub async fn sync(daemon: &Arc<Daemon>) {
    let wanted: BTreeSet<Target> = {
        let keyring = daemon.keyring.lock().await;
        match keyring.view() {
            Some(view) => view
                .collections
                .iter()
                .flat_map(|collection| {
                    std::iter::once(Target::Collection(collection.id.clone())).chain(
                        collection
                            .items
                            .iter()
                            .map(|item| Target::Item(collection.id.clone(), item.id)),
                    )
                })
                .chain(
                    view.aliases
                        .keys()
                        .map(|alias| Target::Alias(alias.clone())),
                )
                .collect(),
            None => [
                Target::Collection(LOGIN.into()),
                Target::Alias(luft_keyring_vault::DEFAULT_ALIAS.into()),
            ]
            .into(),
        }
    };
    let mut objects = daemon.objects.lock().await;
    let server = daemon.connection.object_server();
    for gone in objects.difference(&wanted) {
        let _ = match gone {
            Target::Collection(id) => server.remove::<Collection, _>(collection_path(id)).await,
            Target::Alias(alias) => server.remove::<Collection, _>(alias_path(alias)).await,
            Target::Item(collection, item) => {
                server.remove::<Item, _>(item_path(collection, *item)).await
            }
        };
    }
    for new in wanted.difference(&objects) {
        let daemon = daemon.clone();
        let _ = match new {
            Target::Collection(id) => {
                server
                    .at(
                        collection_path(id),
                        Collection {
                            daemon,
                            target: new.clone(),
                        },
                    )
                    .await
            }
            Target::Alias(alias) => {
                server
                    .at(
                        alias_path(alias),
                        Collection {
                            daemon,
                            target: new.clone(),
                        },
                    )
                    .await
            }
            Target::Item(collection, item) => {
                server
                    .at(
                        item_path(collection, *item),
                        Item {
                            daemon,
                            collection: collection.clone(),
                            id: *item,
                        },
                    )
                    .await
            }
        };
    }
    *objects = wanted;
}
