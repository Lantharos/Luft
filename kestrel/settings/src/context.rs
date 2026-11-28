use zbus::Connection;

use crate::modules::Board;
use crate::shared::settings::Settings;

#[derive(Clone)]
pub struct Context {
    pub session: Connection,
    pub system: Connection,
    pub settings: Settings,
    pub memory: Board,
}

impl Context {
    pub async fn connect() -> zbus::Result<Self> {
        Ok(Self {
            session: Connection::session().await?,
            system: Connection::system().await?,
            settings: Settings::start(),
            memory: Board::default(),
        })
    }
}
