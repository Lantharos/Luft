//! The store's publisher API for programs other than the command, such as the
//! Schelf app: the dashboard as the signed-in person, and approvals in the browser.

pub use crate::api::STORE_ORIGIN;
pub use crate::api::approvals::{approval_of, cancel_approval, request_approval};
pub use crate::api::dashboard::{Dashboard, Json};
pub use crate::error::Error;
