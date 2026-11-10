import Polkit from 'gi://Polkit';

interface AsyncPermission {
  'new'(actionId: string, subject: null, cancellable: null): Promise<Polkit.Permission>;
}

export const ownPermission = (actionId: string): Promise<Polkit.Permission> =>
  (Polkit.Permission as unknown as AsyncPermission).new(actionId, null, null);
