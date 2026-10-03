use std::ffi::c_int;

use crate::Session;
use crate::kestrel::{Answer, Choice, Field, Kind, Message};
use crate::library::{
    AuthForm, FORM_CANCELLED, FORM_IGNORE, FORM_NEW_GROUP, FORM_OK, FORM_PASSWORD, FORM_SELECT,
    FORM_TEXT, FormOption, SelectOption, text,
};

struct Asked {
    option: *mut FormOption,
    field: Field,
}

fn choices(option: *mut FormOption) -> Vec<Choice> {
    let select = unsafe { &*option.cast::<SelectOption>() };
    (0..usize::try_from(select.choice_count).unwrap_or(0))
        .map(|index| unsafe { &**select.choices.add(index) })
        .map(|choice| Choice {
            name: text(choice.name).unwrap_or_default(),
            label: text(choice.label)
                .or_else(|| text(choice.name))
                .unwrap_or_default(),
        })
        .collect()
}

fn label(option: &FormOption, name: &str) -> String {
    let label = text(option.label).unwrap_or_default();
    let label = label.trim().trim_end_matches(':').trim();
    if label.is_empty() {
        name.to_owned()
    } else {
        label.to_owned()
    }
}

fn asked(session: &Session, auth_id: &str, form: &AuthForm) -> Vec<Asked> {
    let mut asked = Vec::new();
    let mut pointer = form.options;
    while let Some(option) = unsafe { pointer.as_ref() } {
        let current = pointer;
        pointer = option.next;
        if option.flags & FORM_IGNORE != 0 {
            continue;
        }
        let kind = match option.kind {
            FORM_TEXT => Kind::Text,
            FORM_PASSWORD => Kind::Password,
            FORM_SELECT => Kind::Choice,
            _ => continue,
        };
        let name = text(option.name).unwrap_or_default();
        let choices = if let Kind::Choice = kind {
            choices(current)
        } else {
            Vec::new()
        };
        let group_choice = (current == form.group.cast())
            .then(|| choices.get(usize::try_from(form.group_selection).unwrap_or(0)))
            .flatten()
            .map(|choice| choice.name.clone());
        let value = match kind {
            Kind::Password => String::new(),
            _ => group_choice
                .or_else(|| {
                    let key = format!("form:{auth_id}:{name}");
                    session
                        .remembered
                        .get(&key)
                        .or_else(|| session.secrets.get(&key))
                        .cloned()
                })
                .or_else(|| text(option.value))
                .or_else(|| choices.first().map(|choice| choice.name.clone()))
                .unwrap_or_default(),
        };
        asked.push(Asked {
            option: current,
            field: Field {
                label: label(option, &name),
                name,
                kind,
                value,
                choices,
            },
        });
    }
    asked
}

pub unsafe fn fill(session: &mut Session, form: &mut AuthForm) -> c_int {
    let auth_id = text(form.auth_id).unwrap_or_default();
    let (options, fields): (Vec<_>, Vec<_>) = asked(session, &auth_id, form)
        .into_iter()
        .map(|asked| (asked.option, asked.field))
        .unzip();
    if fields.is_empty() {
        return FORM_OK;
    }
    let message = [text(form.banner), text(form.message)]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>()
        .join("\n");
    let error = text(form.error).unwrap_or_default();
    let Some(Answer::Values { values }) = session.kestrel.ask(&Message::Form {
        message,
        error,
        fields: &fields,
    }) else {
        return FORM_CANCELLED;
    };
    let mut result = FORM_OK;
    for (option, field) in options.into_iter().zip(&fields) {
        let value = values.get(&field.name).unwrap_or(&field.value);
        session.library().set_option(option, value);
        if field.kind != Kind::Password {
            session
                .remembered
                .insert(format!("form:{auth_id}:{}", field.name), value.clone());
        }
        if option == form.group.cast() && *value != field.value {
            form.group_selection = field
                .choices
                .iter()
                .position(|choice| choice.name == *value)
                .map_or(0, |index| index as c_int);
            result = FORM_NEW_GROUP;
        }
    }
    result
}
