use std::cell::RefCell;
use std::ffi::c_char;

use gio::glib::{self, prelude::*, subclass::prelude::*, translate::ToGlibPtr};
use gio::prelude::*;

use super::{IDENTITY_VARIABLES, TOKEN_VARIABLES};

/// A launch context that hands `token` to the app it starts, in its
/// environment and in the platform data of D-Bus activated apps.
pub fn context(token: Option<&str>) -> gio::AppLaunchContext {
    let context = glib::Object::new::<TokenContext>();
    context.imp().token.replace(token.map(str::to_owned));
    for variable in IDENTITY_VARIABLES {
        context.unsetenv(variable);
    }
    for variable in TOKEN_VARIABLES {
        match token {
            Some(token) => context.setenv(variable, token),
            None => context.unsetenv(variable),
        }
    }
    context.upcast()
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
