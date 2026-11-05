use sabine_service::browser_profile_path;

const PARTITION: &str = "portal";

pub fn forget(app_id: &str) {
    let pages = browser_profile_path(app_id).join(format!("guest-{PARTITION}"));
    if let Err(error) = std::fs::remove_dir_all(&pages)
        && error.kind() != std::io::ErrorKind::NotFound
    {
        eprintln!(
            "The last sign-in's cookies couldn't be cleared from {}: {error}",
            pages.display()
        );
    }
}
