import { describe, expect, test } from 'bun:test';

import { luftVersionAtLeast, parseLuftVersion } from './luftVersion.js';

describe('versions of Luft', () => {
  test('nightlies come before the release they lead to', () => {
    const ordered = ['1.0-nightly.26', '1.1-nightly.21', '1.1', '1.2-nightly.3', '1.2-nightly.21', '1.2', '1.10-nightly.3', '2.0-nightly.1', '2.0'];
    for (const [index, version] of ordered.entries()) {
      for (const earlier of ordered.slice(0, index + 1)) expect(luftVersionAtLeast(version, earlier)).toBe(true);
      for (const later of ordered.slice(index + 1)) expect(luftVersionAtLeast(version, later)).toBe(false);
    }
  });

  test('only versions of Luft are read', () => {
    for (const text of ['dev', '1', '1.2-nightly.', '1.x', '', '1.2.3', '1.2-nightly.3-nightly.4']) expect(parseLuftVersion(text)).toBeNull();
    expect(luftVersionAtLeast('dev', '1.0')).toBe(false);
  });
});
