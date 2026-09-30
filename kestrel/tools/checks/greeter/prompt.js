export function promptState({styled}) {
  const entry = styled('login-dialog-prompt-entry')[0] ?? null;
  const message = styled('login-dialog-message').find(label => label.opacity > 0) ?? null;
  return {
    entry,
    hint: entry?.hint_text ?? null,
    secret: entry?.constructor.name.includes('PasswordEntry') ?? false,
    message: message?.text ?? null,
    warning: message?.has_style_class_name('login-dialog-message-warning') ?? false,
  };
}

export function lastSessionStart(events) {
  return events().filter(event => event.type === 'create_session').at(-1)?.username ?? null;
}
