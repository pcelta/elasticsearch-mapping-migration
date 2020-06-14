import { CommandInterface } from './interface/command.interface';
import { Command } from 'commander';

export class CommandManager {
  constructor(private process: any, private commander: Command, private commands: CommandInterface[]) {
  }

  public async boot(): Promise<void>  {
    await this.commands.map((command) => {
      command.register(this.commander);
    });

    this.commander.parse(this.process.argv);
  }
}
