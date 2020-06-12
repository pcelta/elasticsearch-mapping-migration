import { Command } from 'commander';

export interface CommandInterface {
  register(commandManager: Command): void;
  run(): void;
}
