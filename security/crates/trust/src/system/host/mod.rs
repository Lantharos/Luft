pub mod beneath;
pub mod blocks;
pub mod command;
pub mod journal;
pub mod uuid;

pub fn wait<F: Future>(future: F) -> F::Output {
    tokio::runtime::Handle::current().block_on(future)
}
