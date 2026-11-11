use std::cell::RefCell;
use std::ffi::c_char;

use gio::glib::{self, prelude::*, subclass::prelude::*, translate::ToGlibPtr};
use gio::prelude::*;

use super::{IDENTITY_VARIABLES, TOKEN_VARIABLES};
use crate::tasks::block_on;

const LUFT_APP: &str = "com.lantharos.";
const INSTALLED_LUFT_APPS: &str = "/usr/lib/sabine/com.lantharos.";

fn is_luft_app(app: &gio::AppInfo) -> bool {
    app.id().is_some_and(|id| id.starts_with(LUFT_APP))
        || glib::find_program_in_path(app.executable())
            .and_then(|program| std::fs::canonicalize(program).ok())
            .is_some_and(|program| program.starts_with(INSTALLED_LUFT_APPS))
}

/// Gives every program but Luft's own apps your environment, which this app
/// doesn't carry, since Luft's apps start with only what they need.
fn hand_on_your_environment(context: &gio::AppLaunchContext) {
    let Some(yours) =
        block_on(async { luft_dbus::environment::yours(luft_dbus::session().await.ok()?).await })
    else {
        return;
    };
    for (name, value) in yours {
        context.setenv(name, value);
    }
}

/// A launch context for `app` that hands it `token`, in its environment and
/// in the platform data of D-Bus activated apps.
pub fn context(app: &gio::AppInfo, token: Option<&str>) -> gio::AppLaunchContext {
    let context = glib::Object::new::<TokenContext>();
    context.imp().token.replace(token.map(str::to_owned));
    let context = context.upcast::<gio::AppLaunchContext>();
    if !is_luft_app(app) {
        hand_on_your_environment(&context);
    }
    for variable in IDENTITY_VARIABLES {
        context.unsetenv(variable);
    }
    for variable in TOKEN_VARIABLES {
        match token {
            Some(token) => context.setenv(variable, token),
            None => context.unsetenv(variable),
        }
    }
    context
}

mod imp {
    use super::*;

    #[derive(Default)]
    pub struct TokenContext {
        pub token: RefCell<Option<String>>,
    }

    #[glib::object_subclass]
    impl ObjectSubclass for TokenContext {
        const NAME: &'static str = "LuftTokenLaunchContext";
        type Type = super::TokenContext;
        type ParentType = gio::AppLaunchContext;
    }

    impl ObjectImpl for TokenContext {}
}

glib::wrapper! {
    pub struct TokenContext(ObjectSubclass<imp::TokenContext>) @extends gio::AppLaunchContext;
}

unsafe impl IsSubclassable<imp::TokenContext> for gio::AppLaunchContext {
    fn class_init(class: &mut glib::Class<Self>) {
        Self::parent_class_init::<imp::TokenContext>(class);
        class.as_mut().get_startup_notify_id = Some(startup_notify_id);
    }
}

unsafe extern "C" fn startup_notify_id(
    context: *mut gio::ffi::GAppLaunchContext,
    _: *mut gio::ffi::GAppInfo,
    _: *mut glib::ffi::GList,
) -> *mut c_char {
    let instance = unsafe { &*context.cast::<<imp::TokenContext as ObjectSubclass>::Instance>() };
    instance.imp().token.borrow().as_deref().to_glib_full()
}
