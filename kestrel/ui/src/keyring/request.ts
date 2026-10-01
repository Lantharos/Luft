import type GLib from 'gi://GLib';

export const ALLOWED = 0;
export const DENIED = 1;
export const DISMISSED = 2;

type Options = Record<string, GLib.Variant>;

interface Common {
  title: string;
  body: string;
  app: string;
  icon: string;
  fingerprint: boolean;
}

export interface AccessRequest extends Common {
  allow: string;
  deny: string;
  remember: boolean;
}

export interface PasswordRequest extends Common {
  label: string;
  warning: string;
  numeric: boolean;
  confirm: boolean;
  continue: string;
}

const DEFAULT_ICON = 'dialog-password-symbolic';

function text(options: Options, key: string, fallback = ''): string {
  return (options[key]?.deepUnpack() as string | undefined) || fallback;
}

function flag(options: Options, key: string): boolean {
  return options[key]?.deepUnpack() === true;
}

function common(options: Options): Common {
  return {
    title: text(options, 'title'),
    body: text(options, 'body'),
    app: text(options, 'app'),
    icon: text(options, 'icon', DEFAULT_ICON),
    fingerprint: flag(options, 'fingerprint'),
  };
}

export function accessRequest(options: Options): AccessRequest {
  return {
    ...common(options),
    allow: text(options, 'allow', 'Allow'),
    deny: text(options, 'deny', 'Don’t Allow'),
    remember: flag(options, 'remember'),
  };
}

export function passwordRequest(options: Options): PasswordRequest {
  return {
    ...common(options),
    label: text(options, 'label', 'Password'),
    warning: text(options, 'warning'),
    numeric: flag(options, 'numeric'),
    confirm: flag(options, 'confirm'),
    continue: text(options, 'continue', 'Unlock'),
  };
}
