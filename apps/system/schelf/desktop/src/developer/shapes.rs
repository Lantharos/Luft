use super::answer::Shape;

macro_rules! shapes {
    ($($name:ident),* $(,)?) => {
        $(
            pub enum $name {}

            impl Shape for $name {
                const NAME: &'static str = stringify!($name);
            }
        )*
    };
}

shapes!(
    Account,
    Approval,
    ChannelAccess,
    Members,
    Namespaces,
    Project,
    Projects,
    Promoted,
    PublisherDomain,
    PublisherTools,
    Release,
    Releases,
    Stats,
    VerificationState,
);
