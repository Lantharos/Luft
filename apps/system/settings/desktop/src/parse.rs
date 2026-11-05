use serde::de::DeserializeOwned;
use serde::de::value::{Error, StringDeserializer};

pub fn parse<T: DeserializeOwned>(name: String) -> Option<T> {
    T::deserialize(StringDeserializer::<Error>::new(name)).ok()
}
