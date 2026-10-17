use super::backend;
use super::overview;

pub fn finished() {
    overview::reload();
    backend::current().scan();
}
