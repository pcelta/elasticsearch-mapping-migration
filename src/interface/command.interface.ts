import { Command } from 'commander';

export interface CommandInterface {
  register(commander: Command): void;
  run(): void;
}
