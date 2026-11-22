use luft_policy::AccountsPolicy;

/// AccountsService asks for this one permission to add, remove and change other people's
/// accounts, administrators among them.
const ADMINISTRATION: &str = "org.freedesktop.accounts.user-administration";

/// The polkit rule that keeps people from changing accounts, or none while the policy lets them.
pub fn rules(accounts: &AccountsPolicy) -> Option<String> {
    (!accounts.add || !accounts.administrators).then(|| {
        format!(
            "polkit.addRule(function (action, subject) {{\n    if (action.id == \"{ADMINISTRATION}\" && subject.user != \"root\") {{\n        return polkit.Result.NO;\n    }}\n}});\n"
        )
    })
}
