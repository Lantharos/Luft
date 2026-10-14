mod image;

pub use image::{Entry, Image};
pub use regf_rs::RegValue as Value;

pub struct HiveBuilder(regf_rs::Hive);

impl Default for HiveBuilder {
    fn default() -> Self {
        Self(regf_rs::Hive::new_empty("ROOT"))
    }
}

impl HiveBuilder {
    pub fn set(mut self, path: &str, name: &str, value: Value) -> Self {
        self.0.create_key(path).expect("test key can be made");
        self.0
            .set_value(path, name, value)
            .expect("test value can be set");
        self
    }

    pub fn build(mut self) -> Vec<u8> {
        self.0.to_bytes()
    }
}
