export function parse<D extends object, P extends object = Partial<D>>(params: P = {} as P, defaults: D, allowExtras = false): D & P {
  if (!allowExtras) {
    for (const prop in params) {
      if (!(prop in defaults))
        throw new Error(`Unrecognized parameter "${prop}"`);
    }
  }

  return { ...defaults, ...params };
}
