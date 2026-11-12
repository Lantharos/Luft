luft_dbus::errors!("com.lantharos.Changes1.Error" {
    Invalid,
});

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("Only Kestrel can apply changes someone reviewed.".to_owned())
    }
}
