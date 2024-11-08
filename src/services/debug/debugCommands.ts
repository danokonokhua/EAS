import { loggerService } from './loggerService';
import { networkMonitor } from './networkMonitor';
import { performanceProfiler } from './performanceProfiler';
import { deviceConnection } from './deviceConnection';

interface DebugCommand {
  name: string;
  description: string;
  execute: (...args: any[]) => Promise<any>;
}

class DebugCommands {
  private static instance: DebugCommands;
  private commands: Map<string, DebugCommand> = new Map();

  private constructor() {
    this.registerDefaultCommands();
  }

  static getInstance(): DebugCommands {
    if (!DebugCommands.instance) {
      DebugCommands.instance = new DebugCommands();
    }
    return DebugCommands.instance;
  }

  private registerDefaultCommands() {
    // Network commands
    this.registerCommand({
      name: 'clearNetwork',
      description: 'Clear all network logs',
      execute: async () => {
        networkMonitor.clearLogs();
        return 'Network logs cleared';
      },
    });

    // Performance commands
    this.registerCommand({
      name: 'startProfiling',
      description: 'Start performance profiling',
      execute: async (interval?: number) => {
        performanceProfiler.startRecording(interval);
        return 'Performance profiling started';
      },
    });

    // Device commands
    this.registerCommand({
      name: 'getDeviceInfo',
      description: 'Get device information',
      execute: async () => {
        return deviceConnection.getDeviceInformation();
      },
    });

    // Log commands
    this.registerCommand({
      name: 'clearLogs',
      description: 'Clear all debug logs',
      execute: async () => {
        loggerService.clearLogs();
        return 'Logs cleared';
      },
    });
  }

  registerCommand(command: DebugCommand) {
    this.commands.set(command.name, command);
  }

  async executeCommand(name: string, ...args: any[]) {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`Command "${name}" not found`);
    }

    try {
      return await command.execute(...args);
    } catch (error) {
      loggerService.error(`Failed to execute command "${name}"`, error as Error);
      throw error;
    }
  }

  getCommands(): DebugCommand[] {
    return Array.from(this.commands.values());
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }
}

export const debugCommands = DebugCommands.getInstance();

