declare const global: import('gi://Shell').default.Global;

interface GjsImports {
  _promiseNative: {
    setMainLoopHook(hook: () => void): void;
  };
}
