use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use ashpd::{
    MaybeAppID, PortalError, WindowIdentifierType,
    backend::{
        Result,
        request::RequestImpl,
        screencast::{ScreencastImpl, SelectSourcesResponse},
        session::{CreateSessionResponse, SessionImpl},
    },
    desktop::{
        CreateSessionOptions, HandleToken,
        screencast::{
            CursorMode, SelectSourcesOptions, SourceType, StartCastOptions, StreamBuilder, Streams,
            StreamsBuilder,
        },
    },
};
use enumflags2::BitFlags;

use crate::pipewire_cast::{CastHandle, start};

#[derive(Clone, Default)]
pub struct ScreencastPortal {
    sessions: Arc<Mutex<HashMap<HandleToken, CastSession>>>,
}

struct CastSession {
    cursor_mode: CursorMode,
    handle: Option<CastHandle>,
}

#[async_trait::async_trait]
impl RequestImpl for ScreencastPortal {
    async fn close(&self, _: HandleToken) {}
}

#[async_trait::async_trait]
impl SessionImpl for ScreencastPortal {
    async fn session_closed(&self, session_token: HandleToken) -> Result<()> {
        self.sessions.lock().unwrap().remove(&session_token);
        Ok(())
    }
}

#[async_trait::async_trait]
impl ScreencastImpl for ScreencastPortal {
    fn available_source_types(&self) -> BitFlags<SourceType> {
        SourceType::Monitor.into()
    }

    fn available_cursor_mode(&self) -> BitFlags<CursorMode> {
        CursorMode::Hidden | CursorMode::Embedded
    }

    async fn create_session(
        &self,
        _: HandleToken,
        session_token: HandleToken,
        _: Option<MaybeAppID>,
        _: CreateSessionOptions,
    ) -> Result<CreateSessionResponse> {
        self.sessions.lock().unwrap().insert(
            session_token.clone(),
            CastSession {
                cursor_mode: CursorMode::Hidden,
                handle: None,
            },
        );
        Ok(CreateSessionResponse::new(session_token))
    }

    async fn select_sources(
        &self,
        session_token: HandleToken,
        _: Option<MaybeAppID>,
        options: SelectSourcesOptions,
    ) -> Result<SelectSourcesResponse> {
        if options.is_multiple().unwrap_or(false) {
            return Err(PortalError::InvalidArgument(
                "Luft currently provides one monitor per screencast session".into(),
            ));
        }
        if options
            .sources()
            .is_some_and(|sources| sources != BitFlags::from(SourceType::Monitor))
        {
            return Err(PortalError::InvalidArgument(
                "Luft currently supports monitor screencasts".into(),
            ));
        }
        let cursor_mode = options.cursor_mode().unwrap_or(CursorMode::Hidden);
        if cursor_mode == CursorMode::Metadata {
            return Err(PortalError::InvalidArgument(
                "cursor metadata mode is not advertised".into(),
            ));
        }
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get_mut(&session_token)
            .ok_or_else(|| PortalError::NotFound("unknown screencast session".into()))?;
        session.cursor_mode = cursor_mode;
        Ok(SelectSourcesResponse::default())
    }

    async fn start_cast(
        &self,
        session_token: HandleToken,
        _: Option<MaybeAppID>,
        _: Option<WindowIdentifierType>,
        _: StartCastOptions,
    ) -> Result<Streams> {
        let cursor_mode = self
            .sessions
            .lock()
            .unwrap()
            .get(&session_token)
            .ok_or_else(|| PortalError::NotFound("unknown screencast session".into()))?
            .cursor_mode;
        let cast = tokio::task::spawn_blocking(move || start(cursor_mode == CursorMode::Embedded))
            .await
            .map_err(|error| PortalError::Failed(error.to_string()))?
            .map_err(|error| PortalError::Failed(error.to_string()))?;
        let stream = StreamBuilder::new(cast.node_id)
            .size(Some((cast.width as i32, cast.height as i32)))
            .position(Some((0, 0)))
            .source_type(Some(SourceType::Monitor))
            .build();
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get_mut(&session_token)
            .ok_or_else(|| PortalError::Cancelled("screencast session closed".into()))?;
        session.handle = Some(cast.handle);
        Ok(StreamsBuilder::new(vec![stream]).build())
    }
}
