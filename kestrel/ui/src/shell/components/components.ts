import * as Main from '../main.js';
import * as automountManager from './automountManager.js';
import * as autorunManager from './autorunManager.js';
import * as networkAgent from './networkAgent.js';
import * as polkitAgent from './polkitAgent.js';

interface Component {
  enable(): void;
  disable(): void;
}

const COMPONENTS: Record<string, { Component: new () => Component }> = { automountManager, autorunManager, networkAgent, polkitAgent };

export class ComponentManager {
  readonly allComponents: Record<string, Component> = {};
  private enabledComponents: string[] = [];

  constructor() {
    Main.sessionMode.connect('updated', () => this.sessionModeUpdated());
    this.sessionModeUpdated();
  }

  private sessionModeUpdated(): void {
    const enabled = Main.sessionMode.components;

    for (const name of enabled.filter(name => !this.enabledComponents.includes(name))) {
      try {
        this.ensureComponent(name)?.enable();
      } catch (error) {
        logError(error);
      }
    }

    for (const name of this.enabledComponents.filter(name => !enabled.includes(name))) this.allComponents[name]?.disable();

    this.enabledComponents = enabled;
  }

  private ensureComponent(name: string): Component | null {
    if (this.allComponents[name]) return this.allComponents[name];
    if (Main.sessionMode.isLocked) return null;

    return this.allComponents[name] = new COMPONENTS[name].Component();
  }
}
