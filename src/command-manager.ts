import { CommandInterface } from './interface/command.interface';
import { Command } from 'commander';

export class CommandManager {
  constructor(private process: any, private commander: Command, private commands: CommandInterface[]) {
  }

  public async boot(): Promise<void>  {

    const migrateCommand = this.commander.createCommand('migrate');
    await this.commands.map((command) => {
      command.register(migrateCommand);
    });

    migrateCommand.parse(this.process.argv);
  }
}
