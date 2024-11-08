import { loggerService } from './loggerService';

interface DebugPlugin {
  name: string;
  version: string;
  initialize: () => Promise<void>;
  cleanup: () => Promise<void>;
  onEvent?: (event: any) => void;
}

class PluginSystem {
  private static instance: PluginSystem;
  private plugins: Map<string, DebugPlugin> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  async registerPlugin(plugin: DebugPlugin) {
    try {
      if (this.plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is already registered`);
      }

      await plugin.initialize();
      this.plugins.set(plugin.name, plugin);
      
      loggerService.info('Plugin registered', {
        name: plugin.name,
        version: plugin.version
      });
    } catch (error) {
      loggerService.error(`Failed to register plugin ${plugin.name}`, error as Error);
    }
  }

  async unregisterPlugin(pluginName: string) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        await plugin.cleanup();
        this.plugins.delete(pluginName);
        
        loggerService.info('Plugin unregistered', { name: pluginName });
      }
    } catch (error) {
      loggerService.error(`Failed to unregister plugin ${pluginName}`, error as Error);
    }
  }

  async broadcastEvent(event: any) {
    for (const [name, plugin] of this.plugins) {
      try {
        if (plugin.onEvent) {
          await plugin.onEvent(event);
        }
      } catch (error) {
        loggerService.error(`Plugin ${name} failed to handle event`, error as Error);
      }
    }
  }

  getPlugin(name: string): DebugPlugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): DebugPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginSystem = PluginSystem.getInstance();
