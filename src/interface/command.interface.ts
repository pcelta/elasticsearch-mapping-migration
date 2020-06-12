import * as commander from 'commander';

export interface CommandInterface {
  register(command: commander.Command): void;
  run(): void;
}
