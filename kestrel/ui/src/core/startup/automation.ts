import Meta from 'gi://Meta';

interface AutomationScript {
  run(): Promise<void>;
}

async function runAutomation(automation: AutomationScript): Promise<void> {
  try {
    await automation.run();
  } catch (err) {
    logError(err as object, 'Script failed');
    Meta.exit(Meta.ExitCode.ERROR);
  }

  global.context.terminate();
}

export async function loadAutomation(): Promise<(() => Promise<void>) | null> {
  const { automationScript } = global;
  if (!automationScript) return null;

  const automation: AutomationScript = await import(automationScript.get_uri());
  return () => runAutomation(automation);
}
