import * as Main from '../main.js';
import * as automountManager from './automountManager.js';
import * as autorunManager from './autorunManager.js';
import * as networkAgent from './networkAgent.js';
import * as polkitAgent from './polkitAgent.js';

const COMPONENTS = {automountManager, autorunManager, networkAgent, polkitAgent};

export class ComponentManager {
    constructor() {
        this._allComponents = {};
        this._enabledComponents = [];

        Main.sessionMode.connect('updated', () => {
            this._sessionModeUpdated().catch(logError);
        });

        this._sessionModeUpdated().catch(logError);
    }

    async _sessionModeUpdated() {
        const newEnabledComponents = Main.sessionMode.components;

        await Promise.allSettled([...newEnabledComponents
            .filter(name => !this._enabledComponents.includes(name))
            .map(name => this._enableComponent(name))]);

        this._enabledComponents
            .filter(name => !newEnabledComponents.includes(name))
            .forEach(name => this._disableComponent(name));

        this._enabledComponents = newEnabledComponents;
    }

    async _ensureComponent(name) {
        let component = this._allComponents[name];
        if (component)
            return component;

        if (Main.sessionMode.isLocked)
            return null;

        const constructor = COMPONENTS[name].Component;
        component = new constructor();
        this._allComponents[name] = component;
        return component;
    }

    async _enableComponent(name) {
        const component = await this._ensureComponent(name);
        if (component)
            component.enable();
    }

    _disableComponent(name) {
        const component = this._allComponents[name];
        if (component == null)
            return;
        component.disable();
    }
}
