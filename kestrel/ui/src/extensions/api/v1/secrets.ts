import Gio from 'gi://Gio';
import Secret from 'gi://Secret';

import type { ApiContext } from './context.js';
import type { Secrets } from './types.js';

Gio._promisify(Secret, 'password_store', 'password_store_finish');
Gio._promisify(Secret, 'password_lookup', 'password_lookup_finish');
Gio._promisify(Secret, 'password_clear', 'password_clear_finish');

const SCHEMA = Secret.Schema.new('com.lantharos.Kestrel.ExtensionSecret', Secret.SchemaFlags.NONE, {
  extension: Secret.SchemaAttributeType.STRING,
  key: Secret.SchemaAttributeType.STRING,
});

/** Deletes every secret an extension kept, when it's removed. */
export function forgetSecrets(id: string): void {
  Secret.password_clear(SCHEMA, { extension: id }, null).catch(() => {});
}

export function secretsApi({ manifest, name }: ApiContext): Secrets {
  const attributes = (key: string) => ({ extension: manifest.id, key });
  return {
    get: key => Secret.password_lookup(SCHEMA, attributes(key), null).then(secret => secret ?? null, () => null),
    set: async (key, secret) => {
      await Secret.password_store(SCHEMA, attributes(key), Secret.COLLECTION_DEFAULT, `${name}: ${key}`, secret, null);
    },
    delete: async key => {
      await Secret.password_clear(SCHEMA, attributes(key), null);
    },
  };
}
